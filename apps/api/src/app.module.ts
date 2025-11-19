/**
 * Coffee Digital Passport API - Main Application Module
 * Configures all modules and providers for the application
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    CaptureModule,
    CoffeeModule,
    SellerModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
