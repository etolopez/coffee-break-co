/**
 * Coffee Digital Passport API - Main Application Module
 * Configures all modules and providers for the application
 */

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { CaptureModule } from './capture/capture.module';
import { CoffeeModule } from './coffee/coffee.module';
import { SellerModule } from './seller/seller.module';
import { CommentsModule } from './comments/comments.module';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseModule, // Global database module with Prisma service
    AuthModule, // Authentication module
    UsersModule, // Users module (profiles, favorites)
    AdminModule, // Admin module (dashboard, user management)
    CaptureModule,
    CoffeeModule,
    SellerModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    // Make JWT auth guard global (all routes protected by default)
    // Use @Public() decorator to make routes public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global exception filter for better error logging
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
