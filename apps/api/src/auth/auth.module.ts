import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    UsersModule,
    NotificationModule,
    JwtModule.register({
      global: true,
      secret: 'secretKey', // In production, use env var
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
