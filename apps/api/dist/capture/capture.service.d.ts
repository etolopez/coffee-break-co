/**
 * Capture service for EPCIS event processing
 * Handles validation, HMAC verification, and event persistence
 */
import { ValidationService } from '../validation/validation.service';
import { EpcisCaptureRequest, EpcisCaptureResponse } from '@coffee-passport/shared';
interface CaptureContext {
    orgId: string;
    idempotencyKey: string;
    signature: string;
    dateHeader: string;
    requestId: string;
}
export declare class CaptureService {
    private readonly validationService;
    private readonly logger;
    constructor(validationService: ValidationService);
    /**
     * Capture EPCIS events with validation and processing
     */
    captureEvents(request: EpcisCaptureRequest, context: CaptureContext): Promise<EpcisCaptureResponse>;
}
export {};
//# sourceMappingURL=capture.service.d.ts.map