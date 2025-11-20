/**
 * Admin Service
 * Handles admin dashboard and user management
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      this.logger.log('Fetching dashboard statistics...');
      
      // Try each query individually to see which one fails
      let users = 0;
      let sellers = 0;
      let coffees = 0;
      let favorites = 0;

      try {
        users = await this.prisma.user.count();
        this.logger.debug(`Users count: ${users}`);
      } catch (error: any) {
        this.logger.error('Error counting users:', error);
        throw error;
      }

      try {
        sellers = await this.prisma.seller.count();
        this.logger.debug(`Sellers count: ${sellers}`);
      } catch (error: any) {
        this.logger.error('Error counting sellers:', error);
        throw error;
      }

      try {
        coffees = await this.prisma.coffee.count();
        this.logger.debug(`Coffees count: ${coffees}`);
      } catch (error: any) {
        this.logger.error('Error counting coffees:', error);
        throw error;
      }

      try {
        favorites = await this.prisma.userFavorite.count();
        this.logger.debug(`Favorites count: ${favorites}`);
      } catch (error: any) {
        this.logger.error('Error counting favorites:', {
          message: error.message,
          code: error.code,
          meta: error.meta,
        });
        // If user_favorites table doesn't exist, set to 0 instead of failing
        if (error.code === 'P2021' || error.message?.includes('does not exist')) {
          this.logger.warn('user_favorites table does not exist, setting count to 0');
          favorites = 0;
        } else {
          throw error;
        }
      }

      // Get users by role
      // In Prisma groupBy, _count: true returns a number (total count in group)
      const usersByRole = await this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      });

      // Get recent users
      const recentUsers = await this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      // Get recent coffees
      const recentCoffees = await this.prisma.coffee.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          coffeeName: true,
          origin: true,
          createdAt: true,
        },
      });

      // Serialize dates to strings for JSON response
      return {
        stats: {
          totalUsers: users,
          totalSellers: sellers,
          totalCoffees: coffees,
          totalFavorites: favorites,
        },
        usersByRole: usersByRole.map((item) => ({
          role: item.role,
          count: item._count || 0, // _count is a number in groupBy
        })),
        recentUsers: recentUsers.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        })),
        recentCoffees: recentCoffees.map((coffee) => ({
          ...coffee,
          createdAt: coffee.createdAt.toISOString(),
        })),
      };
    } catch (error: any) {
      this.logger.error('Error getting dashboard stats', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        profile: true,
        sellers: {
          select: {
            id: true,
            companyName: true,
            uniqueSlug: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all sellers with details
   */
  async getAllSellers() {
    return this.prisma.seller.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            coffees: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all coffees with details
   */
  async getAllCoffees() {
    return this.prisma.coffee.findMany({
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            uniqueSlug: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update a seller
   */
  async updateSeller(sellerId: string, sellerData: any) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    const updateData: any = {};
    if (sellerData.companyName !== undefined) updateData.companyName = sellerData.companyName;
    if (sellerData.companySize !== undefined) updateData.companySize = sellerData.companySize;
    if (sellerData.mission !== undefined) updateData.mission = sellerData.mission;
    if (sellerData.logo !== undefined) updateData.logo = sellerData.logo;
    if (sellerData.phone !== undefined) updateData.phone = sellerData.phone;
    if (sellerData.email !== undefined) updateData.email = sellerData.email;
    if (sellerData.location !== undefined) updateData.location = sellerData.location;
    if (sellerData.country !== undefined) updateData.country = sellerData.country;
    if (sellerData.city !== undefined) updateData.city = sellerData.city;
    if (sellerData.description !== undefined) updateData.description = sellerData.description;
    if (sellerData.website !== undefined) updateData.website = sellerData.website;
    if (sellerData.instagram !== undefined) updateData.instagram = sellerData.instagram;
    if (sellerData.facebook !== undefined) updateData.facebook = sellerData.facebook;
    if (sellerData.twitter !== undefined) updateData.twitter = sellerData.twitter;
    if (sellerData.certifications !== undefined) updateData.certifications = sellerData.certifications;
    if (sellerData.specialties !== undefined) updateData.specialties = sellerData.specialties;
    if (sellerData.defaultPricePerBag !== undefined)
      updateData.defaultPricePerBag = sellerData.defaultPricePerBag;
    if (sellerData.orderLink !== undefined) updateData.orderLink = sellerData.orderLink;

    return this.prisma.seller.update({
      where: { id: sellerId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            coffees: true,
          },
        },
      },
    });
  }

  /**
   * Delete a seller
   */
  async deleteSeller(sellerId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    await this.prisma.seller.delete({
      where: { id: sellerId },
    });

    this.logger.log(`Seller deleted: ${sellerId}`);
    return { message: 'Seller deleted successfully' };
  }
}

