/**
 * Emergency script to ensure users table exists
 * This runs on app startup if the table is missing
 */

import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const logger = new Logger('EnsureUsersTable');

export async function ensureUsersTable(prisma: PrismaClient): Promise<boolean> {
  try {
    // Check if users table exists
    await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`;
    logger.log('✅ Users table exists');
    return true;
  } catch (error: any) {
    if (
      error.message?.includes('does not exist') ||
      error.message?.includes('relation') ||
      error.code === 'P2021'
    ) {
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
        
        // Now ensure demo users exist
        await ensureDemoUsers(prisma);
        
        return true;
      } catch (createError: any) {
        logger.error('❌ Failed to create users table', createError);
        return false;
      }
    } else {
      logger.error('❌ Error checking users table', error);
      return false;
    }
  }
}

/**
 * Ensure demo users exist in the database
 * Creates them if they don't exist
 */
export async function ensureDemoUsers(prisma: PrismaClient): Promise<void> {
  const demoUsers = [
    // Admin
    {
      email: 'admin@coffeebreak.com',
      password: 'password',
      name: 'Admin User',
      role: 'admin',
    },
    // Sellers
    {
      email: 'seller@coffeebreak.com',
      password: 'password',
      name: 'Free Tier Seller',
      role: 'seller',
    },
    // Customers
    {
      email: 'customer@example.com',
      password: 'password',
      name: 'Demo Customer',
      role: 'customer',
    },
  ];

  logger.log('👤 Ensuring demo users exist...');

  for (const userData of demoUsers) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        logger.debug(`  ✅ User already exists: ${userData.email}`);
        continue;
      }

      // Create user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          profile: {
            create: {},
          },
        },
      });

      logger.log(`  ✅ Created demo user: ${userData.email} (${userData.role})`);
    } catch (error: any) {
      // Ignore duplicate errors
      if (error.code === 'P2002') {
        logger.debug(`  ⚠️  User already exists: ${userData.email}`);
      } else {
        logger.warn(`  ⚠️  Failed to create user ${userData.email}:`, error.message);
      }
    }
  }

  logger.log('✅ Demo users ensured');
}

