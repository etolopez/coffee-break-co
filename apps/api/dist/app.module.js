"use strict";
/**
 * Coffee Digital Passport API - Main Application Module
 * Configures all modules and providers for the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const admin_module_1 = require("./admin/admin.module");
const capture_module_1 = require("./capture/capture.module");
const coffee_module_1 = require("./coffee/coffee.module");
const seller_module_1 = require("./seller/seller.module");
const comments_module_1 = require("./comments/comments.module");
const app_controller_1 = require("./app.controller");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.local'],
            }),
            database_module_1.DatabaseModule, // Global database module with Prisma service
            auth_module_1.AuthModule, // Authentication module
            users_module_1.UsersModule, // Users module (profiles, favorites)
            admin_module_1.AdminModule, // Admin module (dashboard, user management)
            capture_module_1.CaptureModule,
            coffee_module_1.CoffeeModule,
            seller_module_1.SellerModule,
            comments_module_1.CommentsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            // Make JWT auth guard global (all routes protected by default)
            // Use @Public() decorator to make routes public
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map