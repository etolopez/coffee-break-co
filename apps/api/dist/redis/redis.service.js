"use strict";
/**
 * Redis Service
 * Handles Redis operations
 * Stub implementation for MVP (in-memory storage)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
let RedisService = class RedisService {
    cache = new Map();
    /**
     * Get value from Redis
     */
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt < Date.now()) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    /**
     * Set value in Redis with expiration
     */
    async setex(key, seconds, value) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + seconds * 1000,
        });
    }
    /**
     * Check if key exists
     */
    async exists(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (entry.expiresAt < Date.now()) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Set if not exists
     */
    async setnx(key, value) {
        if (await this.exists(key)) {
            return false;
        }
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + 3600 * 1000, // 1 hour default
        });
        return true;
    }
    /**
     * Set expiration on key
     */
    async expire(key, seconds) {
        const entry = this.cache.get(key);
        if (entry) {
            entry.expiresAt = Date.now() + seconds * 1000;
        }
    }
    /**
     * Delete key
     */
    async del(key) {
        this.cache.delete(key);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map