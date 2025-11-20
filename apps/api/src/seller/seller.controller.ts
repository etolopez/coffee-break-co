/**
 * Seller Controller
 * REST API endpoints for seller data
 */

import { Controller, Get, Param, Logger, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { SellerService } from './seller.service';

@ApiTags('seller')
@Controller('api/sellers')
export class SellerController {
  private readonly logger = new Logger(SellerController.name);

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
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAllSellers() {
    try {
      const sellers = await this.sellerService.getAllSellers();
      return {
        success: true,
        data: sellers,
      };
    } catch (error: any) {
      this.logger.error('Error in getAllSellers controller', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
        stack: error?.stack,
      });

      // Provide helpful error message for database schema issues
      if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
        throw new InternalServerErrorException({
          success: false,
          error: 'Database schema mismatch',
          message: 'The database migration may not have been applied. Please check Railway logs.',
          details: error?.message,
        });
      }

      // Generic error response
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to fetch sellers',
        message: error?.message || 'Internal server error',
        details: process.env['NODE_ENV'] === 'development' ? error?.stack : undefined,
      });
    }
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
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getSellerById(@Param('id') id: string) {
    try {
      const seller = await this.sellerService.getSellerById(id);
      if (!seller) {
        return { success: false, error: 'Seller not found' };
      }
      return {
        success: true,
        data: seller,
      };
    } catch (error: any) {
      this.logger.error(`Error in getSellerById controller for ID: ${id}`, {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
        stack: error?.stack,
      });

      if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
        throw new InternalServerErrorException({
          success: false,
          error: 'Database schema mismatch',
          message: 'The database migration may not have been applied. Please check Railway logs.',
          details: error?.message,
        });
      }

      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to fetch seller',
        message: error?.message || 'Internal server error',
        details: process.env['NODE_ENV'] === 'development' ? error?.stack : undefined,
      });
    }
  }
}
