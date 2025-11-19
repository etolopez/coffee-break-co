/**
 * Prisma service for database operations
 * Handles connection lifecycle and provides logging integration
 */
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
/**
 * Prisma service that manages database connections
 * Integrates with Winston logging and handles graceful shutdown
 */
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor();
    /**
     * Initialize database connection
     */
    onModuleInit(): Promise<void>;
    /**
     * Clean up database connection
     */
    onModuleDestroy(): Promise<void>;
    /**
     * Clean up database on application shutdown
     */
    enableShutdownHooks(app: any): Promise<void>;
    /**
     * Execute a transaction with logging
     */
    $transactionWithLogging<T>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$transactionWithLogging'>) => Promise<T>, options?: {
        maxWait?: number;
        timeout?: number;
    }): Promise<T>;
}
//# sourceMappingURL=prisma.service.d.ts.map