/**
 * JWT Strategy
 * Validates JWT tokens for protected routes
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // Get JWT secret - try ConfigService first, then env var, then default
    let jwtSecret = 'your-secret-key-change-in-production';
    try {
      if (configService) {
        jwtSecret = configService.get<string>('JWT_SECRET') || jwtSecret;
      }
    } catch (e) {
      // Fallback to environment variable
      jwtSecret = process.env['JWT_SECRET'] || jwtSecret;
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

