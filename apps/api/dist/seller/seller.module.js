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
const seller_coffee_controller_1 = require("./seller-coffee.controller");
const seller_coffee_service_1 = require("./seller-coffee.service");
const coffee_module_1 = require("../coffee/coffee.module");
let SellerModule = class SellerModule {
};
exports.SellerModule = SellerModule;
exports.SellerModule = SellerModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [coffee_module_1.CoffeeModule],
        controllers: [seller_controller_1.SellerController, seller_coffee_controller_1.SellerCoffeeController],
        providers: [seller_service_1.SellerService, seller_coffee_service_1.SellerCoffeeService],
        exports: [seller_service_1.SellerService, seller_coffee_service_1.SellerCoffeeService],
    })
], SellerModule);
//# sourceMappingURL=seller.module.js.map