"use strict";
/**
 * Redis Module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [redis_service_1.RedisService],
        exports: [redis_service_1.RedisService],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map