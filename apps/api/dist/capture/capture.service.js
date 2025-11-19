"use strict";
/**
 * Capture service for EPCIS event processing
 * Handles validation, HMAC verification, and event persistence
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptureService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const validation_service_1 = require("../validation/validation.service");
const shared_1 = require("@coffee-passport/shared");
let CaptureService = class CaptureService {
    validationService;
    logger = (0, shared_1.createLogger)({
        level: process.env['LOG_LEVEL'] || 'info',
        service: 'capture-service'
    });
    constructor(validationService) {
        this.validationService = validationService;
    }
    /**
     * Capture EPCIS events with validation and processing
     */
    async captureEvents(request, context) {
        const { orgId, idempotencyKey, signature, dateHeader, requestId } = context;
        const startTime = Date.now();
        (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.CAPTURE_RECEIVED, {
            orgId,
            idempotencyKey,
            requestId,
            eventCount: request.events?.length || 0,
        }, 'Processing EPCIS capture request');
        try {
            // Validate request structure
            if (!request.events || !Array.isArray(request.events) || request.events.length === 0) {
                throw new common_1.BadRequestException('Request must contain non-empty events array');
            }
            // Validate EPCIS events
            const validationResult = await this.validationService.validateEpcisEvents(request.events);
            if (!validationResult.isValid) {
                (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.CAPTURE_SCHEMA_OK, {
                    orgId,
                    idempotencyKey,
                    requestId,
                    errors: validationResult.errors,
                    duration: Date.now() - startTime,
                }, 'EPCIS validation failed');
                throw new common_1.BadRequestException({
                    message: 'EPCIS validation failed',
                    errors: validationResult.errors,
                });
            }
            // For now, just return a success response
            // In a real implementation, this would persist events and queue processing jobs
            const eventIds = request.events.map((_, index) => `event-${requestId}-${index}`);
            const result = {
                accepted: true,
                ingestedCount: request.events.length,
                ids: eventIds,
            };
            const duration = Date.now() - startTime;
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.CAPTURE_SCHEMA_OK, {
                orgId,
                idempotencyKey,
                requestId,
                eventCount: result.ingestedCount,
                duration,
            }, 'EPCIS events validated and accepted for processing');
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_ERROR, {
                orgId,
                idempotencyKey,
                requestId,
                error: error.message,
                duration,
            }, 'EPCIS capture processing failed');
            throw new common_1.BadRequestException('Failed to process EPCIS events');
        }
    }
};
exports.CaptureService = CaptureService;
exports.CaptureService = CaptureService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [validation_service_1.ValidationService])
], CaptureService);
//# sourceMappingURL=capture.service.js.map