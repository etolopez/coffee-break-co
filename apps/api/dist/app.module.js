"use strict";
/**
 * Coffee Digital Passport API - Main Application Module
 * Configures all modules and providers for the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const capture_module_1 = require("./capture/capture.module");
const coffee_module_1 = require("./coffee/coffee.module");
const seller_module_1 = require("./seller/seller.module");
const comments_module_1 = require("./comments/comments.module");
const app_controller_1 = require("./app.controller");
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
            capture_module_1.CaptureModule,
            coffee_module_1.CoffeeModule,
            seller_module_1.SellerModule,
            comments_module_1.CommentsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map