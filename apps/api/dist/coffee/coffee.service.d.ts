/**
 * Coffee Service
 * Handles coffee data operations
 * Reads from persistent JSON file for MVP implementation
 */
/**
 * Coffee entry interface matching the data structure
 */
export interface CoffeeEntry {
    id: string;
    coffeeName: string;
    origin: string;
    farm: string;
    farmer: string;
    altitude: string;
    variety: string;
    process: string;
    harvestDate: string;
    processingDate: string;
    cuppingScore: string;
    notes: string;
    qrCode?: string;
    slug?: string;
    farmSize: string;
    workerCount: string;
    certifications: string[];
    coordinates: {
        lat: number;
        lng: number;
    };
    farmImage?: string;
    farmerImage?: string;
    producerName?: string;
    producerPortrait?: string;
    producerBio?: string;
    roastedBy?: string;
    fermentationTime: string;
    dryingTime: string;
    moistureContent: string;
    screenSize: string;
    beanDensity?: string;
    aroma: string;
    flavor: string;
    acidity: string;
    body: string;
    primaryNotes: string;
    secondaryNotes: string;
    finish: string;
    roastRecommendation: string;
    roastDevelopmentCurve?: string;
    environmentalPractices: string[];
    fairTradePremium: string;
    communityProjects: string;
    womenWorkerPercentage: string;
    available?: boolean;
    sellerId?: string;
    createdAt?: string;
    updatedAt?: string;
}
export declare class CoffeeService {
    private readonly logger;
    private readonly coffeeEntriesFile;
    /**
     * Read coffee entries from persistent storage
     */
    private readCoffeeEntries;
    /**
     * Get all coffee entries
     */
    getAllCoffees(sellerId?: string): Promise<CoffeeEntry[]>;
    /**
     * Get coffee by ID
     */
    getCoffeeById(id: string): Promise<CoffeeEntry | null>;
    /**
     * Get coffee by slug
     */
    getCoffeeBySlug(slug: string): Promise<CoffeeEntry | null>;
}
//# sourceMappingURL=coffee.service.d.ts.map