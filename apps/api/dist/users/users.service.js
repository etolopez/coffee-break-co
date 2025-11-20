"use strict";
/**
 * Users Service
 * Handles user profiles and favorites management
 */
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const coffee_service_1 = require("../coffee/coffee.service");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    coffeeService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma, coffeeService) {
        this.prisma = prisma;
        this.coffeeService = coffeeService;
    }
    /**
     * Get user profile
     */
    async getProfile(userId) {
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
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    /**
     * Update user profile
     */
    async updateProfile(userId, updateDto) {
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
    async getFavorites(userId) {
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
    async addFavorite(userId, coffeeId) {
        // Check if coffee exists
        const coffee = await this.prisma.coffee.findUnique({
            where: { id: coffeeId },
        });
        if (!coffee) {
            throw new common_1.NotFoundException('Coffee not found');
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
    async removeFavorite(userId, coffeeId) {
        const favorite = await this.prisma.userFavorite.findUnique({
            where: {
                userId_coffeeId: {
                    userId,
                    coffeeId,
                },
            },
        });
        if (!favorite) {
            throw new common_1.NotFoundException('Favorite not found');
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
    async isFavorited(userId, coffeeId) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        coffee_service_1.CoffeeService])
], UsersService);
//# sourceMappingURL=users.service.js.map