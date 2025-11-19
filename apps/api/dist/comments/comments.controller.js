"use strict";
/**
 * Comments Controller
 * REST API endpoints for comments/ratings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const comments_service_1 = require("./comments.service");
let CommentsController = class CommentsController {
    commentsService;
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async getComments(coffeeId) {
        const comments = await this.commentsService.getCommentsByCoffeeId(coffeeId);
        return {
            success: true,
            data: comments,
        };
    }
};
exports.CommentsController = CommentsController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get comments for a coffee',
        description: 'Retrieve all comments/ratings for a specific coffee',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'coffeeId',
        required: true,
        description: 'Coffee ID to get comments for',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of comments',
    }),
    tslib_1.__param(0, (0, common_1.Query)('coffeeId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CommentsController.prototype, "getComments", null);
exports.CommentsController = CommentsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('comments'),
    (0, common_1.Controller)('api/comments'),
    tslib_1.__metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map