"use strict";
/**
 * JWT Strategy
 * Validates JWT tokens for protected routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../auth.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    authService;
    constructor(configService, authService) {
        // Get JWT secret - try ConfigService first, then env var, then default
        let jwtSecret = 'your-secret-key-change-in-production';
        try {
            if (configService) {
                jwtSecret = configService.get('JWT_SECRET') || jwtSecret;
            }
        }
        catch (e) {
            // Fallback to environment variable
            jwtSecret = process.env['JWT_SECRET'] || jwtSecret;
        }
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
        this.authService = authService;
    }
    async validate(payload) {
        const user = await this.authService.validateUser(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map