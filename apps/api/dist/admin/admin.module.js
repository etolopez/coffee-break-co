"use strict";
/**
 * Admin Module
 * Handles admin-only endpoints and dashboard
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const database_module_1 = require("../database/database.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map