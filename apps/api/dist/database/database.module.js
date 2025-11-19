"use strict";
/**
 * Database Module
 * Global module that provides Prisma service to all modules
 * Ensures single instance of Prisma Client across the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
/**
 * Database Module
 * Makes PrismaService available globally to all modules
 * No need to import this module in other modules
 */
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map