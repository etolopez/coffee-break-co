/**
 * Idempotency service for preventing duplicate request processing
 * Uses Redis for fast idempotency key storage and retrieval
 */

import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { createLogger, logWaypoint, LOG_WAYPOINTS } from '@coffee-passport/shared';
import { EpcisCaptureResponse } from '@coffee-passport/shared';

@Injectable()
export class IdempotencyService {
  private readonly logger = createLogger({
    level: process.env['LOG_LEVEL'] || 'info',
    service: 'idempotency-service'
  });

  private readonly DEFAULT_TTL = 24 * 60 * 60; // 24 hours in seconds

  constructor(private readonly redisService: RedisService) {}

  /**
   * Get existing response for an idempotency key
   */
  async getResponse(idempotencyKey: string, orgId: string): Promise<EpcisCaptureResponse | null> {
    try {
      const key = this.buildKey(idempotencyKey, orgId);
      const response = await this.redisService.get(key);
      
      if (response) {
        logWaypoint(this.logger, LOG_WAYPOINTS.CAPTURE_IDEM_OK, {
          orgId,
          idempotencyKey,
        }, 'Idempotency hit - returning cached response');
        
        return JSON.parse(response);
      }
      
      return null;
    } catch (error) {
      logWaypoint(this.logger, LOG_WAYPOINTS.EXTERNAL_ERROR, {
        orgId,
        idempotencyKey,
        error: (error as any).message,
      }, 'Failed to retrieve idempotency response');
      
      // Don't fail the request if idempotency lookup fails
      return null;
    }
  }

  /**
   * Store response for an idempotency key
   */
  async storeResponse(
    idempotencyKey: string,
    orgId: string,
    response: EpcisCaptureResponse,
  ): Promise<void> {
    try {
      const key = this.buildKey(idempotencyKey, orgId);
      const responseJson = JSON.stringify(response);
      
      await this.redisService.setex(key, this.DEFAULT_TTL, responseJson);
      
      logWaypoint(this.logger, LOG_WAYPOINTS.CAPTURE_IDEM_OK, {
        orgId,
        idempotencyKey,
        ttl: this.DEFAULT_TTL,
      }, 'Idempotency response stored successfully');
      
    } catch (error) {
      logWaypoint(this.logger, LOG_WAYPOINTS.EXTERNAL_ERROR, {
        orgId,
        idempotencyKey,
        error: (error as any).message,
      }, 'Failed to store idempotency response');
      
      // Don't fail the request if idempotency storage fails
    }
  }

  /**
   * Check if an idempotency key is being processed
   */
  async isProcessing(idempotencyKey: string, orgId: string): Promise<boolean> {
    try {
      const key = this.buildProcessingKey(idempotencyKey, orgId);
      const exists = await this.redisService.exists(key);
      return exists;
    } catch (error) {
      logWaypoint(this.logger, LOG_WAYPOINTS.EXTERNAL_ERROR, {
        orgId,
        idempotencyKey,
        error: (error as any).message,
      }, 'Failed to check processing status');
      
      return false;
    }
  }

  /**
   * Mark an idempotency key as being processed
   */
  async markProcessing(idempotencyKey: string, orgId: string): Promise<boolean> {
    try {
      const key = this.buildProcessingKey(idempotencyKey, orgId);
      const ttl = 300; // 5 minutes for processing lock
      
      const acquired = await this.redisService.setnx(key, 'processing');
      if (acquired) {
        await this.redisService.expire(key, ttl);
        logWaypoint(this.logger, LOG_WAYPOINTS.CAPTURE_IDEM_OK, {
          orgId,
          idempotencyKey,
          ttl,
        }, 'Processing lock acquired');
      }
      
      return acquired;
    } catch (error) {
      logWaypoint(this.logger, LOG_WAYPOINTS.EXTERNAL_ERROR, {
        orgId,
        idempotencyKey,
        error: (error as any).message,
      }, 'Failed to acquire processing lock');
      
      return false;
    }
  }

  /**
   * Release processing lock for an idempotency key
   */
  async releaseProcessing(idempotencyKey: string, orgId: string): Promise<void> {
    try {
      const key = this.buildProcessingKey(idempotencyKey, orgId);
      await this.redisService.del(key);
      
      logWaypoint(this.logger, LOG_WAYPOINTS.CAPTURE_IDEM_OK, {
        orgId,
        idempotencyKey,
      }, 'Processing lock released');
      
    } catch (error) {
      logWaypoint(this.logger, LOG_WAYPOINTS.EXTERNAL_ERROR, {
        orgId,
        idempotencyKey,
        error: (error as any).message,
      }, 'Failed to release processing lock');
    }
  }

  /**
   * Clean up expired idempotency keys
   */
  async cleanupExpired(): Promise<number> {
    try {
      // This is a simplified cleanup - in production you'd use Redis TTL and scan
      logWaypoint(this.logger, LOG_WAYPOINTS.CAPTURE_IDEM_OK, {}, 'Idempotency cleanup completed');
      return 0;
    } catch (error) {
      logWaypoint(this.logger, LOG_WAYPOINTS.EXTERNAL_ERROR, {
        error: (error as any).message,
      }, 'Failed to cleanup expired idempotency keys');
      
      return 0;
    }
  }

  /**
   * Build Redis key for idempotency response
   */
  private buildKey(idempotencyKey: string, orgId: string): string {
    return `idempotency:${orgId}:${idempotencyKey}`;
  }

  /**
   * Build Redis key for processing lock
   */
  private buildProcessingKey(idempotencyKey: string, orgId: string): string {
    return `processing:${orgId}:${idempotencyKey}`;
  }
}
