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
            totalUsers: any;
            totalSellers: any;
            totalCoffees: any;
            totalFavorites: any;
        };
        usersByRole: any;
        recentUsers: any;
        recentCoffees: {
            id: string;
            origin: string;
            coffeeName: string;
            createdAt: Date;
        }[];
    }>;
    getAllUsers(): Promise<any>;
    getAllSellers(): Promise<{
        description: string | null;
        id: string;
        location: string | null;
        email: string | null;
        subscriptionTier: string;
        certifications: string[];
        createdAt: Date;
        updatedAt: Date;
        companyName: string;
        companySize: string | null;
        mission: string | null;
        logo: string | null;
        phone: string | null;
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
    }[]>;
    getAllCoffees(): Promise<{
        description: string | null;
        id: string;
        finish: string | null;
        body: string | null;
        origin: string;
        coffeeName: string;
        roastedBy: string | null;
        sellerId: string | null;
        subscriptionTier: string | null;
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
        primaryNotes: string | null;
        secondaryNotes: string | null;
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
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
//# sourceMappingURL=admin.controller.d.ts.map