/**
 * Admin Service
 * Handles admin dashboard and user management
 */

import { Injectable, Logger } from '@nestjs/common';
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
      const [users, sellers, coffees, favorites] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.seller.count(),
        this.prisma.coffee.count(),
        this.prisma.userFavorite.count(),
      ]);

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
}

