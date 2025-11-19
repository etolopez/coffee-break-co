/**
 * Capture module for Coffee Digital Passport API
 * Handles EPCIS event ingestion with validation and persistence
 */

import { Module } from '@nestjs/common';
import { CaptureController } from './capture.controller';
import { CaptureService } from './capture.service';
import { IdempotencyService } from './idempotency.service';
import { ValidationModule } from '../validation/validation.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [ValidationModule, RedisModule],
  controllers: [CaptureController],
  providers: [CaptureService, IdempotencyService],
  exports: [CaptureService, IdempotencyService],
})
export class CaptureModule {}
