/**
 * Coffee Controller
 * REST API endpoints for coffee data
 */
import { CoffeeService } from './coffee.service';
export declare class CoffeeController {
    private readonly coffeeService;
    constructor(coffeeService: CoffeeService);
    getAllCoffees(sellerId?: string): Promise<import("./coffee.service").CoffeeEntry[]>;
    getCoffeeById(id: string): Promise<import("./coffee.service").CoffeeEntry | {
        error: string;
    }>;
    getCoffeeBySlug(slug: string): Promise<import("./coffee.service").CoffeeEntry | {
        error: string;
    }>;
}
//# sourceMappingURL=coffee.controller.d.ts.map