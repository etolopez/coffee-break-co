"use strict";
/**
 * Seller Controller
 * REST API endpoints for seller data
 */
var SellerController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const seller_service_1 = require("./seller.service");
let SellerController = SellerController_1 = class SellerController {
    sellerService;
    logger = new common_1.Logger(SellerController_1.name);
    constructor(sellerService) {
        this.sellerService = sellerService;
    }
    async getAllSellers() {
        try {
            const sellers = await this.sellerService.getAllSellers();
            return {
                success: true,
                data: sellers,
            };
        }
        catch (error) {
            this.logger.error('Error in getAllSellers controller', {
                message: error?.message,
                code: error?.code,
                meta: error?.meta,
                stack: error?.stack,
            });
            // Provide helpful error message for database schema issues
            if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
                throw new common_1.InternalServerErrorException({
                    success: false,
                    error: 'Database schema mismatch',
                    message: 'The database migration may not have been applied. Please check Railway logs.',
                    details: error?.message,
                });
            }
            // Generic error response
            throw new common_1.InternalServerErrorException({
                success: false,
                error: 'Failed to fetch sellers',
                message: error?.message || 'Internal server error',
                details: process.env['NODE_ENV'] === 'development' ? error?.stack : undefined,
            });
        }
    }
    async getSellerById(id) {
        try {
            const seller = await this.sellerService.getSellerById(id);
            if (!seller) {
                return { success: false, error: 'Seller not found' };
            }
            return {
                success: true,
                data: seller,
            };
        }
        catch (error) {
            this.logger.error(`Error in getSellerById controller for ID: ${id}`, {
                message: error?.message,
                code: error?.code,
                meta: error?.meta,
                stack: error?.stack,
            });
            if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
                throw new common_1.InternalServerErrorException({
                    success: false,
                    error: 'Database schema mismatch',
                    message: 'The database migration may not have been applied. Please check Railway logs.',
                    details: error?.message,
                });
            }
            throw new common_1.InternalServerErrorException({
                success: false,
                error: 'Failed to fetch seller',
                message: error?.message || 'Internal server error',
                details: process.env['NODE_ENV'] === 'development' ? error?.stack : undefined,
            });
        }
    }
};
exports.SellerController = SellerController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)() // Make seller listings public
    ,
    (0, swagger_1.ApiOperation)({
        summary: 'Get all sellers',
        description: 'Retrieve all sellers with their coffee data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of sellers',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SellerController.prototype, "getAllSellers", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
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
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], SellerController.prototype, "getSellerById", null);
exports.SellerController = SellerController = SellerController_1 = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('seller'),
    (0, common_1.Controller)('api/sellers'),
    tslib_1.__metadata("design:paramtypes", [seller_service_1.SellerService])
], SellerController);
//# sourceMappingURL=seller.controller.js.map