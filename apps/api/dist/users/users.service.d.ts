/**
 * Users Service
 * Handles user profiles and favorites management
 */
import { PrismaService } from '../database/prisma.service';
import { CoffeeService } from '../coffee/coffee.service';
export interface UpdateProfileDto {
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
    phone?: string;
    preferences?: any;
}
export declare class UsersService {
    private readonly prisma;
    private readonly coffeeService;
    private readonly logger;
    constructor(prisma: PrismaService, coffeeService: CoffeeService);
    /**
     * Get user profile
     */
    getProfile(userId: string): Promise<{
        email: string;
        name: string | null;
        role: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        createdAt: Date;
        profile: {
            bio: string | null;
            location: string | null;
            website: string | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
        } | null;
        sellers: {
            id: string;
            subscriptionTier: string;
            companyName: string;
            uniqueSlug: string;
        }[];
    }>;
    /**
     * Update user profile
     */
    updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<{
        email: string;
        name: string | null;
        role: string;
        id: string;
        avatar: string | null;
        phone: string | null;
        profile: {
            bio: string | null;
            location: string | null;
            website: string | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    }>;
    /**
     * Get user favorites
     */
    getFavorites(userId: string): Promise<import("../coffee/coffee.service").CoffeeEntry[]>;
    /**
     * Add coffee to favorites
     */
    addFavorite(userId: string, coffeeId: string): Promise<{
        message: string;
        favorite: {
            id: string;
            createdAt: Date;
            userId: string;
            coffeeId: string;
        };
    }>;
    /**
     * Remove coffee from favorites
     */
    removeFavorite(userId: string, coffeeId: string): Promise<{
        message: string;
    }>;
    /**
     * Check if coffee is favorited
     */
    isFavorited(userId: string, coffeeId: string): Promise<boolean>;
}
//# sourceMappingURL=users.service.d.ts.map