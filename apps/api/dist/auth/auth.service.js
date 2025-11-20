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
    /**
     * Login user
     */
    async login(loginDto) {
        const { email, password } = loginDto;
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