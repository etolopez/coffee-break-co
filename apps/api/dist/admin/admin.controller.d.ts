/**
 * Admin Controller
 * Handles admin-only endpoints
 */
import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboard(): Promise<{
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
            id: string;
            email: string;
            name: string | null;
            role: string;
            createdAt: Date;
        }[];
        recentCoffees: {
            id: string;
            createdAt: Date;
            coffeeName: string;
            origin: string;
        }[];
    }>;
    getAllUsers(): Promise<({
        _count: {
            favorites: number;
        };
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            website: string | null;
            userId: string;
            bio: string | null;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        sellers: {
            id: string;
            companyName: string;
            uniqueSlug: string;
        }[];
    } & {
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        avatar: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getAllSellers(): Promise<({
        _count: {
            coffees: number;
        };
        user: {
            id: string;
            email: string;
            name: string | null;
        } | null;
    } & {
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        subscriptionTier: string;
        description: string | null;
        certifications: string[];
        companyName: string;
        companySize: string | null;
        mission: string | null;
        logo: string | null;
        location: string | null;
        country: string | null;
        city: string | null;
        rating: number;
        totalCoffees: number;
        memberSince: number;
        specialties: string[];
        featuredCoffeeId: string | null;
        website: string | null;
        instagram: string | null;
        facebook: string | null;
        twitter: string | null;
        uniqueSlug: string;
        subscriptionStatus: string;
        defaultPricePerBag: string | null;
        orderLink: string | null;
        userId: string | null;
    })[]>;
    getAllCoffees(): Promise<({
        _count: {
            favorites: number;
        };
        seller: {
            id: string;
            companyName: string;
            uniqueSlug: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
        description: string | null;
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
//# sourceMappingURL=admin.controller.d.ts.map