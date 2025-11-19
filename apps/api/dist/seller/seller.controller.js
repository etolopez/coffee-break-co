"use strict";
/**
 * Seller Controller
 * REST API endpoints for seller data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const seller_service_1 = require("./seller.service");
let SellerController = class SellerController {
    sellerService;
    constructor(sellerService) {
        this.sellerService = sellerService;
    }
    async getAllSellers() {
        const sellers = await this.sellerService.getAllSellers();
        return {
            success: true,
            data: sellers,
        };
    }
    async getSellerById(id) {
        const seller = await this.sellerService.getSellerById(id);
        if (!seller) {
            return { success: false, error: 'Seller not found' };
        }
        return {
            success: true,
            data: seller,
        };
    }
};
exports.SellerController = SellerController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all sellers',
        description: 'Retrieve all sellers with their coffee data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of sellers',
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SellerController.prototype, "getAllSellers", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get seller by ID',
        description: 'Retrieve a specific seller by their ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Seller ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Seller details',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Seller not found',
    }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], SellerController.prototype, "getSellerById", null);
exports.SellerController = SellerController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('seller'),
    (0, common_1.Controller)('api/sellers'),
    tslib_1.__metadata("design:paramtypes", [seller_service_1.SellerService])
], SellerController);
//# sourceMappingURL=seller.controller.js.map