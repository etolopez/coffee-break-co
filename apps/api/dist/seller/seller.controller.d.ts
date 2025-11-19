/**
 * Seller Controller
 * REST API endpoints for seller data
 */
import { SellerService } from './seller.service';
export declare class SellerController {
    private readonly sellerService;
    constructor(sellerService: SellerService);
    getAllSellers(): Promise<{
        success: boolean;
        data: import("./seller.service").Seller[];
    }>;
    getSellerById(id: string): Promise<{
        success: boolean;
        error: string;
        data?: never;
    } | {
        success: boolean;
        data: import("./seller.service").Seller;
        error?: never;
    }>;
}
//# sourceMappingURL=seller.controller.d.ts.map