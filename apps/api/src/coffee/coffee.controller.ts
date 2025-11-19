/**
 * Coffee Controller
 * REST API endpoints for coffee data
 */

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CoffeeService } from './coffee.service';

@ApiTags('coffee')
@Controller('api/coffee-entries')
export class CoffeeController {
  constructor(private readonly coffeeService: CoffeeService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all coffee entries',
    description: 'Retrieve all coffee entries, optionally filtered by seller ID',
  })
  @ApiQuery({
    name: 'sellerId',
    required: false,
    description: 'Filter coffees by seller ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of coffee entries',
  })
  async getAllCoffees(@Query('sellerId') sellerId?: string) {
    const coffees = await this.coffeeService.getAllCoffees(sellerId);
    return coffees;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get coffee by ID',
    description: 'Retrieve a specific coffee entry by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Coffee entry ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Coffee entry details',
  })
  @ApiResponse({
    status: 404,
    description: 'Coffee entry not found',
  })
  async getCoffeeById(@Param('id') id: string) {
    const coffee = await this.coffeeService.getCoffeeById(id);
    if (!coffee) {
      return { error: 'Coffee not found' };
    }
    return coffee;
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get coffee by slug',
    description: 'Retrieve a specific coffee entry by its slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Coffee entry slug',
  })
  @ApiResponse({
    status: 200,
    description: 'Coffee entry details',
  })
  @ApiResponse({
    status: 404,
    description: 'Coffee entry not found',
  })
  async getCoffeeBySlug(@Param('slug') slug: string) {
    const coffee = await this.coffeeService.getCoffeeBySlug(slug);
    if (!coffee) {
      return { error: 'Coffee not found' };
    }
    return coffee;
  }
}
