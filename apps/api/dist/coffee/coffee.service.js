"use strict";
/**
 * Coffee Service
 * Handles coffee data operations using PostgreSQL via Prisma
 * Migrated from JSON file storage to database-backed storage
 */
var CoffeeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoffeeService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let CoffeeService = CoffeeService_1 = class CoffeeService {
    prisma;
    logger = new common_1.Logger(CoffeeService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Helper to remove undefined values from object (for exactOptionalPropertyTypes)
     */
    removeUndefined(obj) {
        const result = {};
        for (const key in obj) {
            if (obj[key] !== undefined) {
                result[key] = obj[key];
            }
        }
        return result;
    }
    /**
     * Map Prisma Coffee model to CoffeeEntry interface
     * Converts database model to API response format
     */
    mapCoffeeToEntry(coffee) {
        const baseEntry = {
            id: coffee.id,
            coffeeName: coffee.coffeeName,
            origin: coffee.origin,
            certifications: coffee.certifications,
            coordinates: {
                lat: coffee.coordinatesLat ?? 0,
                lng: coffee.coordinatesLng ?? 0,
            },
            environmentalPractices: coffee.environmentalPractices,
            available: coffee.available,
            createdAt: coffee.createdAt.toISOString(),
            updatedAt: coffee.updatedAt.toISOString(),
            flavorNotes: coffee.flavorNotes,
            farmPhotos: coffee.farmPhotos,
        };
        // Add optional fields only if they have values
        const optionalFields = {};
        if (coffee.farm)
            optionalFields.farm = coffee.farm;
        if (coffee.farmer)
            optionalFields.farmer = coffee.farmer;
        if (coffee.altitude)
            optionalFields.altitude = coffee.altitude;
        if (coffee.variety)
            optionalFields.variety = coffee.variety;
        if (coffee.process)
            optionalFields.process = coffee.process;
        if (coffee.harvestDate)
            optionalFields.harvestDate = coffee.harvestDate;
        if (coffee.processingDate)
            optionalFields.processingDate = coffee.processingDate;
        if (coffee.cuppingScore)
            optionalFields.cuppingScore = coffee.cuppingScore;
        if (coffee.notes)
            optionalFields.notes = coffee.notes;
        if (coffee.qrCode)
            optionalFields.qrCode = coffee.qrCode;
        if (coffee.slug)
            optionalFields.slug = coffee.slug;
        if (coffee.producerName)
            optionalFields.producerName = coffee.producerName;
        if (coffee.producerBio)
            optionalFields.producerBio = coffee.producerBio;
        if (coffee.roastedBy)
            optionalFields.roastedBy = coffee.roastedBy;
        if (coffee.fermentationTime)
            optionalFields.fermentationTime = coffee.fermentationTime;
        if (coffee.dryingTime)
            optionalFields.dryingTime = coffee.dryingTime;
        if (coffee.moistureContent)
            optionalFields.moistureContent = coffee.moistureContent;
        if (coffee.screenSize)
            optionalFields.screenSize = coffee.screenSize;
        if (coffee.beanDensity)
            optionalFields.beanDensity = coffee.beanDensity;
        if (coffee.aroma)
            optionalFields.aroma = coffee.aroma;
        if (coffee.flavor)
            optionalFields.flavor = coffee.flavor;
        if (coffee.acidity)
            optionalFields.acidity = coffee.acidity;
        if (coffee.body)
            optionalFields.body = coffee.body;
        if (coffee.primaryNotes)
            optionalFields.primaryNotes = coffee.primaryNotes;
        if (coffee.secondaryNotes)
            optionalFields.secondaryNotes = coffee.secondaryNotes;
        if (coffee.finish)
            optionalFields.finish = coffee.finish;
        if (coffee.roastRecommendation)
            optionalFields.roastRecommendation = coffee.roastRecommendation;
        if (coffee.fairTradePremium)
            optionalFields.fairTradePremium = coffee.fairTradePremium;
        if (coffee.communityProjects)
            optionalFields.communityProjects = coffee.communityProjects;
        if (coffee.womenWorkerPercentage)
            optionalFields.womenWorkerPercentage = coffee.womenWorkerPercentage;
        if (coffee.sellerId)
            optionalFields.sellerId = coffee.sellerId;
        if (coffee.harvestYear)
            optionalFields.harvestYear = coffee.harvestYear;
        if (coffee.roastLevel)
            optionalFields.roastLevel = coffee.roastLevel;
        if (coffee.description)
            optionalFields.description = coffee.description;
        if (coffee.price)
            optionalFields.price = coffee.price;
        if (coffee.currency)
            optionalFields.currency = coffee.currency;
        if (coffee.weight)
            optionalFields.weight = coffee.weight;
        if (coffee.roastingCurveImage)
            optionalFields.roastingCurveImage = coffee.roastingCurveImage;
        if (coffee.region)
            optionalFields.region = coffee.region;
        return { ...baseEntry, ...optionalFields };
    }
    /**
     * Get all coffee entries
     * Optionally filter by sellerId
     */
    async getAllCoffees(sellerId) {
        try {
            const where = {};
            if (sellerId) {
                where.sellerId = sellerId;
            }
            const coffees = await this.prisma.coffee.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });
            return coffees.map(coffee => this.mapCoffeeToEntry(coffee));
        }
        catch (error) {
            this.logger.error('Error fetching coffees from database', error);
            throw error;
        }
    }
    /**
     * Get coffee by ID
     */
    async getCoffeeById(id) {
        try {
            const coffee = await this.prisma.coffee.findUnique({
                where: { id },
            });
            if (!coffee) {
                return null;
            }
            return this.mapCoffeeToEntry(coffee);
        }
        catch (error) {
            this.logger.error(`Error fetching coffee by ID: ${id}`, error);
            throw error;
        }
    }
    /**
     * Get coffee by slug
     */
    async getCoffeeBySlug(slug) {
        try {
            const coffee = await this.prisma.coffee.findUnique({
                where: { slug },
            });
            if (!coffee) {
                return null;
            }
            return this.mapCoffeeToEntry(coffee);
        }
        catch (error) {
            this.logger.error(`Error fetching coffee by slug: ${slug}`, error);
            throw error;
        }
    }
};
exports.CoffeeService = CoffeeService;
exports.CoffeeService = CoffeeService = CoffeeService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoffeeService);
//# sourceMappingURL=coffee.service.js.map