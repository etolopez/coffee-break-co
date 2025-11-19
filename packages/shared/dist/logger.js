"use strict";
/**
 * Winston-based logging utilities for Coffee Digital Passport
 * Implements structured logging with correlation IDs and waypoint tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_WAYPOINTS = void 0;
exports.createLogger = createLogger;
exports.createCorrelatedLogger = createCorrelatedLogger;
exports.logWaypoint = logWaypoint;
exports.logError = logError;
exports.logPerformance = logPerformance;
exports.createRequestMeta = createRequestMeta;
exports.logIncomingRequest = logIncomingRequest;
exports.logOutgoingResponse = logOutgoingResponse;
const tslib_1 = require("tslib");
const winston_1 = tslib_1.__importDefault(require("winston"));
const winston_2 = require("winston");
// ============================================================================
// LOG FORMATS
// ============================================================================
/** Custom format for structured logging */
const structuredFormat = winston_2.format.combine(winston_2.format.timestamp({ format: 'ISO' }), winston_2.format.errors({ stack: true }), winston_2.format.json(), winston_2.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
}));
/** Development format with colors and readability */
const devFormat = winston_2.format.combine(winston_2.format.colorize(), winston_2.format.timestamp({ format: 'HH:mm:ss' }), winston_2.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
}));
// ============================================================================
// LOGGER FACTORY
// ============================================================================
/**
 * Creates a Winston logger instance
 * @param options - Logger configuration options
 * @returns Configured Winston logger
 */
function createLogger(options = {}) {
    const { level = process.env['LOG_LEVEL'] || 'info', service = 'coffee-passport', environment = process.env['NODE_ENV'] || 'development', correlationId } = options;
    // Determine format based on environment
    const logFormat = environment === 'production' ? structuredFormat : devFormat;
    // Create logger
    const logger = winston_1.default.createLogger({
        level,
        format: logFormat,
        defaultMeta: {
            service,
            environment,
            correlationId
        },
        transports: [
            // Console transport for all environments
            new winston_1.default.transports.Console({
                format: logFormat
            })
        ]
    });
    // Add file transport for production
    if (environment === 'production') {
        logger.add(new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }));
        logger.add(new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }));
    }
    return logger;
}
// ============================================================================
// LOGGING PATTERNS
// ============================================================================
/**
 * Logging waypoints for consistent tracking
 * Use these stable keys for correlation and monitoring
 */
exports.LOG_WAYPOINTS = {
    // Resolver waypoints
    RESOLVER_REQUEST: 'resolver.request',
    RESOLVER_ROUTE: 'resolver.route',
    RESOLVER_TELEMETRY: 'resolver.telemetry',
    // Capture waypoints
    CAPTURE_RECEIVED: 'capture.received',
    CAPTURE_AUTH_OK: 'capture.auth_ok',
    CAPTURE_HMAC_OK: 'capture.hmac_ok',
    CAPTURE_IDEM_OK: 'capture.idem_ok',
    CAPTURE_SCHEMA_OK: 'capture.schema_ok',
    CAPTURE_SHACL_OK: 'capture.shacl_ok',
    CAPTURE_PERSISTED: 'capture.persisted',
    CAPTURE_QUEUED: 'capture.queued',
    CAPTURE_ERROR: 'capture.error',
    // Validation waypoints
    VALIDATION_JSON_SCHEMA: 'validation.json_schema',
    VALIDATION_SHACL: 'validation.shacl',
    VALIDATION_ERROR: 'validation.error',
    // Job waypoints
    JOB_STARTED: 'job.started',
    JOB_COMPLETED: 'job.completed',
    JOB_FAILED: 'job.failed',
    JOB_RETRY: 'job.retry',
    // Database waypoints
    DB_QUERY: 'db.query',
    DB_TRANSACTION: 'db.transaction',
    DB_ERROR: 'db.error',
    // External service waypoints
    EXTERNAL_REQUEST: 'external.request',
    EXTERNAL_RESPONSE: 'external.response',
    EXTERNAL_ERROR: 'external.error'
};
// ============================================================================
// LOGGING HELPERS
// ============================================================================
/**
 * Creates a child logger with correlation context
 * @param parentLogger - Parent logger instance
 * @param correlationId - Request correlation ID
 * @param additionalMeta - Additional metadata
 * @returns Child logger with correlation context
 */
function createCorrelatedLogger(parentLogger, correlationId, additionalMeta = {}) {
    return parentLogger.child({
        correlationId,
        ...additionalMeta
    });
}
/**
 * Logs a waypoint with consistent structure
 * @param logger - Logger instance
 * @param waypoint - Waypoint key from LOG_WAYPOINTS
 * @param meta - Additional metadata
 * @param message - Human readable message
 */
function logWaypoint(logger, waypoint, meta = {}, message) {
    const logData = {
        at: waypoint,
        ...meta
    };
    if (message) {
        logger.info(message, logData);
    }
    else {
        logger.info(logData);
    }
}
/**
 * Logs an error with waypoint context
 * @param logger - Logger instance
 * @param waypoint - Waypoint key from LOG_WAYPOINTS
 * @param error - Error object
 * @param meta - Additional metadata
 * @param message - Human readable message
 */
function logError(logger, waypoint, error, meta = {}, message) {
    const logData = {
        at: waypoint,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        },
        ...meta
    };
    if (message) {
        logger.error(message, logData);
    }
    else {
        logger.error(logData);
    }
}
/**
 * Logs performance metrics
 * @param logger - Logger instance
 * @param waypoint - Waypoint key from LOG_WAYPOINTS
 * @param durationMs - Duration in milliseconds
 * @param meta - Additional metadata
 */
function logPerformance(logger, waypoint, durationMs, meta = {}) {
    logWaypoint(logger, waypoint, {
        ...meta,
        durationMs,
        performance: 'measured'
    });
}
// ============================================================================
// REQUEST LOGGING MIDDLEWARE
// ============================================================================
/**
 * Creates request logging metadata
 * @param req - Express/Fastify request object
 * @returns Request metadata for logging
 */
function createRequestMeta(req) {
    return {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection?.remoteAddress,
        correlationId: req.headers['x-correlation-id'] || req.id,
        orgId: req.user?.orgId,
        userId: req.user?.id
    };
}
/**
 * Logs incoming request
 * @param logger - Logger instance
 * @param req - Express/Fastify request object
 */
function logIncomingRequest(logger, req) {
    const meta = createRequestMeta(req);
    logWaypoint(logger, 'request.incoming', meta, 'Incoming request');
}
/**
 * Logs outgoing response
 * @param logger - Logger instance
 * @param req - Express/Fastify request object
 * @param res - Express/Fastify response object
 * @param durationMs - Request duration in milliseconds
 */
function logOutgoingResponse(logger, req, res, durationMs) {
    const meta = {
        ...createRequestMeta(req),
        statusCode: res.statusCode,
        durationMs
    };
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    const message = `Request completed in ${durationMs}ms`;
    if (level === 'warn') {
        logger.warn(message, { at: 'request.completed', ...meta });
    }
    else {
        logger.info(message, { at: 'request.completed', ...meta });
    }
}
//# sourceMappingURL=logger.js.map