/**
 * Emergency script to ensure users table exists
 * This runs on app startup if the table is missing
 */
import { PrismaClient } from '@prisma/client';
export declare function ensureUsersTable(prisma: PrismaClient): Promise<boolean>;
/**
 * Ensure demo users exist in the database
 * Creates them if they don't exist
 */
export declare function ensureDemoUsers(prisma: PrismaClient): Promise<void>;
//# sourceMappingURL=ensure-users-table.d.ts.map