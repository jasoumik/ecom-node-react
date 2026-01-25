import { Injectable, Inject } from '@nestjs/common';
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
  private otpStore = new Map<string, { otp: string, expires: number }>();

  async generateOtp(identifier: string) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
      this.otpStore.set(identifier, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min
      
      // Determine channel
      const isEmail = identifier.includes('@');
      await this.notificationService.sendOTP(identifier, isEmail ? 'email' : 'sms', otp);
      
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
      if (!isValid) throw new Error('Invalid or expired OTP');
      
      let user = await this.knex('users')
        .where({ phone: identifier })
        .orWhere({ email: identifier })
        .first();
        
      if (!user) {
          // Auto-register if new user? Or throw error?
          // Let's throw error for now, or create a temp user.
          // For simplicity, assume user must exist or we create a skeleton user.
          // Let's create a new user if phone number.
          if (!identifier.includes('@')) {
             const [newUser] = await this.knex('users').insert({
                 phone: identifier,
                 name: 'New User',
                 passwordHash: 'otp-login', // Placeholder
                 role: 'customer'
             }).returning('*');
             user = newUser;
          } else {
              throw new Error('User not found');
          }
      }
      
      const { passwordHash, ...result } = user;
      return this.login(result);
  }
}
