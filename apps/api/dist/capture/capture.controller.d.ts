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
export declare class CaptureController {
    constructor();
    captureEvents(request: EpcisCaptureRequest, idempotencyKey: string, signature: string, dateHeader: string): Promise<EpcisCaptureResponse>;
}
export {};
//# sourceMappingURL=capture.controller.d.ts.map