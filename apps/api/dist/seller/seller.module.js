"use strict";
/**
 * Seller Module
 * Module for seller-related functionality
 * Uses PrismaService from DatabaseModule (global)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const seller_controller_1 = require("./seller.controller");
const seller_service_1 = require("./seller.service");
let SellerModule = class SellerModule {
};
exports.SellerModule = SellerModule;
exports.SellerModule = SellerModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [seller_controller_1.SellerController],
        providers: [seller_service_1.SellerService],
        exports: [seller_service_1.SellerService],
    })
], SellerModule);
//# sourceMappingURL=seller.module.js.map