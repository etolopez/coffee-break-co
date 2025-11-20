/**
 * Global HTTP Exception Filter
 * Catches all exceptions and logs them with full details
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getMessage()
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
        code: (exception as any).code,
        meta: (exception as any).meta,
        message: (exception as any).message,
      });
    }

    response.status(status).send({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

