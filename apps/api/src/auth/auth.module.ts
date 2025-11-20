/**
 * Authentication Module
 * Handles user authentication, JWT tokens, and password management
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from '../database/database.module';

// Get JWT secret from environment or use default
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key-change-in-production';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule, // Ensure ConfigModule is imported
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') || JWT_SECRET;
        return {
          secret,
          signOptions: {
            expiresIn: '7d', // Token expires in 7 days
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: JwtStrategy,
      useFactory: (authService: AuthService) => {
        return new JwtStrategy(JWT_SECRET, authService);
      },
      inject: [AuthService],
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

