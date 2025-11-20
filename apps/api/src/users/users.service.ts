/**
 * Users Service
 * Handles user profiles and favorites management
 */

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CoffeeService } from '../coffee/coffee.service';

export interface UpdateProfileDto {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  phone?: string;
  preferences?: any;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly coffeeService: CoffeeService,
  ) {}

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            location: true,
            website: true,
            preferences: true,
          },
        },
        sellers: {
          select: {
            id: true,
            companyName: true,
            uniqueSlug: true,
            subscriptionTier: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const { name, avatar, phone, bio, location, website, preferences } = updateDto;

    // Update user
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(phone !== undefined && { phone }),
        profile: {
          upsert: {
            create: {
              ...(bio !== undefined && { bio }),
              ...(location !== undefined && { location }),
              ...(website !== undefined && { website }),
              ...(preferences !== undefined && { preferences }),
            },
            update: {
              ...(bio !== undefined && { bio }),
              ...(location !== undefined && { location }),
              ...(website !== undefined && { website }),
              ...(preferences !== undefined && { preferences }),
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        profile: {
          select: {
            bio: true,
            location: true,
            website: true,
            preferences: true,
          },
        },
      },
    });

    this.logger.log(`Profile updated for user: ${userId}`);

    return user;
  }

  /**
   * Get user favorites
   */
  async getFavorites(userId: string) {
    const favorites = await this.prisma.userFavorite.findMany({
      where: { userId },
      include: {
        coffee: {
          include: {
            seller: {
              select: {
                id: true,
                companyName: true,
                uniqueSlug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to CoffeeEntry format
    return favorites.map((fav) => this.coffeeService.mapCoffeeToEntry(fav.coffee));
  }

  /**
   * Add coffee to favorites
   * Handles both coffee ID and slug
   */
  async addFavorite(userId: string, coffeeId: string) {
    try {
      // Try to find coffee by ID first
      let coffee = await this.prisma.coffee.findUnique({
        where: { id: coffeeId },
      });

      // If not found by ID, try by slug
      if (!coffee) {
        coffee = await this.prisma.coffee.findUnique({
          where: { slug: coffeeId },
        });
      }

      if (!coffee) {
        this.logger.warn(`Coffee not found: ${coffeeId} (tried both ID and slug)`);
        throw new NotFoundException(`Coffee not found: ${coffeeId}`);
      }

      // Use the actual database ID for the favorite
      const actualCoffeeId = coffee.id;

      // Check if already favorited (using actual database ID)
      const existing = await this.prisma.userFavorite.findUnique({
        where: {
          userId_coffeeId: {
            userId,
            coffeeId: actualCoffeeId,
          },
        },
      });

      if (existing) {
        return { message: 'Coffee already in favorites', favorite: existing };
      }

      // Add to favorites (using actual database ID)
      const favorite = await this.prisma.userFavorite.create({
        data: {
          userId,
          coffeeId: actualCoffeeId,
        },
        include: {
          coffee: true,
        },
      });

      this.logger.log(`Coffee ${actualCoffeeId} (${coffeeId}) added to favorites for user ${userId}`);

      return { message: 'Coffee added to favorites', favorite };
    } catch (error: any) {
      this.logger.error(`Error adding favorite for user ${userId}, coffee ${coffeeId}:`, {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Remove coffee from favorites
   * Handles both coffee ID and slug
   */
  async removeFavorite(userId: string, coffeeId: string) {
    try {
      // Try to find coffee by ID first
      let coffee = await this.prisma.coffee.findUnique({
        where: { id: coffeeId },
      });

      // If not found by ID, try by slug
      if (!coffee) {
        coffee = await this.prisma.coffee.findUnique({
          where: { slug: coffeeId },
        });
      }

      if (!coffee) {
        this.logger.warn(`Coffee not found for removal: ${coffeeId} (tried both ID and slug)`);
        throw new NotFoundException(`Coffee not found: ${coffeeId}`);
      }

      // Use the actual database ID
      const actualCoffeeId = coffee.id;

      const favorite = await this.prisma.userFavorite.findUnique({
        where: {
          userId_coffeeId: {
            userId,
            coffeeId: actualCoffeeId,
          },
        },
      });

      if (!favorite) {
        throw new NotFoundException('Favorite not found');
      }

      await this.prisma.userFavorite.delete({
        where: {
          userId_coffeeId: {
            userId,
            coffeeId: actualCoffeeId,
          },
        },
      });

      this.logger.log(`Coffee ${actualCoffeeId} (${coffeeId}) removed from favorites for user ${userId}`);

      return { message: 'Coffee removed from favorites' };
    } catch (error: any) {
      this.logger.error(`Error removing favorite for user ${userId}, coffee ${coffeeId}:`, {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Check if coffee is favorited
   * Handles both coffee ID and slug
   */
  async isFavorited(userId: string, coffeeId: string): Promise<boolean> {
    try {
      // Try to find coffee by ID first
      let coffee = await this.prisma.coffee.findUnique({
        where: { id: coffeeId },
      });

      // If not found by ID, try by slug
      if (!coffee) {
        coffee = await this.prisma.coffee.findUnique({
          where: { slug: coffeeId },
        });
      }

      if (!coffee) {
        return false;
      }

      // Use the actual database ID
      const actualCoffeeId = coffee.id;

      const favorite = await this.prisma.userFavorite.findUnique({
        where: {
          userId_coffeeId: {
            userId,
            coffeeId: actualCoffeeId,
          },
        },
      });

      return !!favorite;
    } catch (error: any) {
      this.logger.error(`Error checking favorite status for user ${userId}, coffee ${coffeeId}:`, {
        message: error.message,
        code: error.code,
      });
      return false; // Return false on error
    }
  }
}

