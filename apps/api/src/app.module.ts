/**
 * Coffee Digital Passport API - Main Application Module
 * Configures all modules and providers for the application
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CaptureModule } from './capture/capture.module';
import { CoffeeModule } from './coffee/coffee.module';
import { SellerModule } from './seller/seller.module';
import { CommentsModule } from './comments/comments.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseModule, // Global database module with Prisma service
    CaptureModule,
    CoffeeModule,
    SellerModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
