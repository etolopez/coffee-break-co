/**
 * Winston-based logging utilities for Coffee Digital Passport
 * Implements structured logging with correlation IDs and waypoint tracking
 */
import winston from 'winston';
/**
 * Creates a Winston logger instance
 * @param options - Logger configuration options
 * @returns Configured Winston logger
 */
export declare function createLogger(options?: {
    level?: string;
    service?: string;
    environment?: string;
    correlationId?: string;
}): winston.Logger;
/**
 * Logging waypoints for consistent tracking
 * Use these stable keys for correlation and monitoring
 */
export declare const LOG_WAYPOINTS: {
    readonly RESOLVER_REQUEST: "resolver.request";
    readonly RESOLVER_ROUTE: "resolver.route";
    readonly RESOLVER_TELEMETRY: "resolver.telemetry";
    readonly CAPTURE_RECEIVED: "capture.received";
    readonly CAPTURE_AUTH_OK: "capture.auth_ok";
    readonly CAPTURE_HMAC_OK: "capture.hmac_ok";
    readonly CAPTURE_IDEM_OK: "capture.idem_ok";
    readonly CAPTURE_SCHEMA_OK: "capture.schema_ok";
    readonly CAPTURE_SHACL_OK: "capture.shacl_ok";
    readonly CAPTURE_PERSISTED: "capture.persisted";
    readonly CAPTURE_QUEUED: "capture.queued";
    readonly CAPTURE_ERROR: "capture.error";
    readonly VALIDATION_JSON_SCHEMA: "validation.json_schema";
    readonly VALIDATION_SHACL: "validation.shacl";
    readonly VALIDATION_ERROR: "validation.error";
    readonly JOB_STARTED: "job.started";
    readonly JOB_COMPLETED: "job.completed";
    readonly JOB_FAILED: "job.failed";
    readonly JOB_RETRY: "job.retry";
    readonly DB_QUERY: "db.query";
    readonly DB_TRANSACTION: "db.transaction";
    readonly DB_ERROR: "db.error";
    readonly EXTERNAL_REQUEST: "external.request";
    readonly EXTERNAL_RESPONSE: "external.response";
    readonly EXTERNAL_ERROR: "external.error";
};
/**
 * Creates a child logger with correlation context
 * @param parentLogger - Parent logger instance
 * @param correlationId - Request correlation ID
 * @param additionalMeta - Additional metadata
 * @returns Child logger with correlation context
 */
export declare function createCorrelatedLogger(parentLogger: winston.Logger, correlationId: string, additionalMeta?: Record<string, any>): winston.Logger;
/**
 * Logs a waypoint with consistent structure
 * @param logger - Logger instance
 * @param waypoint - Waypoint key from LOG_WAYPOINTS
 * @param meta - Additional metadata
 * @param message - Human readable message
 */
export declare function logWaypoint(logger: winston.Logger, waypoint: string, meta?: Record<string, any>, message?: string): void;
/**
 * Logs an error with waypoint context
 * @param logger - Logger instance
 * @param waypoint - Waypoint key from LOG_WAYPOINTS
 * @param error - Error object
 * @param meta - Additional metadata
 * @param message - Human readable message
 */
export declare function logError(logger: winston.Logger, waypoint: string, error: Error, meta?: Record<string, any>, message?: string): void;
/**
 * Logs performance metrics
 * @param logger - Logger instance
 * @param waypoint - Waypoint key from LOG_WAYPOINTS
 * @param durationMs - Duration in milliseconds
 * @param meta - Additional metadata
 */
export declare function logPerformance(logger: winston.Logger, waypoint: string, durationMs: number, meta?: Record<string, any>): void;
/**
 * Creates request logging metadata
 * @param req - Express/Fastify request object
 * @returns Request metadata for logging
 */
export declare function createRequestMeta(req: any): {
    method: any;
    url: any;
    userAgent: any;
    ip: any;
    correlationId: any;
    orgId: any;
    userId: any;
};
/**
 * Logs incoming request
 * @param logger - Logger instance
 * @param req - Express/Fastify request object
 */
export declare function logIncomingRequest(logger: winston.Logger, req: any): void;
/**
 * Logs outgoing response
 * @param logger - Logger instance
 * @param req - Express/Fastify request object
 * @param res - Express/Fastify response object
 * @param durationMs - Request duration in milliseconds
 */
export declare function logOutgoingResponse(logger: winston.Logger, req: any, res: any, durationMs: number): void;
//# sourceMappingURL=logger.d.ts.map