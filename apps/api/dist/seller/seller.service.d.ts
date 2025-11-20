/**
 * Seller Service
 * Handles seller data operations using PostgreSQL via Prisma
 * Migrated from JSON file storage to database-backed storage
 */
import { PrismaService } from '../database/prisma.service';
/**
 * Seller interface matching the API response structure
 * Maps Prisma model to API response format
 */
export interface Seller {
    id: string;
    name: string;
    location: string;
    description: string;
    featuredCoffee: string;
    region: string;
    certifications: string[];
    rating: number;
    coffeeCount: number;
    memberSince: number;
    image: string;
    sellerPhoto?: string;
    specialties: string[];
    brandColor: string;
    logo?: string;
    coffees?: {
        id: string;
        name: string;
        origin: string;
        cuppingScore: string;
        available: boolean;
    }[];
}
export declare class SellerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Get brand color for seller
     * Generates consistent color based on seller ID
     */
    private getBrandColor;
    /**
     * Map Prisma Seller model to Seller interface
     * Converts database model to API response format with coffee data
     */
    private mapSellerToResponse;
    /**
     * Get all sellers with coffee data
     * Handles missing userId column gracefully if migration hasn't been applied
     */
    getAllSellers(): Promise<Seller[]>;
    /**
     * Get seller by ID
     * Handles missing userId column gracefully if migration hasn't been applied
     */
    getSellerById(id: string): Promise<Seller | null>;
}
//# sourceMappingURL=seller.service.d.ts.map