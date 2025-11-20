/**
 * Seller Coffee Controller
 * REST API endpoints for sellers to manage their coffees
 */
import { SellerCoffeeService } from './seller-coffee.service';
export declare class SellerCoffeeController {
    private readonly sellerCoffeeService;
    private readonly logger;
    constructor(sellerCoffeeService: SellerCoffeeService);
    /**
     * Get all coffees for the current seller
     */
    getMyCoffees(user: any): Promise<import("../coffee/coffee.service").CoffeeEntry[]>;
    /**
     * Get a specific coffee by ID (must belong to seller)
     */
    getCoffeeById(id: string, user: any): Promise<import("../coffee/coffee.service").CoffeeEntry>;
    /**
     * Create a new coffee
     */
    createCoffee(coffeeData: any, user: any): Promise<import("../coffee/coffee.service").CoffeeEntry>;
    /**
     * Update a coffee (must belong to seller)
     */
    updateCoffee(id: string, coffeeData: any, user: any): Promise<import("../coffee/coffee.service").CoffeeEntry>;
    /**
     * Delete a coffee (must belong to seller)
     */
    deleteCoffee(id: string, user: any): Promise<void>;
}
//# sourceMappingURL=seller-coffee.controller.d.ts.map