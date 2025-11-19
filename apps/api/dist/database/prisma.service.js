"use strict";
/**
 * Prisma service for database operations
 * Handles connection lifecycle and provides logging integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const shared_1 = require("@coffee-passport/shared");
/**
 * Prisma service that manages database connections
 * Integrates with Winston logging and handles graceful shutdown
 */
let PrismaService = class PrismaService extends client_1.PrismaClient {
    logger = (0, shared_1.createLogger)({
        service: 'coffee-passport-prisma',
        level: process.env.LOG_LEVEL || 'info'
    });
    constructor() {
        super({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
        });
        // Log database queries in development
        if (process.env.NODE_ENV === 'development') {
            this.$on('query', (e) => {
                (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.DB_QUERY, {
                    query: e.query,
                    params: e.params,
                    duration: e.duration,
                }, 'Database query executed');
            });
        }
        // Log database errors
        this.$on('error', (e) => {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.DB_ERROR, {
                target: e.target,
                timestamp: e.timestamp,
            }, 'Database error occurred');
        });
        // Log database info
        this.$on('info', (e) => {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.DB_QUERY, {
                message: e.message,
                target: e.target,
            }, 'Database info');
        });
        // Log database warnings
        this.$on('warn', (e) => {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.DB_QUERY, {
                message: e.message,
                target: e.target,
            }, 'Database warning');
        });
    }
    /**
     * Initialize database connection
     */
    async onModuleInit() {
        try {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_REQUEST, {}, 'Connecting to database');
            await this.$connect();
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_RESPONSE, {}, 'Database connection established');
        }
        catch (error) {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_ERROR, { error: error.message }, 'Failed to connect to database');
            throw error;
        }
    }
    /**
     * Clean up database connection
     */
    async onModuleDestroy() {
        try {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_REQUEST, {}, 'Disconnecting from database');
            await this.$disconnect();
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_RESPONSE, {}, 'Database connection closed');
        }
        catch (error) {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.EXTERNAL_ERROR, { error: error.message }, 'Error during database disconnection');
        }
    }
    /**
     * Clean up database on application shutdown
     */
    async enableShutdownHooks(app) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }
    /**
     * Execute a transaction with logging
     */
    async $transactionWithLogging(fn, options) {
        const startTime = Date.now();
        try {
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.DB_TRANSACTION, { options }, 'Starting database transaction');
            const result = await this.$transaction(fn, options);
            const duration = Date.now() - startTime;
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.DB_TRANSACTION, { duration }, 'Database transaction completed successfully');
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            (0, shared_1.logWaypoint)(this.logger, shared_1.LOG_WAYPOINTS.DB_ERROR, { duration, error: error.message }, 'Database transaction failed');
            throw error;
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map