import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.identifier, body.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body);
  }

  @Post('otp/send')
  async sendOtp(@Body() body: { identifier: string }) {
      return this.authService.generateOtp(body.identifier);
  }

  @Post('otp/login')
  async loginOtp(@Body() body: { identifier: string; otp: string }) {
      return this.authService.loginWithOtp(body.identifier, body.otp);
  }
}
