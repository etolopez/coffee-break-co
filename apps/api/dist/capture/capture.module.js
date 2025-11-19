"use strict";
/**
 * Capture module for Coffee Digital Passport API
 * Handles EPCIS event ingestion with validation and persistence
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptureModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const capture_controller_1 = require("./capture.controller");
const capture_service_1 = require("./capture.service");
const idempotency_service_1 = require("./idempotency.service");
const validation_module_1 = require("../validation/validation.module");
const redis_module_1 = require("../redis/redis.module");
let CaptureModule = class CaptureModule {
};
exports.CaptureModule = CaptureModule;
exports.CaptureModule = CaptureModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [validation_module_1.ValidationModule, redis_module_1.RedisModule],
        controllers: [capture_controller_1.CaptureController],
        providers: [capture_service_1.CaptureService, idempotency_service_1.IdempotencyService],
        exports: [capture_service_1.CaptureService, idempotency_service_1.IdempotencyService],
    })
], CaptureModule);
//# sourceMappingURL=capture.module.js.map