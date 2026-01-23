import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    // Try to find by phone first, then email
    let user = await this.usersService.findOneByPhone(identifier);
    if (!user) {
        user = await this.usersService.findOneByEmail(identifier);
    }

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { phone: user.phone, email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    };
  }

  async register(userData: any) {
    if (!userData.phone) {
        throw new BadRequestException('Phone number is required');
    }

    const existingUser = await this.usersService.findOneByPhone(userData.phone);
    if (existingUser) {
        throw new BadRequestException('Phone number already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(userData.password, salt);
    
    const newUser = await this.usersService.create({
      phone: userData.phone,
      email: userData.email || null,
      passwordHash,
      name: userData.name,
      role: userData.role || 'customer',
    });

    const { passwordHash: _, ...result } = newUser;
    return result;
  }
}
