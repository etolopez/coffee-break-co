"use strict";
/**
 * Comments Module
 * Module for comments/ratings functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const comments_controller_1 = require("./comments.controller");
const comments_service_1 = require("./comments.service");
let CommentsModule = class CommentsModule {
};
exports.CommentsModule = CommentsModule;
exports.CommentsModule = CommentsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [comments_controller_1.CommentsController],
        providers: [comments_service_1.CommentsService],
        exports: [comments_service_1.CommentsService],
    })
], CommentsModule);
//# sourceMappingURL=comments.module.js.map