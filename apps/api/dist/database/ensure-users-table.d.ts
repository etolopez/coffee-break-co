/**
 * Emergency script to ensure users table exists
 * This runs on app startup if the table is missing
 */
import { PrismaClient } from '@prisma/client';
export declare function ensureUsersTable(prisma: PrismaClient): Promise<boolean>;
//# sourceMappingURL=ensure-users-table.d.ts.map