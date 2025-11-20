/**
 * Coffee Service
 * Handles coffee data operations using PostgreSQL via Prisma
 * Migrated from JSON file storage to database-backed storage
 */
import { PrismaService } from '../database/prisma.service';
import { Coffee } from '@prisma/client';
/**
 * Coffee entry interface matching the API response structure
 * Maps Prisma model to API response format
 */
export interface CoffeeEntry {
    id: string;
    coffeeName: string;
    origin: string;
    farm?: string;
    farmer?: string;
    altitude?: string;
    variety?: string;
    process?: string;
    harvestDate?: string;
    processingDate?: string;
    cuppingScore?: string;
    notes?: string;
    qrCode?: string;
    slug?: string;
    certifications: string[];
    coordinates: {
        lat: number;
        lng: number;
    };
    producerName?: string;
    producerBio?: string;
    roastedBy?: string;
    fermentationTime?: string;
    dryingTime?: string;
    moistureContent?: string;
    screenSize?: string;
    beanDensity?: string;
    aroma?: string;
    flavor?: string;
    acidity?: string;
    body?: string;
    primaryNotes?: string;
    secondaryNotes?: string;
    finish?: string;
    roastRecommendation?: string;
    environmentalPractices: string[];
    fairTradePremium?: string;
    communityProjects?: string;
    womenWorkerPercentage?: string;
    available?: boolean;
    sellerId?: string;
    createdAt?: string;
    updatedAt?: string;
    harvestYear?: string;
    roastLevel?: string;
    flavorNotes?: string[];
    description?: string;
    price?: string;
    currency?: string;
    weight?: string;
    farmPhotos?: string[];
    roastingCurveImage?: string;
    region?: string;
}
export declare class CoffeeService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Helper to remove undefined values from object (for exactOptionalPropertyTypes)
     */
    private removeUndefined;
    /**
     * Map Prisma Coffee model to CoffeeEntry interface
     * Converts database model to API response format
     */
    mapCoffeeToEntry(coffee: Coffee): CoffeeEntry;
    /**
     * Get all coffee entries
     * Optionally filter by sellerId
     */
    getAllCoffees(sellerId?: string): Promise<CoffeeEntry[]>;
    /**
     * Get coffee by ID
     */
    getCoffeeById(id: string): Promise<CoffeeEntry | null>;
    /**
     * Get coffee by slug
     */
    getCoffeeBySlug(slug: string): Promise<CoffeeEntry | null>;
}
//# sourceMappingURL=coffee.service.d.ts.map