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
    const [users, sellers, coffees, favorites] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.seller.count(),
      this.prisma.coffee.count(),
      this.prisma.userFavorite.count(),
    ]);

    // Get users by role
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

    return {
      stats: {
        totalUsers: users,
        totalSellers: sellers,
        totalCoffees: coffees,
        totalFavorites: favorites,
      },
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      recentUsers,
      recentCoffees,
    };
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

