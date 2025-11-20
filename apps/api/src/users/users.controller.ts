/**
 * Users Controller
 * Handles user profile and favorites endpoints
 */

import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService, UpdateProfileDto } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateDto);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
  async getFavorites(@CurrentUser() user: any) {
    return this.usersService.getFavorites(user.id);
  }

  @Post('favorites/:coffeeId')
  @ApiOperation({ summary: 'Add coffee to favorites' })
  @ApiResponse({ status: 201, description: 'Coffee added to favorites' })
  @ApiResponse({ status: 404, description: 'Coffee not found' })
  async addFavorite(
    @CurrentUser() user: any,
    @Param('coffeeId') coffeeId: string,
  ) {
    return this.usersService.addFavorite(user.id, coffeeId);
  }

  @Delete('favorites/:coffeeId')
  @ApiOperation({ summary: 'Remove coffee from favorites' })
  @ApiResponse({ status: 200, description: 'Coffee removed from favorites' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async removeFavorite(
    @CurrentUser() user: any,
    @Param('coffeeId') coffeeId: string,
  ) {
    return this.usersService.removeFavorite(user.id, coffeeId);
  }

  @Get('favorites/:coffeeId/check')
  @ApiOperation({ summary: 'Check if coffee is favorited' })
  @ApiResponse({ status: 200, description: 'Favorite status retrieved' })
  async checkFavorite(
    @CurrentUser() user: any,
    @Param('coffeeId') coffeeId: string,
  ) {
    const isFavorited = await this.usersService.isFavorited(user.id, coffeeId);
    return { isFavorited };
  }
}

