"use strict";
/**
 * Admin Controller
 * Handles admin-only endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }
    async getAllUsers() {
        return this.adminService.getAllUsers();
    }
    async getAllSellers() {
        return this.adminService.getAllSellers();
    }
    async getAllCoffees() {
        return this.adminService.getAllCoffees();
    }
};
exports.AdminController = AdminController;
tslib_1.__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard stats retrieved successfully' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
tslib_1.__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
tslib_1.__decorate([
    (0, common_1.Get)('sellers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sellers (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sellers retrieved successfully' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "getAllSellers", null);
tslib_1.__decorate([
    (0, common_1.Get)('coffees'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all coffees (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coffees retrieved successfully' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "getAllCoffees", null);
exports.AdminController = AdminController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    tslib_1.__metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map