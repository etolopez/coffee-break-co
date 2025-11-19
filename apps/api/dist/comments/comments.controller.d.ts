/**
 * Comments Controller
 * REST API endpoints for comments/ratings
 */
import { CommentsService } from './comments.service';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    getComments(coffeeId: string): Promise<{
        success: boolean;
        data: import("./comments.service").Comment[];
    }>;
}
//# sourceMappingURL=comments.controller.d.ts.map