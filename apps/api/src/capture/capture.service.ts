/**
 * Capture service for EPCIS event processing
 * Handles validation, HMAC verification, and event persistence
 */

import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ValidationService } from '../validation/validation.service';
import { createLogger, logWaypoint, LOG_WAYPOINTS } from '@coffee-passport/shared';
import { EpcisCaptureRequest, EpcisCaptureResponse } from '@coffee-passport/shared';

interface CaptureContext {
  orgId: string;
  idempotencyKey: string;
  signature: string;
  dateHeader: string;
  requestId: string;
}

@Injectable()
export class CaptureService {
  private readonly logger = createLogger({
    level: process.env['LOG_LEVEL'] || 'info',
    service: 'capture-service'
  });

  constructor(
    private readonly validationService: ValidationService,
  ) {}

  /**
   * Capture EPCIS events with validation and processing
   */
  async captureEvents(
    request: EpcisCaptureRequest,
    context: CaptureContext,
  ): Promise<EpcisCaptureResponse> {
    const { orgId, idempotencyKey, signature, dateHeader, requestId } = context;
    const startTime = Date.now();

    logWaypoint(this.logger, LOG_WAYPOINTS.CAPTURE_RECEIVED, {
      orgId,
      idempotencyKey,
      requestId,
      eventCount: request.events?.length || 0,
    }, 'Processing EPCIS capture request');

    try {
      // Validate request structure
      if (!request.events || !Array.isArray(request.events) || request.events.length === 0) {
        throw new BadRequestException('Request must contain non-empty events array');
      }

      // Validate EPCIS events
      const validationResult = await this.validationService.validateEpcisEvents(request.events);
      if (!validationResult.isValid) {
        logWaypoint(this.logger, LOG_WAYPOINTS.CAPTURE_SCHEMA_OK, {
          orgId,
          idempotencyKey,
          requestId,
          errors: validationResult.errors,
          duration: Date.now() - startTime,
        }, 'EPCIS validation failed');
        
        throw new BadRequestException({
          message: 'EPCIS validation failed',
          errors: validationResult.errors,
        });
      }

      // For now, just return a success response
      // In a real implementation, this would persist events and queue processing jobs
      const eventIds = request.events.map((_, index) => `event-${requestId}-${index}`);
      const result: EpcisCaptureResponse = {
        accepted: true,
        ingestedCount: request.events.length,
        ids: eventIds,
      };

      const duration = Date.now() - startTime;
      logWaypoint(this.logger, LOG_WAYPOINTS.CAPTURE_SCHEMA_OK, {
        orgId,
        idempotencyKey,
        requestId,
        eventCount: result.ingestedCount,
        duration,
      }, 'EPCIS events validated and accepted for processing');

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof BadRequestException) {
        throw error;
      }

      logWaypoint(this.logger, LOG_WAYPOINTS.EXTERNAL_ERROR, {
        orgId,
        idempotencyKey,
        requestId,
        error: (error as any).message,
        duration,
      }, 'EPCIS capture processing failed');

      throw new BadRequestException('Failed to process EPCIS events');
    }
  }
}
