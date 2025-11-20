/**
 * Seller Controller
 * REST API endpoints for seller data
 */

import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { SellerService } from './seller.service';

@ApiTags('seller')
@Controller('api/sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get()
  @Public() // Make seller listings public
  @ApiOperation({
    summary: 'Get all sellers',
    description: 'Retrieve all sellers with their coffee data',
  })
  @ApiResponse({
    status: 200,
    description: 'List of sellers',
  })
  async getAllSellers() {
    const sellers = await this.sellerService.getAllSellers();
    return {
      success: true,
      data: sellers,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get seller by ID',
    description: 'Retrieve a specific seller by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Seller ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller details',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found',
  })
  async getSellerById(@Param('id') id: string) {
    const seller = await this.sellerService.getSellerById(id);
    if (!seller) {
      return { success: false, error: 'Seller not found' };
    }
    return {
      success: true,
      data: seller,
    };
  }
}
