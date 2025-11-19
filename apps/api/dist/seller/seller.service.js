"use strict";
/**
 * Seller Service
 * Handles seller data operations
 * Reads from persistent JSON file for MVP implementation
 */
var SellerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path = tslib_1.__importStar(require("path"));
const coffee_service_1 = require("../coffee/coffee.service");
let SellerService = SellerService_1 = class SellerService {
    coffeeService;
    logger = new common_1.Logger(SellerService_1.name);
    sellersFile = path.join(process.cwd(), '..', '..', 'data', 'sellers-persistent.json');
    constructor(coffeeService) {
        this.coffeeService = coffeeService;
    }
    /**
     * Read sellers data from persistent storage
     */
    async readSellersData() {
        try {
            const data = await fs_1.promises.readFile(this.sellersFile, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            this.logger.warn('No sellers file found, returning empty object');
            return {};
        }
    }
    /**
     * Get brand color for seller
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
     * Get all sellers with coffee data
     */
    async getAllSellers() {
        const sellersData = await this.readSellersData();
        const allCoffees = await this.coffeeService.getAllCoffees();
        // Convert sellers object to array and enrich with coffee data
        const sellersArray = await Promise.all(Object.values(sellersData).map(async (seller) => {
            const sellerCoffees = allCoffees.filter((coffee) => coffee.sellerId === seller.id || coffee.sellerId === String(seller.id));
            const coffeeCount = sellerCoffees.length;
            const featuredCoffee = sellerCoffees.length > 0 && sellerCoffees[0]?.coffeeName ? sellerCoffees[0].coffeeName : '';
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
            return {
                id: seller.id,
                name: seller.companyName || seller.name || 'Unknown Seller',
                location: displayLocation,
                description: seller.mission || seller.description || '',
                featuredCoffee,
                region: region || '',
                certifications: seller.certifications || [],
                rating: seller.rating || 0,
                coffeeCount,
                memberSince: seller.memberSince || 2024,
                image: sellerLogo || '',
                sellerPhoto: sellerLogo,
                specialties: seller.specialties || [],
                brandColor: this.getBrandColor(seller.id),
                logo: sellerLogo,
                coffees: sellerCoffees.map((coffee) => ({
                    id: coffee.id,
                    name: coffee.coffeeName,
                    origin: coffee.origin || '',
                    cuppingScore: coffee.cuppingScore || '0',
                    available: coffee.available !== false,
                })),
            };
        }));
        return sellersArray;
    }
    /**
     * Get seller by ID
     */
    async getSellerById(id) {
        const sellers = await this.getAllSellers();
        return sellers.find((seller) => seller.id === id) || null;
    }
};
exports.SellerService = SellerService;
exports.SellerService = SellerService = SellerService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [coffee_service_1.CoffeeService])
], SellerService);
//# sourceMappingURL=seller.service.js.map