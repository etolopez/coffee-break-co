/**
 * Redis Service
 * Handles Redis operations
 * Stub implementation for MVP (in-memory storage)
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();

  /**
   * Get value from Redis
   */
  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  /**
   * Set value in Redis with expiration
   */
  async setex(key: string, seconds: number, value: string): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + seconds * 1000,
    });
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Set if not exists
   */
  async setnx(key: string, value: string): Promise<boolean> {
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
  async expire(key: string, seconds: number): Promise<void> {
    const entry = this.cache.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + seconds * 1000;
    }
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
