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
   */
  async addFavorite(userId: string, coffeeId: string) {
    // Check if coffee exists
    const coffee = await this.prisma.coffee.findUnique({
      where: { id: coffeeId },
    });

    if (!coffee) {
      throw new NotFoundException('Coffee not found');
    }

    // Check if already favorited
    const existing = await this.prisma.userFavorite.findUnique({
      where: {
        userId_coffeeId: {
          userId,
          coffeeId,
        },
      },
    });

    if (existing) {
      return { message: 'Coffee already in favorites', favorite: existing };
    }

    // Add to favorites
    const favorite = await this.prisma.userFavorite.create({
      data: {
        userId,
        coffeeId,
      },
      include: {
        coffee: true,
      },
    });

    this.logger.log(`Coffee ${coffeeId} added to favorites for user ${userId}`);

    return { message: 'Coffee added to favorites', favorite };
  }

  /**
   * Remove coffee from favorites
   */
  async removeFavorite(userId: string, coffeeId: string) {
    const favorite = await this.prisma.userFavorite.findUnique({
      where: {
        userId_coffeeId: {
          userId,
          coffeeId,
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
          coffeeId,
        },
      },
    });

    this.logger.log(`Coffee ${coffeeId} removed from favorites for user ${userId}`);

    return { message: 'Coffee removed from favorites' };
  }

  /**
   * Check if coffee is favorited
   */
  async isFavorited(userId: string, coffeeId: string): Promise<boolean> {
    const favorite = await this.prisma.userFavorite.findUnique({
      where: {
        userId_coffeeId: {
          userId,
          coffeeId,
        },
      },
    });

    return !!favorite;
  }
}

