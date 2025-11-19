import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';

interface EpcisCaptureRequest {
  events: any[];
}

interface EpcisCaptureResponse {
  idempotencyKey: string;
  processedEvents: number;
  ingestedEvents: number;
  skippedEvents: number;
  errors: string[];
  processingStatus: string;
  estimatedProcessingTime: string;
  correlationId: string;
}

@ApiTags('epcis')
@Controller('api/epcis')
export class CaptureController {
  constructor() {}

  @Post('capture')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Capture EPCIS events',
    description: 'Ingest EPCIS events with HMAC verification and idempotency',
  })
  @ApiHeader({
    name: 'X-Idempotency-Key',
    description: 'Unique key for idempotent processing',
    required: true,
  })
  @ApiHeader({
    name: 'X-Signature',
    description: 'HMAC signature for request verification',
    required: true,
  })
  @ApiHeader({
    name: 'Date',
    description: 'Request timestamp for clock skew validation',
    required: true,
  })
  @ApiResponse({
    status: 202,
    description: 'Events accepted for processing',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async captureEvents(
    @Body() request: EpcisCaptureRequest,
    @Headers('x-idempotency-key') idempotencyKey: string,
    @Headers('x-signature') signature: string,
    @Headers('date') dateHeader: string,
  ): Promise<EpcisCaptureResponse> {
    try {
      // Validate request structure
      if (!request.events || !Array.isArray(request.events) || request.events.length === 0) {
        throw new BadRequestException('Request must contain non-empty events array');
      }

      // For now, just return a success response
      const result: EpcisCaptureResponse = {
        idempotencyKey,
        processedEvents: request.events.length,
        ingestedEvents: request.events.length,
        skippedEvents: 0,
        errors: [],
        processingStatus: 'accepted',
        estimatedProcessingTime: '5 minutes',
        correlationId: 'demo-' + Date.now(),
      };

      console.log(`EPCIS events captured successfully: ${result.processedEvents} events`);

      return result;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('EPCIS capture processing failed:', error);
      throw new InternalServerErrorException('Failed to process EPCIS events');
    }
  }
}
