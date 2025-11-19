/**
 * Redis Service
 * Handles Redis operations
 * Stub implementation for MVP (in-memory storage)
 */
export declare class RedisService {
    private cache;
    /**
     * Get value from Redis
     */
    get(key: string): Promise<string | null>;
    /**
     * Set value in Redis with expiration
     */
    setex(key: string, seconds: number, value: string): Promise<void>;
    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Set if not exists
     */
    setnx(key: string, value: string): Promise<boolean>;
    /**
     * Set expiration on key
     */
    expire(key: string, seconds: number): Promise<void>;
    /**
     * Delete key
     */
    del(key: string): Promise<void>;
}
//# sourceMappingURL=redis.service.d.ts.map