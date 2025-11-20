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
    getProfile(userId: string): Promise<any>;
    /**
     * Update user profile
     */
    updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<any>;
    /**
     * Get user favorites
     */
    getFavorites(userId: string): Promise<any>;
    /**
     * Add coffee to favorites
     */
    addFavorite(userId: string, coffeeId: string): Promise<{
        message: string;
        favorite: any;
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