"use strict";
/**
 * Emergency script to ensure users table exists
 * This runs on app startup if the table is missing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUsersTable = ensureUsersTable;
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('EnsureUsersTable');
async function ensureUsersTable(prisma) {
    try {
        // Check if users table exists
        await prisma.$queryRaw `SELECT 1 FROM users LIMIT 1`;
        logger.log('✅ Users table exists');
        return true;
    }
    catch (error) {
        if (error.message?.includes('does not exist') ||
            error.message?.includes('relation') ||
            error.code === 'P2021') {
            logger.warn('⚠️  Users table does not exist - creating it...');
            try {
                // Create users table
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "users" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "name" TEXT,
            "role" TEXT NOT NULL DEFAULT 'customer',
            "avatar" TEXT,
            "phone" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "users_pkey" PRIMARY KEY ("id")
          );
        `);
                // Create indexes
                await prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
          CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
          CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
        `);
                // Create user_profiles table
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "user_profiles" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "bio" TEXT,
            "location" TEXT,
            "website" TEXT,
            "preferences" JSONB,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_userId_key" ON "user_profiles"("userId");
        `);
                // Create user_favorites table
                await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "user_favorites" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "coffeeId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
          );
        `);
                await prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "user_favorites_userId_coffeeId_key" ON "user_favorites"("userId", "coffeeId");
          CREATE INDEX IF NOT EXISTS "user_favorites_userId_idx" ON "user_favorites"("userId");
          CREATE INDEX IF NOT EXISTS "user_favorites_coffeeId_idx" ON "user_favorites"("coffeeId");
        `);
                // Add foreign keys
                await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_userId_fkey') THEN
              ALTER TABLE "user_profiles" 
              ADD CONSTRAINT "user_profiles_userId_fkey" 
              FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
          END $$;
        `);
                await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_favorites_userId_fkey') THEN
              ALTER TABLE "user_favorites" 
              ADD CONSTRAINT "user_favorites_userId_fkey" 
              FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
          END $$;
        `);
                await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_favorites_coffeeId_fkey') THEN
              ALTER TABLE "user_favorites" 
              ADD CONSTRAINT "user_favorites_coffeeId_fkey" 
              FOREIGN KEY ("coffeeId") REFERENCES "coffees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
          END $$;
        `);
                logger.log('✅ Users tables created successfully!');
                return true;
            }
            catch (createError) {
                logger.error('❌ Failed to create users table', createError);
                return false;
            }
        }
        else {
            logger.error('❌ Error checking users table', error);
            return false;
        }
    }
}
//# sourceMappingURL=ensure-users-table.js.map