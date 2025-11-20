/**
 * Authentication Service
 * Handles user authentication, registration, and JWT token management
 */

import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
  role?: 'customer' | 'seller' | 'admin';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    avatar: string | null;
  };
  token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name, role = 'customer' } = registerDto;

    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name || null,
          role,
          profile: {
            create: {}, // Create empty profile
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
        },
      });

      // Generate JWT token
      const token = this.generateToken(user.id, user.email, user.role);

      this.logger.log(`User registered: ${user.email} (${user.role})`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      };
    } catch (error: any) {
      // Check for various Prisma database connection errors
      const prismaErrorCodes = ['P1001', 'P1002', 'P1003', 'P1008', 'P1010', 'P1011', 'P1017'];
      const isDatabaseError = 
        prismaErrorCodes.includes(error.code) ||
        error.message?.includes('database') ||
        error.message?.includes('connection') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('relation "users" does not exist'); // Table doesn't exist (migration not run)
      
      if (isDatabaseError) {
        this.logger.error('Database connection error during registration', {
          code: error.code,
          message: error.message,
        });
        
        // Provide more specific error message
        if (error.message?.includes('relation "users" does not exist')) {
          throw new ConflictException('Database migration not applied. Please check Railway logs and ensure migrations have run.');
        }
        
        throw new ConflictException('Database is not available. Please check your database connection.');
      }
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken(user.id, user.email, user.role);

      this.logger.log(`User logged in: ${user.email} (${user.role})`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      };
    } catch (error: any) {
      // Check for various Prisma database connection errors
      const prismaErrorCodes = ['P1001', 'P1002', 'P1003', 'P1008', 'P1010', 'P1011', 'P1017'];
      const isDatabaseError = 
        prismaErrorCodes.includes(error.code) ||
        error.message?.includes('database') ||
        error.message?.includes('connection') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('relation "users" does not exist'); // Table doesn't exist (migration not run)
      
      if (isDatabaseError) {
        this.logger.error('Database connection error during login', {
          code: error.code,
          message: error.message,
        });
        
        // Provide more specific error message
        if (error.message?.includes('relation "users" does not exist')) {
          throw new UnauthorizedException('Database migration not applied. Please check Railway logs and ensure migrations have run.');
        }
        
        throw new UnauthorizedException('Database is not available. Please check your database connection.');
      }
      throw error;
    }
  }

  /**
   * Validate user from JWT payload
   */
  async validateUser(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    return user;
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}

