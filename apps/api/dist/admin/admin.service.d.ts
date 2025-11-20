/**
 * Admin Service
 * Handles admin dashboard and user management
 */
import { PrismaService } from '../database/prisma.service';
export declare class AdminService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Get dashboard statistics
     */
    getDashboardStats(): Promise<{
        stats: {
            totalUsers: number;
            totalSellers: number;
            totalCoffees: number;
            totalFavorites: number;
        };
        usersByRole: {
            role: string;
            count: number;
        }[];
        recentUsers: {
            email: string;
            name: string | null;
            role: string;
            id: string;
            createdAt: Date;
        }[];
        recentCoffees: {
            id: string;
            createdAt: Date;
            coffeeName: string;
            origin: string;
        }[];
    }>;
    /**
     * Get all users
     */
    getAllUsers(): Promise<({
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bio: string | null;
            location: string | null;
            website: string | null;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
        } | null;
        sellers: {
            id: string;
            companyName: string;
            uniqueSlug: string;
        }[];
        _count: {
            favorites: number;
        };
    } & {
        email: string;
        password: string;
        name: string | null;
        role: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    /**
     * Get all sellers with details
     */
    getAllSellers(): Promise<({
        user: {
            email: string;
            name: string | null;
            id: string;
        } | null;
        _count: {
            coffees: number;
        };
    } & {
        email: string | null;
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        website: string | null;
        userId: string | null;
        description: string | null;
        subscriptionTier: string;
        certifications: string[];
        companyName: string;
        companySize: string | null;
        mission: string | null;
        logo: string | null;
        country: string | null;
        city: string | null;
        rating: number;
        totalCoffees: number;
        memberSince: number;
        specialties: string[];
        featuredCoffeeId: string | null;
        instagram: string | null;
        facebook: string | null;
        twitter: string | null;
        uniqueSlug: string;
        subscriptionStatus: string;
        defaultPricePerBag: string | null;
        orderLink: string | null;
    })[]>;
    /**
     * Get all coffees with details
     */
    getAllCoffees(): Promise<({
        seller: {
            id: string;
            companyName: string;
            uniqueSlug: string;
        } | null;
        _count: {
            favorites: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        coffeeName: string;
        roastedBy: string | null;
        sellerId: string | null;
        subscriptionTier: string | null;
        origin: string;
        region: string | null;
        altitude: string | null;
        process: string | null;
        variety: string | null;
        harvestYear: string | null;
        roastLevel: string | null;
        flavorNotes: string[];
        price: string | null;
        currency: string | null;
        weight: string | null;
        qrCode: string | null;
        slug: string | null;
        farmPhotos: string[];
        roastingCurveImage: string | null;
        coordinatesLat: number | null;
        coordinatesLng: number | null;
        certifications: string[];
        environmentalPractices: string[];
        farm: string | null;
        farmer: string | null;
        cuppingScore: string | null;
        notes: string | null;
        harvestDate: string | null;
        processingDate: string | null;
        producerName: string | null;
        producerBio: string | null;
        aroma: string | null;
        flavor: string | null;
        acidity: string | null;
        body: string | null;
        primaryNotes: string | null;
        secondaryNotes: string | null;
        finish: string | null;
        fermentationTime: string | null;
        dryingTime: string | null;
        moistureContent: string | null;
        screenSize: string | null;
        beanDensity: string | null;
        roastRecommendation: string | null;
        fairTradePremium: string | null;
        communityProjects: string | null;
        womenWorkerPercentage: string | null;
        available: boolean;
    })[]>;
}
//# sourceMappingURL=admin.service.d.ts.map