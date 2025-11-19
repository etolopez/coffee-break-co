"use strict";
/**
 * Seller Service
 * Handles seller data operations using PostgreSQL via Prisma
 * Migrated from JSON file storage to database-backed storage
 */
var SellerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let SellerService = SellerService_1 = class SellerService {
    prisma;
    logger = new common_1.Logger(SellerService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get brand color for seller
     * Generates consistent color based on seller ID
     */
    getBrandColor(sellerId) {
        const colors = [
            'from-amber-400 to-orange-500',
            'from-emerald-400 to-teal-500',
            'from-blue-400 to-cyan-500',
            'from-purple-400 to-indigo-500',
            'from-pink-400 to-rose-500',
        ];
        const numId = parseInt(sellerId.replace(/\D/g, '')) || 0;
        const index = numId % colors.length;
        const color = colors[index];
        if (color) {
            return color;
        }
        return colors[0];
    }
    /**
     * Map Prisma Seller model to Seller interface
     * Converts database model to API response format with coffee data
     */
    async mapSellerToResponse(seller) {
        // Get seller's coffees
        const sellerCoffees = await this.prisma.coffee.findMany({
            where: { sellerId: seller.id },
            orderBy: { createdAt: 'desc' },
        });
        const coffeeCount = sellerCoffees.length;
        const featuredCoffee = sellerCoffees.length > 0 && sellerCoffees[0]?.coffeeName
            ? sellerCoffees[0].coffeeName
            : '';
        // Get region from coffee origins
        const regionParts = sellerCoffees
            .map((c) => c.origin?.split(',')[1]?.trim())
            .filter(Boolean);
        const region = regionParts.length > 0 ? regionParts[0] : seller.location || '';
        // Determine location display - prioritize city/country
        let displayLocation = seller.location || 'Location not specified';
        if (seller.city && seller.country) {
            displayLocation = `${seller.city}, ${seller.country}`;
        }
        else if (seller.city) {
            displayLocation = seller.city;
        }
        else if (seller.country) {
            displayLocation = seller.country;
        }
        // Get logo if available
        const sellerLogo = seller.logo && seller.logo !== 'undefined' && seller.logo !== 'null'
            ? seller.logo
            : undefined;
        const baseResponse = {
            id: seller.id,
            name: seller.companyName || 'Unknown Seller',
            location: displayLocation,
            description: seller.mission || seller.description || '',
            featuredCoffee,
            region: region || '',
            certifications: seller.certifications,
            rating: seller.rating,
            coffeeCount,
            memberSince: seller.memberSince,
            image: sellerLogo || '',
            specialties: seller.specialties,
            brandColor: this.getBrandColor(seller.id),
            coffees: sellerCoffees.map((coffee) => ({
                id: coffee.id,
                name: coffee.coffeeName,
                origin: coffee.origin || '',
                cuppingScore: coffee.cuppingScore || '0',
                available: coffee.available,
            })),
        };
        // Add optional fields only if they have values
        const optionalFields = {};
        if (sellerLogo) {
            optionalFields.sellerPhoto = sellerLogo;
            optionalFields.logo = sellerLogo;
        }
        return { ...baseResponse, ...optionalFields };
    }
    /**
     * Get all sellers with coffee data
     */
    async getAllSellers() {
        try {
            const sellers = await this.prisma.seller.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return Promise.all(sellers.map(seller => this.mapSellerToResponse(seller)));
        }
        catch (error) {
            this.logger.error('Error fetching sellers from database', error);
            throw error;
        }
    }
    /**
     * Get seller by ID
     */
    async getSellerById(id) {
        try {
            const seller = await this.prisma.seller.findUnique({
                where: { id },
            });
            if (!seller) {
                return null;
            }
            return this.mapSellerToResponse(seller);
        }
        catch (error) {
            this.logger.error(`Error fetching seller by ID: ${id}`, error);
            throw error;
        }
    }
};
exports.SellerService = SellerService;
exports.SellerService = SellerService = SellerService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SellerService);
//# sourceMappingURL=seller.service.js.map