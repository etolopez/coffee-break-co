"use strict";
/**
 * Coffee Controller
 * REST API endpoints for coffee data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoffeeController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const coffee_service_1 = require("./coffee.service");
let CoffeeController = class CoffeeController {
    coffeeService;
    constructor(coffeeService) {
        this.coffeeService = coffeeService;
    }
    async getAllCoffees(sellerId) {
        const coffees = await this.coffeeService.getAllCoffees(sellerId);
        return coffees;
    }
    async getCoffeeById(id) {
        const coffee = await this.coffeeService.getCoffeeById(id);
        if (!coffee) {
            return { error: 'Coffee not found' };
        }
        return coffee;
    }
    async getCoffeeBySlug(slug) {
        const coffee = await this.coffeeService.getCoffeeBySlug(slug);
        if (!coffee) {
            return { error: 'Coffee not found' };
        }
        return coffee;
    }
};
exports.CoffeeController = CoffeeController;
tslib_1.__decorate([
    (0, public_decorator_1.Public)() // Make coffee listings public
    ,
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all coffee entries',
        description: 'Retrieve all coffee entries, optionally filtered by seller ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sellerId',
        required: false,
        description: 'Filter coffees by seller ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of coffee entries',
    }),
    tslib_1.__param(0, (0, common_1.Query)('sellerId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CoffeeController.prototype, "getAllCoffees", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)() // Make coffee details public
    ,
    (0, swagger_1.ApiOperation)({
        summary: 'Get coffee by ID',
        description: 'Retrieve a specific coffee entry by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Coffee entry ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Coffee entry details',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Coffee entry not found',
    }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CoffeeController.prototype, "getCoffeeById", null);
tslib_1.__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, public_decorator_1.Public)() // Make coffee details by slug public
    ,
    (0, swagger_1.ApiOperation)({
        summary: 'Get coffee by slug',
        description: 'Retrieve a specific coffee entry by its slug',
    }),
    (0, swagger_1.ApiParam)({
        name: 'slug',
        description: 'Coffee entry slug',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Coffee entry details',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Coffee entry not found',
    }),
    tslib_1.__param(0, (0, common_1.Param)('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CoffeeController.prototype, "getCoffeeBySlug", null);
exports.CoffeeController = CoffeeController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('coffee'),
    (0, common_1.Controller)('api/coffee-entries'),
    tslib_1.__metadata("design:paramtypes", [coffee_service_1.CoffeeService])
], CoffeeController);
//# sourceMappingURL=coffee.controller.js.map