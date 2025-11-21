"use strict";
/**
 * Seller Coffee Service
 * Handles coffee CRUD operations for sellers
 */
var SellerCoffeeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerCoffeeService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const coffee_service_1 = require("../coffee/coffee.service");
let SellerCoffeeService = SellerCoffeeService_1 = class SellerCoffeeService {
    prisma;
    coffeeService;
    logger = new common_1.Logger(SellerCoffeeService_1.name);
    constructor(prisma, coffeeService) {
        this.prisma = prisma;
        this.coffeeService = coffeeService;
    }
    /**
     * Get seller ID from user ID
     * Handles missing userId column gracefully
     */
    async getSellerIdFromUserId(userId) {
        try {
            // Try to find seller by userId
            const seller = await this.prisma.seller.findFirst({
                where: { userId },
                select: { id: true },
            });
            return seller?.id || null;
        }
        catch (error) {
            // If userId column doesn't exist, try to find seller by user email
            if (error?.message?.includes('sellers.userId') || error?.message?.includes('does not exist')) {
                this.logger.warn(`userId column not found - trying to find seller by user email for ${userId}`);
                // Get user email first
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: { email: true },
                });
                if (!user) {
                    return null;
                }
                // Try to find seller by email (if sellers have email field)
                try {
                    const seller = await this.prisma.seller.findFirst({
                        where: { email: user.email },
                        select: { id: true },
                    });
                    return seller?.id || null;
                }
                catch (e) {
                    this.logger.warn('Could not find seller by email either');
                    return null;
                }
            }
            throw error;
        }
    }
    /**
     * Get all coffees for the current seller
     */
    async getMyCoffees(userId) {
        const sellerId = await this.getSellerIdFromUserId(userId);
        if (!sellerId) {
            // Try to auto-create seller profile if user has seller role
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { role: true, email: true, name: true },
            });
            if (user?.role === 'seller') {
                this.logger.log(`Auto-creating seller profile for user ${userId}`);
                const companyName = user.name || user.email.split('@')[0] || 'My Coffee Company';
                // Try to create seller, handling missing columns gracefully
                try {
                    const seller = await this.prisma.seller.create({
                        data: {
                            companyName,
                            uniqueSlug: `${user.email.split('@')[0]}-${Date.now()}`,
                            memberSince: new Date().getFullYear(),
                            userId: userId,
                        },
                    });
                    return this.coffeeService.getAllCoffees(seller.id);
                }
                catch (createError) {
                    // If coffeesUploaded column doesn't exist, try with raw SQL
                    if (createError?.message?.includes('coffeesUploaded') || createError?.message?.includes('does not exist')) {
                        this.logger.warn('coffeesUploaded column missing, using raw SQL to create seller');
                        const uniqueSlug = `${user.email.split('@')[0]}-${Date.now()}`;
                        // Use raw SQL to create seller without coffeesUploaded
                        await this.prisma.$executeRawUnsafe(`
              INSERT INTO sellers (id, "companyName", "uniqueSlug", "memberSince", "userId", "createdAt", "updatedAt")
              VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
              RETURNING id
            `, companyName, uniqueSlug, new Date().getFullYear(), userId);
                        // Fetch the created seller by uniqueSlug
                        const seller = await this.prisma.seller.findUnique({
                            where: { uniqueSlug },
                        });
                        if (seller) {
                            return this.coffeeService.getAllCoffees(seller.id);
                        }
                        throw new Error('Failed to create seller profile');
                    }
                    throw createError;
                }
            }
            throw new common_1.NotFoundException('Seller profile not found. Please create a seller profile first.');
        }
        return this.coffeeService.getAllCoffees(sellerId);
    }
    /**
     * Get a specific coffee by ID (must belong to seller)
     */
    async getCoffeeById(coffeeId, userId) {
        const sellerId = await this.getSellerIdFromUserId(userId);
        if (!sellerId) {
            throw new common_1.NotFoundException('Seller profile not found.');
        }
        const coffee = await this.prisma.coffee.findUnique({
            where: { id: coffeeId },
        });
        if (!coffee) {
            throw new common_1.NotFoundException('Coffee not found');
        }
        if (coffee.sellerId !== sellerId) {
            throw new common_1.ForbiddenException('You do not have permission to access this coffee');
        }
        return this.coffeeService.mapCoffeeToEntry(coffee);
    }
    /**
     * Create a new coffee
     */
    async createCoffee(coffeeData, userId) {
        const sellerId = await this.getSellerIdFromUserId(userId);
        if (!sellerId) {
            throw new common_1.NotFoundException('Seller profile not found. Please create a seller profile first.');
        }
        // Validate required fields
        if (!coffeeData.coffeeName || !coffeeData.origin) {
            throw new common_1.BadRequestException('coffeeName and origin are required');
        }
        // Generate slug from coffee name if not provided
        const slug = coffeeData.slug ||
            coffeeData.coffeeName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        // Check if slug already exists
        const existingCoffee = await this.prisma.coffee.findUnique({
            where: { slug },
        });
        if (existingCoffee) {
            throw new common_1.BadRequestException('A coffee with this slug already exists');
        }
        // Create coffee and increment seller's coffeesUploaded count
        const coffee = await this.prisma.coffee.create({
            data: {
                coffeeName: coffeeData.coffeeName,
                origin: coffeeData.origin,
                sellerId,
                slug,
                description: coffeeData.description,
                farm: coffeeData.farm,
                farmer: coffeeData.farmer,
                altitude: coffeeData.altitude,
                variety: coffeeData.variety,
                process: coffeeData.process,
                harvestYear: coffeeData.harvestYear,
                roastLevel: coffeeData.roastLevel,
                flavorNotes: coffeeData.flavorNotes || [],
                cuppingScore: coffeeData.cuppingScore,
                notes: coffeeData.notes,
                price: coffeeData.price,
                currency: coffeeData.currency || 'USD',
                weight: coffeeData.weight,
                region: coffeeData.region,
                coordinatesLat: coffeeData.coordinates?.lat,
                coordinatesLng: coffeeData.coordinates?.lng,
                certifications: coffeeData.certifications || [],
                environmentalPractices: coffeeData.environmentalPractices || [],
                available: coffeeData.available !== undefined ? coffeeData.available : true,
            },
        });
        // Increment seller's coffeesUploaded count
        await this.prisma.seller.update({
            where: { id: sellerId },
            data: {
                coffeesUploaded: {
                    increment: 1,
                },
            },
        });
        this.logger.log(`Coffee created: ${coffee.id} by seller ${sellerId}`);
        return this.coffeeService.mapCoffeeToEntry(coffee);
    }
    /**
     * Update a coffee (must belong to seller)
     */
    async updateCoffee(coffeeId, coffeeData, userId) {
        const sellerId = await this.getSellerIdFromUserId(userId);
        if (!sellerId) {
            throw new common_1.NotFoundException('Seller profile not found.');
        }
        // Check if coffee exists and belongs to seller
        const existingCoffee = await this.prisma.coffee.findUnique({
            where: { id: coffeeId },
        });
        if (!existingCoffee) {
            throw new common_1.NotFoundException('Coffee not found');
        }
        if (existingCoffee.sellerId !== sellerId) {
            throw new common_1.ForbiddenException('You do not have permission to update this coffee');
        }
        // Update coffee
        const updateData = {};
        if (coffeeData.coffeeName !== undefined)
            updateData.coffeeName = coffeeData.coffeeName;
        if (coffeeData.origin !== undefined)
            updateData.origin = coffeeData.origin;
        if (coffeeData.description !== undefined)
            updateData.description = coffeeData.description;
        if (coffeeData.farm !== undefined)
            updateData.farm = coffeeData.farm;
        if (coffeeData.farmer !== undefined)
            updateData.farmer = coffeeData.farmer;
        if (coffeeData.altitude !== undefined)
            updateData.altitude = coffeeData.altitude;
        if (coffeeData.variety !== undefined)
            updateData.variety = coffeeData.variety;
        if (coffeeData.process !== undefined)
            updateData.process = coffeeData.process;
        if (coffeeData.harvestYear !== undefined)
            updateData.harvestYear = coffeeData.harvestYear;
        if (coffeeData.roastLevel !== undefined)
            updateData.roastLevel = coffeeData.roastLevel;
        if (coffeeData.flavorNotes !== undefined)
            updateData.flavorNotes = coffeeData.flavorNotes;
        if (coffeeData.cuppingScore !== undefined)
            updateData.cuppingScore = coffeeData.cuppingScore;
        if (coffeeData.notes !== undefined)
            updateData.notes = coffeeData.notes;
        if (coffeeData.price !== undefined)
            updateData.price = coffeeData.price;
        if (coffeeData.currency !== undefined)
            updateData.currency = coffeeData.currency;
        if (coffeeData.weight !== undefined)
            updateData.weight = coffeeData.weight;
        if (coffeeData.region !== undefined)
            updateData.region = coffeeData.region;
        if (coffeeData.coordinates?.lat !== undefined)
            updateData.coordinatesLat = coffeeData.coordinates.lat;
        if (coffeeData.coordinates?.lng !== undefined)
            updateData.coordinatesLng = coffeeData.coordinates.lng;
        if (coffeeData.certifications !== undefined)
            updateData.certifications = coffeeData.certifications;
        if (coffeeData.environmentalPractices !== undefined)
            updateData.environmentalPractices = coffeeData.environmentalPractices;
        if (coffeeData.available !== undefined)
            updateData.available = coffeeData.available;
        const coffee = await this.prisma.coffee.update({
            where: { id: coffeeId },
            data: updateData,
        });
        this.logger.log(`Coffee updated: ${coffeeId} by seller ${sellerId}`);
        return this.coffeeService.mapCoffeeToEntry(coffee);
    }
    /**
     * Delete a coffee (must belong to seller)
     */
    async deleteCoffee(coffeeId, userId) {
        const sellerId = await this.getSellerIdFromUserId(userId);
        if (!sellerId) {
            throw new common_1.NotFoundException('Seller profile not found.');
        }
        // Check if coffee exists and belongs to seller
        const existingCoffee = await this.prisma.coffee.findUnique({
            where: { id: coffeeId },
        });
        if (!existingCoffee) {
            throw new common_1.NotFoundException('Coffee not found');
        }
        if (existingCoffee.sellerId !== sellerId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this coffee');
        }
        await this.prisma.coffee.delete({
            where: { id: coffeeId },
        });
        // Decrement seller's coffeesUploaded count
        await this.prisma.seller.update({
            where: { id: sellerId },
            data: {
                coffeesUploaded: {
                    decrement: 1,
                },
            },
        });
        this.logger.log(`Coffee deleted: ${coffeeId} by seller ${sellerId}`);
    }
};
exports.SellerCoffeeService = SellerCoffeeService;
exports.SellerCoffeeService = SellerCoffeeService = SellerCoffeeService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        coffee_service_1.CoffeeService])
], SellerCoffeeService);
//# sourceMappingURL=seller-coffee.service.js.map