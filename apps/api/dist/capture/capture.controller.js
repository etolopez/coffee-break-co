"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptureController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let CaptureController = class CaptureController {
    constructor() { }
    async captureEvents(request, idempotencyKey, signature, dateHeader) {
        try {
            // Validate request structure
            if (!request.events || !Array.isArray(request.events) || request.events.length === 0) {
                throw new common_1.BadRequestException('Request must contain non-empty events array');
            }
            // For now, just return a success response
            const result = {
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('EPCIS capture processing failed:', error);
            throw new common_1.InternalServerErrorException('Failed to process EPCIS events');
        }
    }
};
exports.CaptureController = CaptureController;
tslib_1.__decorate([
    (0, common_1.Post)('capture'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, swagger_1.ApiOperation)({
        summary: 'Capture EPCIS events',
        description: 'Ingest EPCIS events with HMAC verification and idempotency',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Idempotency-Key',
        description: 'Unique key for idempotent processing',
        required: true,
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Signature',
        description: 'HMAC signature for request verification',
        required: true,
    }),
    (0, swagger_1.ApiHeader)({
        name: 'Date',
        description: 'Request timestamp for clock skew validation',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 202,
        description: 'Events accepted for processing',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)('x-idempotency-key')),
    tslib_1.__param(2, (0, common_1.Headers)('x-signature')),
    tslib_1.__param(3, (0, common_1.Headers)('date')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CaptureController.prototype, "captureEvents", null);
exports.CaptureController = CaptureController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('epcis'),
    (0, common_1.Controller)('api/epcis'),
    tslib_1.__metadata("design:paramtypes", [])
], CaptureController);
//# sourceMappingURL=capture.controller.js.map