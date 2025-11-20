-- CreateTable: Create users table for authentication
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

-- CreateTable: Create user_profiles table
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

-- CreateTable: Create user_favorites table
CREATE TABLE IF NOT EXISTS "user_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coffeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Create unique index on users.email
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex: Create index on users.email
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- CreateIndex: Create index on users.role
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");

-- CreateIndex: Create unique index on user_profiles.userId
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex: Create unique index on user_favorites (userId, coffeeId)
CREATE UNIQUE INDEX IF NOT EXISTS "user_favorites_userId_coffeeId_key" ON "user_favorites"("userId", "coffeeId");

-- CreateIndex: Create index on user_favorites.userId
CREATE INDEX IF NOT EXISTS "user_favorites_userId_idx" ON "user_favorites"("userId");

-- CreateIndex: Create index on user_favorites.coffeeId
CREATE INDEX IF NOT EXISTS "user_favorites_coffeeId_idx" ON "user_favorites"("coffeeId");

-- AddForeignKey: Link user_profiles to users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_userId_fkey'
    ) THEN
        ALTER TABLE "user_profiles" 
        ADD CONSTRAINT "user_profiles_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "users"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Link user_favorites to users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_favorites_userId_fkey'
    ) THEN
        ALTER TABLE "user_favorites" 
        ADD CONSTRAINT "user_favorites_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "users"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Link user_favorites to coffees
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_favorites_coffeeId_fkey'
    ) THEN
        ALTER TABLE "user_favorites" 
        ADD CONSTRAINT "user_favorites_coffeeId_fkey" 
        FOREIGN KEY ("coffeeId") 
        REFERENCES "coffees"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

