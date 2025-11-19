"use strict";
/**
 * Comments Service
 * Handles comments/ratings data operations
 * For MVP, returns empty array (can be extended later)
 */
var CommentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
let CommentsService = CommentsService_1 = class CommentsService {
    logger = new common_1.Logger(CommentsService_1.name);
    /**
     * Get comments for a coffee
     * For MVP, returns empty array
     * Can be extended to read from database or file storage
     */
    async getCommentsByCoffeeId(coffeeId) {
        // TODO: Implement actual data storage/retrieval
        // For now, return empty array
        return [];
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = CommentsService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], CommentsService);
//# sourceMappingURL=comments.service.js.map