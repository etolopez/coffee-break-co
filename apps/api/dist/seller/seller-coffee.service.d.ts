/**
 * Seller Coffee Service
 * Handles coffee CRUD operations for sellers
 */
import { PrismaService } from '../database/prisma.service';
import { CoffeeService, CoffeeEntry } from '../coffee/coffee.service';
export declare class SellerCoffeeService {
    private readonly prisma;
    private readonly coffeeService;
    private readonly logger;
    constructor(prisma: PrismaService, coffeeService: CoffeeService);
    /**
     * Get seller ID from user ID
     * Handles missing userId column gracefully
     */
    private getSellerIdFromUserId;
    /**
     * Get all coffees for the current seller
     */
    getMyCoffees(userId: string): Promise<CoffeeEntry[]>;
    /**
     * Get a specific coffee by ID (must belong to seller)
     */
    getCoffeeById(coffeeId: string, userId: string): Promise<CoffeeEntry>;
    /**
     * Create a new coffee
     */
    createCoffee(coffeeData: any, userId: string): Promise<CoffeeEntry>;
    /**
     * Update a coffee (must belong to seller)
     */
    updateCoffee(coffeeId: string, coffeeData: any, userId: string): Promise<CoffeeEntry>;
    /**
     * Delete a coffee (must belong to seller)
     */
    deleteCoffee(coffeeId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=seller-coffee.service.d.ts.map