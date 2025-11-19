/**
 * Idempotency service for preventing duplicate request processing
 * Uses Redis for fast idempotency key storage and retrieval
 */
import { RedisService } from '../redis/redis.service';
import { EpcisCaptureResponse } from '@coffee-passport/shared';
export declare class IdempotencyService {
    private readonly redisService;
    private readonly logger;
    private readonly DEFAULT_TTL;
    constructor(redisService: RedisService);
    /**
     * Get existing response for an idempotency key
     */
    getResponse(idempotencyKey: string, orgId: string): Promise<EpcisCaptureResponse | null>;
    /**
     * Store response for an idempotency key
     */
    storeResponse(idempotencyKey: string, orgId: string, response: EpcisCaptureResponse): Promise<void>;
    /**
     * Check if an idempotency key is being processed
     */
    isProcessing(idempotencyKey: string, orgId: string): Promise<boolean>;
    /**
     * Mark an idempotency key as being processed
     */
    markProcessing(idempotencyKey: string, orgId: string): Promise<boolean>;
    /**
     * Release processing lock for an idempotency key
     */
    releaseProcessing(idempotencyKey: string, orgId: string): Promise<void>;
    /**
     * Clean up expired idempotency keys
     */
    cleanupExpired(): Promise<number>;
    /**
     * Build Redis key for idempotency response
     */
    private buildKey;
    /**
     * Build Redis key for processing lock
     */
    private buildProcessingKey;
}
//# sourceMappingURL=idempotency.service.d.ts.map