/**
 * Authentication Service
 * Handles user authentication, registration, and JWT token management
 */
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
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
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    /**
     * Register a new user
     */
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    /**
     * Login user
     */
    login(loginDto: LoginDto): Promise<AuthResponse>;
    /**
     * Validate user from JWT payload
     */
    validateUser(userId: string): Promise<any>;
    /**
     * Generate JWT token
     */
    private generateToken;
}
//# sourceMappingURL=auth.service.d.ts.map