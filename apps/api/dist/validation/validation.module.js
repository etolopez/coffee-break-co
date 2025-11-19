"use strict";
/**
 * Validation Module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const validation_service_1 = require("./validation.service");
let ValidationModule = class ValidationModule {
};
exports.ValidationModule = ValidationModule;
exports.ValidationModule = ValidationModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [validation_service_1.ValidationService],
        exports: [validation_service_1.ValidationService],
    })
], ValidationModule);
//# sourceMappingURL=validation.module.js.map