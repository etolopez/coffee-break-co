/**
 * Seller Module
 * Module for seller-related functionality
 * Uses PrismaService from DatabaseModule (global)
 */

import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { SellerCoffeeController } from './seller-coffee.controller';
import { SellerCoffeeService } from './seller-coffee.service';
import { CoffeeModule } from '../coffee/coffee.module';

@Module({
  imports: [CoffeeModule],
  controllers: [SellerController, SellerCoffeeController],
  providers: [SellerService, SellerCoffeeService],
  exports: [SellerService, SellerCoffeeService],
})
export class SellerModule {}
