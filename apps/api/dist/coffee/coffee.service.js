"use strict";
/**
 * Coffee Service
 * Handles coffee data operations
 * Reads from persistent JSON file for MVP implementation
 */
var CoffeeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoffeeService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path = tslib_1.__importStar(require("path"));
let CoffeeService = CoffeeService_1 = class CoffeeService {
    logger = new common_1.Logger(CoffeeService_1.name);
    coffeeEntriesFile = path.join(process.cwd(), '..', '..', 'data', 'coffee-entries-persistent.json');
    /**
     * Read coffee entries from persistent storage
     */
    async readCoffeeEntries() {
        try {
            const data = await fs_1.promises.readFile(this.coffeeEntriesFile, 'utf-8');
            const parsed = JSON.parse(data);
            return parsed.entries || [];
        }
        catch (error) {
            this.logger.warn('No coffee entries file found, returning empty array');
            return [];
        }
    }
    /**
     * Get all coffee entries
     */
    async getAllCoffees(sellerId) {
        const entries = await this.readCoffeeEntries();
        if (sellerId) {
            return entries.filter(entry => entry.sellerId === sellerId);
        }
        return entries;
    }
    /**
     * Get coffee by ID
     */
    async getCoffeeById(id) {
        const entries = await this.readCoffeeEntries();
        return entries.find(entry => entry.id === id) || null;
    }
    /**
     * Get coffee by slug
     */
    async getCoffeeBySlug(slug) {
        const entries = await this.readCoffeeEntries();
        return entries.find(entry => entry.slug === slug) || null;
    }
};
exports.CoffeeService = CoffeeService;
exports.CoffeeService = CoffeeService = CoffeeService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], CoffeeService);
//# sourceMappingURL=coffee.service.js.map