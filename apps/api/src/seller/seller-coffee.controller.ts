/**
 * Seller Coffee Controller
 * REST API endpoints for sellers to manage their coffees
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SellerCoffeeService } from './seller-coffee.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('seller-coffee')
@ApiBearerAuth()
@Controller('api/seller/coffees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('seller', 'admin')
export class SellerCoffeeController {
  private readonly logger = new Logger(SellerCoffeeController.name);

  constructor(private readonly sellerCoffeeService: SellerCoffeeService) {}

  /**
   * Get all coffees for the current seller
   */
  @Get()
  @ApiOperation({ summary: 'Get all coffees for current seller' })
  @ApiResponse({ status: 200, description: 'Coffees retrieved successfully' })
  async getMyCoffees(@CurrentUser() user: any) {
    try {
      this.logger.debug(`Fetching coffees for user ${user.id}`);
      const result = await this.sellerCoffeeService.getMyCoffees(user.id);
      this.logger.debug(`Found ${result.length} coffees for user ${user.id}`);
      return result;
    } catch (error: any) {
      this.logger.error('Error fetching seller coffees', {
        userId: user.id,
        error: error.message,
        stack: error.stack,
        code: error.code,
      });
      throw error;
    }
  }

  /**
   * Get a specific coffee by ID (must belong to seller)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get coffee by ID (seller only)' })
  @ApiResponse({ status: 200, description: 'Coffee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Coffee not found' })
  async getCoffeeById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sellerCoffeeService.getCoffeeById(id, user.id);
  }

  /**
   * Create a new coffee
   */
  @Post()
  @ApiOperation({ summary: 'Create a new coffee' })
  @ApiResponse({ status: 201, description: 'Coffee created successfully' })
  async createCoffee(@Body() coffeeData: any, @CurrentUser() user: any) {
    try {
      this.logger.log(`Creating coffee for user ${user.id}`, {
        coffeeName: coffeeData.coffeeName,
        origin: coffeeData.origin,
      });
      const result = await this.sellerCoffeeService.createCoffee(coffeeData, user.id);
      this.logger.log(`Coffee created successfully: ${result.id}`);
      return result;
    } catch (error: any) {
      this.logger.error('Error creating coffee', {
        userId: user.id,
        error: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta,
      });
      throw error;
    }
  }

  /**
   * Update a coffee (must belong to seller)
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a coffee' })
  @ApiResponse({ status: 200, description: 'Coffee updated successfully' })
  @ApiResponse({ status: 404, description: 'Coffee not found' })
  async updateCoffee(
    @Param('id') id: string,
    @Body() coffeeData: any,
    @CurrentUser() user: any,
  ) {
    return this.sellerCoffeeService.updateCoffee(id, coffeeData, user.id);
  }

  /**
   * Delete a coffee (must belong to seller)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coffee' })
  @ApiResponse({ status: 200, description: 'Coffee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Coffee not found' })
  async deleteCoffee(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sellerCoffeeService.deleteCoffee(id, user.id);
  }
}

