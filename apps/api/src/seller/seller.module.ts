/**
 * Seller Module
 * Module for seller-related functionality
 * Uses PrismaService from DatabaseModule (global)
 */

import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';

@Module({
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
})
export class SellerModule {}
