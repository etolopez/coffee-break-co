"use strict";
/**
 * Global HTTP Exception Filter
 * Catches all exceptions and logs them with full details
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = class AllExceptionsFilter {
    logger = new common_1.Logger('ExceptionFilter');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? (typeof exception.getResponse() === 'string'
                ? exception.getResponse()
                : exception.getResponse()?.message || exception.message)
            : exception instanceof Error
                ? exception.message
                : 'Internal server error';
        // Log full error details
        this.logger.error(`❌ ${request.method} ${request.url} - ${status}`, {
            statusCode: status,
            message,
            error: exception instanceof Error ? exception.stack : String(exception),
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
        });
        // Log Prisma errors with more detail
        if (exception && typeof exception === 'object' && 'code' in exception) {
            this.logger.error('Prisma Error Details:', {
                code: exception.code,
                meta: exception.meta,
                message: exception.message,
            });
        }
        response.status(status).send({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = tslib_1.__decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=http-exception.filter.js.map