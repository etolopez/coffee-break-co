/**
 * Prisma Service
 * Provides database access through Prisma Client
 * Singleton service that manages Prisma Client lifecycle
 */
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
/**
 * Prisma Service
 * Extends PrismaClient and implements lifecycle hooks
 * Ensures proper connection management and cleanup
 */
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    /**
     * Initialize Prisma Client on module initialization
     * Connects to the database and logs connection status
     * Provides helpful error messages if DATABASE_URL is missing
     */
    onModuleInit(): Promise<void>;
    /**
     * Cleanup Prisma Client on module destruction
     * Disconnects from the database gracefully
     */
    onModuleDestroy(): Promise<void>;
    /**
     * Health check method
     * Verifies database connectivity
     */
    isHealthy(): Promise<boolean>;
}
//# sourceMappingURL=prisma.service.d.ts.map