/**
 * Prisma Service
 * Provides database access through Prisma Client
 * Singleton service that manages Prisma Client lifecycle
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ensureUsersTable, ensureDemoUsers } from './ensure-users-table';

/**
 * Prisma Service
 * Extends PrismaClient and implements lifecycle hooks
 * Ensures proper connection management and cleanup
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Initialize Prisma Client on module initialization
   * Connects to the database and logs connection status
   * Provides helpful error messages if DATABASE_URL is missing
   */
  async onModuleInit() {
    try {
      // Check if DATABASE_URL is set
      const databaseUrl = process.env['DATABASE_URL'];
      const nodeEnv = process.env['NODE_ENV'] || 'development';
      
      if (!databaseUrl) {
        if (nodeEnv === 'production') {
          this.logger.error('❌ DATABASE_URL environment variable is not set!');
          this.logger.error('📝 Please add PostgreSQL database to Railway:');
          this.logger.error('   1. Go to Railway project → "+ New" → "Database" → "Add PostgreSQL"');
          this.logger.error('   2. Railway will automatically set DATABASE_URL');
          this.logger.error('   3. Then run: npm run prisma:deploy && npm run db:seed');
          throw new Error('DATABASE_URL is not set. Please add PostgreSQL database to Railway.');
        } else {
          this.logger.warn('⚠️  DATABASE_URL not set - running in development mode without database');
          this.logger.warn('📝 To use database features, set DATABASE_URL in .env file');
          return; // Allow app to start without database in development
        }
      }

      await this.$connect();
      this.logger.log('✅ Successfully connected to PostgreSQL database');
      
      // Emergency: Ensure users table exists (in case migrations didn't run)
      this.logger.log('🔍 Checking if users table exists...');
      const usersTableExists = await ensureUsersTable(this);
      if (!usersTableExists) {
        this.logger.warn('⚠️  Could not ensure users table exists - authentication may not work');
      } else {
        // If table exists, also ensure demo users exist (in case seeding didn't run)
        this.logger.log('🔍 Ensuring demo users exist...');
        try {
          await ensureDemoUsers(this);
        } catch (error: any) {
          this.logger.error('❌ Failed to ensure demo users:', error.message);
          this.logger.error('Error details:', error);
        }
      }
    } catch (error: any) {
      const nodeEnv = process.env['NODE_ENV'] || 'development';
      
      // In development, allow app to start even if database connection fails
      if (nodeEnv !== 'production') {
        this.logger.warn('⚠️  Failed to connect to PostgreSQL database');
        this.logger.warn('📝 Running in development mode without database');
        this.logger.warn('📝 Error:', error.message || error);
        this.logger.warn('📝 To fix: Set DATABASE_URL in .env file or ensure Railway database is accessible');
        return; // Don't throw error in development
      }
      
      // In production, fail hard
      this.logger.error('❌ Failed to connect to PostgreSQL database');
      if (error.message?.includes('DATABASE_URL')) {
        throw error;
      }
      this.logger.error('Error details:', error.message || error);
      this.logger.error('📝 Make sure:');
      this.logger.error('   1. PostgreSQL database is added to Railway');
      this.logger.error('   2. DATABASE_URL environment variable is set');
      this.logger.error('   3. Database migrations have been run: npm run prisma:deploy');
      throw error;
    }
  }

  /**
   * Cleanup Prisma Client on module destruction
   * Disconnects from the database gracefully
   */
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('✅ Disconnected from PostgreSQL database');
    } catch (error) {
      this.logger.error('❌ Error disconnecting from PostgreSQL database', error);
    }
  }

  /**
   * Health check method
   * Verifies database connectivity
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }
}

