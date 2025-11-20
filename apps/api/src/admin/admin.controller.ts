/**
 * Admin Controller
 * Handles admin-only endpoints
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('sellers')
  @ApiOperation({ summary: 'Get all sellers (admin only)' })
  @ApiResponse({ status: 200, description: 'Sellers retrieved successfully' })
  async getAllSellers() {
    return this.adminService.getAllSellers();
  }

  @Get('coffees')
  @ApiOperation({ summary: 'Get all coffees (admin only)' })
  @ApiResponse({ status: 200, description: 'Coffees retrieved successfully' })
  async getAllCoffees() {
    return this.adminService.getAllCoffees();
  }
}

