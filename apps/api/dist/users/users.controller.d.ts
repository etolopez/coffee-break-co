/**
 * Users Controller
 * Handles user profile and favorites endpoints
 */
import { UsersService, UpdateProfileDto } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<any>;
    updateProfile(user: any, updateDto: UpdateProfileDto): Promise<any>;
    getFavorites(user: any): Promise<any>;
    addFavorite(user: any, coffeeId: string): Promise<{
        message: string;
        favorite: any;
    }>;
    removeFavorite(user: any, coffeeId: string): Promise<{
        message: string;
    }>;
    checkFavorite(user: any, coffeeId: string): Promise<{
        isFavorited: boolean;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map