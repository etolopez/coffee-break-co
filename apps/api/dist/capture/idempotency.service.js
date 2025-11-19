"use strict";
/**
 * Idempotency service for preventing duplicate request processing
 * Uses Redis for fast idempotency key storage and retrieval
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const shared_1 = require("@coffee-passport/shared");
let IdempotencyService = class IdempotencyService {
    redisService;
    logger = (0, shared_1.createLogger)({
        level: process.env['LOG_LEVEL'] || 'info',
        service: 'idempotency-service'
    });
    DEFAULT_TTL = 24 * 60 * 60; // 24 hours in seconds
    constructor(redisService) {
        this.redisService = redisService;
    }
    /**
     * Get existing response for an idempotency key
     */
    async getResponse(idempotencyKey, orgId) {
        try {
            const key = this.buildKey(idempotencyKey, orgId);
            const response = await this.redisService.get(key);
            if (response) {
                (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.CAPTURE_IDEM_OK, {
                    orgId,
                    idempotencyKey,
                }, 'Idempotency hit - returning cached response');
                return JSON.parse(response);
            }
            return null;
        }
        catch (error) {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_ERROR, {
                orgId,
                idempotencyKey,
                error: error.message,
            }, 'Failed to retrieve idempotency response');
            // Don't fail the request if idempotency lookup fails
            return null;
        }
    }
    /**
     * Store response for an idempotency key
     */
    async storeResponse(idempotencyKey, orgId, response) {
        try {
            const key = this.buildKey(idempotencyKey, orgId);
            const responseJson = JSON.stringify(response);
            await this.redisService.setex(key, this.DEFAULT_TTL, responseJson);
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.CAPTURE_IDEM_OK, {
                orgId,
                idempotencyKey,
                ttl: this.DEFAULT_TTL,
            }, 'Idempotency response stored successfully');
        }
        catch (error) {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_ERROR, {
                orgId,
                idempotencyKey,
                error: error.message,
            }, 'Failed to store idempotency response');
            // Don't fail the request if idempotency storage fails
        }
    }
    /**
     * Check if an idempotency key is being processed
     */
    async isProcessing(idempotencyKey, orgId) {
        try {
            const key = this.buildProcessingKey(idempotencyKey, orgId);
            const exists = await this.redisService.exists(key);
            return exists;
        }
        catch (error) {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_ERROR, {
                orgId,
                idempotencyKey,
                error: error.message,
            }, 'Failed to check processing status');
            return false;
        }
    }
    /**
     * Mark an idempotency key as being processed
     */
    async markProcessing(idempotencyKey, orgId) {
        try {
            const key = this.buildProcessingKey(idempotencyKey, orgId);
            const ttl = 300; // 5 minutes for processing lock
            const acquired = await this.redisService.setnx(key, 'processing');
            if (acquired) {
                await this.redisService.expire(key, ttl);
                (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.CAPTURE_IDEM_OK, {
                    orgId,
                    idempotencyKey,
                    ttl,
                }, 'Processing lock acquired');
            }
            return acquired;
        }
        catch (error) {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_ERROR, {
                orgId,
                idempotencyKey,
                error: error.message,
            }, 'Failed to acquire processing lock');
            return false;
        }
    }
    /**
     * Release processing lock for an idempotency key
     */
    async releaseProcessing(idempotencyKey, orgId) {
        try {
            const key = this.buildProcessingKey(idempotencyKey, orgId);
            await this.redisService.del(key);
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.CAPTURE_IDEM_OK, {
                orgId,
                idempotencyKey,
            }, 'Processing lock released');
        }
        catch (error) {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_ERROR, {
                orgId,
                idempotencyKey,
                error: error.message,
            }, 'Failed to release processing lock');
        }
    }
    /**
     * Clean up expired idempotency keys
     */
    async cleanupExpired() {
        try {
            // This is a simplified cleanup - in production you'd use Redis TTL and scan
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.CAPTURE_IDEM_OK, {}, 'Idempotency cleanup completed');
            return 0;
        }
        catch (error) {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_ERROR, {
                error: error.message,
            }, 'Failed to cleanup expired idempotency keys');
            return 0;
        }
    }
    /**
     * Build Redis key for idempotency response
     */
    buildKey(idempotencyKey, orgId) {
        return `idempotency:${orgId}:${idempotencyKey}`;
    }
    /**
     * Build Redis key for processing lock
     */
    buildProcessingKey(idempotencyKey, orgId) {
        return `processing:${orgId}:${idempotencyKey}`;
    }
};
exports.IdempotencyService = IdempotencyService;
exports.IdempotencyService = IdempotencyService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [redis_service_1.RedisService])
], IdempotencyService);
//# sourceMappingURL=idempotency.service.js.map