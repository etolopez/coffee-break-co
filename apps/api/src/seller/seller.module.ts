/**
 * Seller Module
 * Module for seller-related functionality
 */

import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { CoffeeModule } from '../coffee/coffee.module';

@Module({
  imports: [CoffeeModule],
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
})
export class SellerModule {}
