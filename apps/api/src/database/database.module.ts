/**
 * Database Module
 * Global module that provides Prisma service to all modules
 * Ensures single instance of Prisma Client across the application
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Database Module
 * Makes PrismaService available globally to all modules
 * No need to import this module in other modules
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

