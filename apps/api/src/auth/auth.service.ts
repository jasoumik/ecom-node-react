import { Injectable, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.knex('users')
      .where({ phone: identifier })
      .orWhere({ email: identifier })
      .first();

    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.name, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user
    };
  }

  async register(userData: any) {
    // Check if user exists
    const existing = await this.knex('users')
        .where({ phone: userData.phone })
        .orWhere({ email: userData.email || '' })
        .first();
        
    if (existing) {
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const [user] = await this.knex('users').insert({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        passwordHash,
        role: 'customer'
    }).returning('*');

    const { passwordHash: _, ...result } = user;
    return this.login(result);
  }

  // OTP Logic
  private otpStore = new Map<string, { otp: string; expires: number }>();

  private isLikelyEmail(identifier: string): boolean {
    return identifier.includes('@') && identifier.includes('.');
  }

  private isLikelyBdPhone(identifier: string): boolean {
    // Very light BD mobile validation: 01XXXXXXXXX (11 digits) or +8801XXXXXXXXX (14 chars)
    const trimmed = identifier.replace(/\s+/g, '');
    return /^01[3-9]\d{8}$/.test(trimmed) || /^\+?8801[3-9]\d{8}$/.test(trimmed);
  }

  private async ensureUserForIdentifier(identifier: string) {
    // Try to find existing user by phone or email
    let user = await this.knex('users')
      .where({ phone: identifier })
      .orWhere({ email: identifier })
      .first();

    if (user) {
      return user;
    }

    const isEmail = this.isLikelyEmail(identifier);
    const isPhone = this.isLikelyBdPhone(identifier);

    if (!isEmail && !isPhone) {
      throw new BadRequestException('Invalid phone or email format');
    }

    const name = isEmail ? identifier.split('@')[0] || 'New Customer' : 'New Customer';

    // Because users.phone is NOT NULL in the DB, we must always provide a value.
    // For phone-based identifiers, use the real phone.
    // For email-based identifiers, generate a synthetic placeholder phone that encodes email.
    const phoneValue = isPhone ? identifier : `email:${identifier}`;

    const [newUser] = await this.knex('users')
      .insert({
        name,
        phone: phoneValue,
        email: isEmail ? identifier : null,
        // Mark that this user signed up via OTP; password is not used for login
        passwordHash: 'otp-login',
        role: 'customer',
        is_active: true,
      })
      .returning('*');

    return newUser;
  }

  async generateOtp(identifier: string) {
    const trimmed = (identifier || '').trim();

    // Ensure a user exists for this identifier before sending OTP
    const user = await this.ensureUserForIdentifier(trimmed);

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
    this.otpStore.set(trimmed, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min

    const isEmailId = this.isLikelyEmail(trimmed);
    const isPhoneId = this.isLikelyBdPhone(trimmed);

    if (isEmailId) {
      // Send OTP via email to the actual email address
      const toEmail = user.email || trimmed;
      await this.notificationService.sendOTP(toEmail, 'email', otp);
    } else if (isPhoneId) {
      // Send OTP via SMS only for phone identifiers
      const toPhone = trimmed;
      await this.notificationService.sendOTP(toPhone, 'sms', otp);
    } else {
      throw new BadRequestException('Invalid phone or email format');
    }

    return { message: 'OTP sent' };
  }

  async verifyOtp(identifier: string, otp: string) {
    const record = this.otpStore.get(identifier);
    if (!record) return false;
    if (Date.now() > record.expires) {
      this.otpStore.delete(identifier);
      return false;
    }
    if (record.otp === otp) {
      this.otpStore.delete(identifier);
      return true;
    }
    return false;
  }

  async loginWithOtp(identifier: string, otp: string) {
    const isValid = await this.verifyOtp(identifier, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.knex('users')
      .where({ phone: identifier })
      .orWhere({ email: identifier })
      .first();

    if (!user) {
      user = await this.ensureUserForIdentifier(identifier);
    }

    const { passwordHash, ...result } = user;
    return this.login(result);
  }
}
