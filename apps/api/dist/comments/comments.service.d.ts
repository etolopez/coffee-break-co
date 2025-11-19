/**
 * Comments Service
 * Handles comments/ratings data operations
 * For MVP, returns empty array (can be extended later)
 */
/**
 * Comment interface
 */
export interface Comment {
    id: string;
    coffeeId: string;
    rating: number;
    comment: string;
    userId?: string;
    createdAt?: string;
}
export declare class CommentsService {
    private readonly logger;
    /**
     * Get comments for a coffee
     * For MVP, returns empty array
     * Can be extended to read from database or file storage
     */
    getCommentsByCoffeeId(coffeeId: string): Promise<Comment[]>;
}
//# sourceMappingURL=comments.service.d.ts.map