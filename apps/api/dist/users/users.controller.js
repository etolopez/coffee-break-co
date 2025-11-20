"use strict";
/**
 * Users Controller
 * Handles user profile and favorites endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(user) {
        return this.usersService.getProfile(user.id);
    }
    async updateProfile(user, updateDto) {
        return this.usersService.updateProfile(user.id, updateDto);
    }
    async getFavorites(user) {
        return this.usersService.getFavorites(user.id);
    }
    async addFavorite(user, coffeeId) {
        return this.usersService.addFavorite(user.id, coffeeId);
    }
    async removeFavorite(user, coffeeId) {
        return this.usersService.removeFavorite(user.id, coffeeId);
    }
    async checkFavorite(user, coffeeId) {
        const isFavorited = await this.usersService.isFavorited(user.id, coffeeId);
        return { isFavorited };
    }
};
exports.UsersController = UsersController;
tslib_1.__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved successfully' }),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
tslib_1.__decorate([
    (0, common_1.Get)('favorites'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user favorites' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Favorites retrieved successfully' }),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "getFavorites", null);
tslib_1.__decorate([
    (0, common_1.Post)('favorites/:coffeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Add coffee to favorites' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Coffee added to favorites' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coffee not found' }),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('coffeeId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "addFavorite", null);
tslib_1.__decorate([
    (0, common_1.Delete)('favorites/:coffeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove coffee from favorites' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coffee removed from favorites' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Favorite not found' }),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('coffeeId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "removeFavorite", null);
tslib_1.__decorate([
    (0, common_1.Get)('favorites/:coffeeId/check'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if coffee is favorited' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Favorite status retrieved' }),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('coffeeId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "checkFavorite", null);
exports.UsersController = UsersController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map