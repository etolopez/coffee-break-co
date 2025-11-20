"use strict";
/**
 * Authentication Service
 * Handles user authentication, registration, and JWT token management
 */
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = tslib_1.__importStar(require("bcrypt"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    /**
     * Register a new user
     */
    async register(registerDto) {
        const { email, password, name, role = 'customer' } = registerDto;
        try {
            // Check if user already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (existingUser) {
                throw new common_1.ConflictException('User with this email already exists');
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
        }
        catch (error) {
            // Check for various Prisma database connection errors
            const prismaErrorCodes = ['P1001', 'P1002', 'P1003', 'P1008', 'P1010', 'P1011', 'P1017'];
            const isDatabaseError = prismaErrorCodes.includes(error.code) ||
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
                    throw new common_1.ConflictException('Database migration not applied. Please check Railway logs and ensure migrations have run.');
                }
                throw new common_1.ConflictException('Database is not available. Please check your database connection.');
            }
            throw error;
        }
    }
    /**
     * Login user
     */
    async login(loginDto) {
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
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid email or password');
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
        }
        catch (error) {
            // Log the full error details for debugging
            this.logger.error('Login error details', {
                code: error.code,
                message: error.message,
                meta: error.meta,
                stack: error.stack,
                name: error.name,
            });
            // Check for various Prisma database connection errors
            const prismaErrorCodes = ['P1001', 'P1002', 'P1003', 'P1008', 'P1010', 'P1011', 'P1017', 'P2001', 'P2002', 'P2003'];
            const isDatabaseError = prismaErrorCodes.includes(error.code) ||
                error.message?.includes('database') ||
                error.message?.includes('connection') ||
                error.message?.includes('timeout') ||
                error.message?.includes('ECONNREFUSED') ||
                error.message?.includes('relation "users" does not exist') ||
                error.message?.includes('does not exist') ||
                error.code?.startsWith('P'); // Any Prisma error code
            if (isDatabaseError) {
                this.logger.error('Database connection error during login', {
                    code: error.code,
                    message: error.message,
                    meta: error.meta,
                });
                // Provide more specific error message
                if (error.message?.includes('relation "users" does not exist') || error.message?.includes('does not exist')) {
                    throw new common_1.UnauthorizedException('Database migration not applied. The users table does not exist. Please check Railway logs and ensure migrations have run.');
                }
                throw new common_1.UnauthorizedException('Database is not available. Please check your database connection.');
            }
            // If it's already a NestJS exception, rethrow it
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw error;
        }
    }
    /**
     * Validate user from JWT payload
     */
    async validateUser(userId) {
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
    generateToken(userId, email, role) {
        const payload = { sub: userId, email, role };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map