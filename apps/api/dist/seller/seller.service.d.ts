/**
 * Seller Service
 * Handles seller data operations
 * Reads from persistent JSON file for MVP implementation
 */
import { CoffeeService } from '../coffee/coffee.service';
/**
 * Seller interface matching the data structure
 */
export interface Seller {
    id: string;
    name: string;
    location: string;
    description: string;
    featuredCoffee: string;
    region: string;
    certifications: string[];
    rating: number;
    coffeeCount: number;
    memberSince: number;
    image: string;
    sellerPhoto?: string;
    specialties: string[];
    brandColor: string;
    logo?: string;
    coffees?: {
        id: string;
        name: string;
        origin: string;
        cuppingScore: string;
        available: boolean;
    }[];
}
export declare class SellerService {
    private readonly coffeeService;
    private readonly logger;
    private readonly sellersFile;
    constructor(coffeeService: CoffeeService);
    /**
     * Read sellers data from persistent storage
     */
    private readSellersData;
    /**
     * Get brand color for seller
     */
    private getBrandColor;
    /**
     * Get all sellers with coffee data
     */
    getAllSellers(): Promise<Seller[]>;
    /**
     * Get seller by ID
     */
    getSellerById(id: string): Promise<Seller | null>;
}
//# sourceMappingURL=seller.service.d.ts.map