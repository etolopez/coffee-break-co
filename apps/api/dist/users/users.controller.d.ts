/**
 * Users Controller
 * Handles user profile and favorites endpoints
 */
import { UsersService, UpdateProfileDto } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: string;
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
            companyName: string;
            uniqueSlug: string;
            coffeesUploaded: number;
        }[];
    }>;
    updateProfile(user: any, updateDto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: string;
        avatar: string | null;
        phone: string | null;
        profile: {
            bio: string | null;
            location: string | null;
            website: string | null;
            preferences: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    }>;
    getFavorites(user: any): Promise<import("../coffee/coffee.service").CoffeeEntry[]>;
    addFavorite(user: any, coffeeId: string): Promise<{
        message: string;
        favorite: {
            id: string;
            createdAt: Date;
            userId: string;
            coffeeId: string;
        };
    }>;
    removeFavorite(user: any, coffeeId: string): Promise<{
        message: string;
    }>;
    checkFavorite(user: any, coffeeId: string): Promise<{
        isFavorited: boolean;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map