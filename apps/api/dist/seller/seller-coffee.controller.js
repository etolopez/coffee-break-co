"use strict";
/**
 * Seller Coffee Controller
 * REST API endpoints for sellers to manage their coffees
 */
var SellerCoffeeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerCoffeeController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const seller_coffee_service_1 = require("./seller-coffee.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let SellerCoffeeController = SellerCoffeeController_1 = class SellerCoffeeController {
    sellerCoffeeService;
    logger = new common_1.Logger(SellerCoffeeController_1.name);
    constructor(sellerCoffeeService) {
        this.sellerCoffeeService = sellerCoffeeService;
    }
    /**
     * Get all coffees for the current seller
     */
    async getMyCoffees(user) {
        return this.sellerCoffeeService.getMyCoffees(user.id);
    }
    /**
     * Get a specific coffee by ID (must belong to seller)
     */
    async getCoffeeById(id, user) {
        return this.sellerCoffeeService.getCoffeeById(id, user.id);
    }
    /**
     * Create a new coffee
     */
    async createCoffee(coffeeData, user) {
        return this.sellerCoffeeService.createCoffee(coffeeData, user.id);
    }
    /**
     * Update a coffee (must belong to seller)
     */
    async updateCoffee(id, coffeeData, user) {
        return this.sellerCoffeeService.updateCoffee(id, coffeeData, user.id);
    }
    /**
     * Delete a coffee (must belong to seller)
     */
    async deleteCoffee(id, user) {
        return this.sellerCoffeeService.deleteCoffee(id, user.id);
    }
};
exports.SellerCoffeeController = SellerCoffeeController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all coffees for current seller' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coffees retrieved successfully' }),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SellerCoffeeController.prototype, "getMyCoffees", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get coffee by ID (seller only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coffee retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coffee not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SellerCoffeeController.prototype, "getCoffeeById", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new coffee' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Coffee created successfully' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SellerCoffeeController.prototype, "createCoffee", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a coffee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coffee updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coffee not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SellerCoffeeController.prototype, "updateCoffee", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a coffee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coffee deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coffee not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SellerCoffeeController.prototype, "deleteCoffee", null);
exports.SellerCoffeeController = SellerCoffeeController = SellerCoffeeController_1 = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('seller-coffee'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/seller/coffees'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('seller', 'admin'),
    tslib_1.__metadata("design:paramtypes", [seller_coffee_service_1.SellerCoffeeService])
], SellerCoffeeController);
//# sourceMappingURL=seller-coffee.controller.js.map