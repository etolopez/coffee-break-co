"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("./auth/decorators/public.decorator");
let AppController = class AppController {
    getRoot() {
        return {
            message: 'Coffee Digital Passport API',
            version: '1.0.0',
            status: 'running',
            timestamp: new Date().toISOString(),
            endpoints: {
                root: 'GET /',
                health: 'GET /health',
                capture: 'POST /api/epcis/capture',
                coffees: 'GET /api/coffee-entries',
                sellers: 'GET /api/sellers'
            }
        };
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'API Root',
        description: 'Get API information and available endpoints',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'API information',
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
tslib_1.__decorate([
    (0, common_1.Get)('health'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Health Check',
        description: 'Check API health status',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'API is healthy',
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('app'),
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map