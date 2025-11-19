"use strict";
/**
 * Coffee Module
 * Module for coffee-related functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoffeeModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const coffee_controller_1 = require("./coffee.controller");
const coffee_service_1 = require("./coffee.service");
let CoffeeModule = class CoffeeModule {
};
exports.CoffeeModule = CoffeeModule;
exports.CoffeeModule = CoffeeModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [coffee_controller_1.CoffeeController],
        providers: [coffee_service_1.CoffeeService],
        exports: [coffee_service_1.CoffeeService],
    })
], CoffeeModule);
//# sourceMappingURL=coffee.module.js.map