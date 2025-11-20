#!/bin/sh
# Startup script for Railway deployment
# Runs migrations and seeds database before starting the app
# This script runs from /app/apps/api (set by Dockerfile WORKDIR)

# Don't use set -e, we want to handle errors gracefully
set +e

echo "🚀 Starting Coffee Break API..."
echo "📁 Working directory: $(pwd)"
echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Verify we're in the right place
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found. Current directory: $(pwd)"
  echo "📂 Listing directory contents:"
  ls -la
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  echo "Please add PostgreSQL database to Railway"
  exit 1
fi

echo "✅ DATABASE_URL is set (length: ${#DATABASE_URL} characters)"

# Run database migrations FIRST (before regenerating Prisma Client)
# This ensures the database schema matches what Prisma Client expects
echo "🔄 Running database migrations..."
npm run prisma:deploy
MIGRATION_EXIT=$?
if [ $MIGRATION_EXIT -ne 0 ]; then
  echo "⚠️  Migration failed or already applied (exit code: $MIGRATION_EXIT)"
  echo "📝 This might be OK if migrations already ran, but check logs above for errors"
else
  echo "✅ Migrations applied successfully"
fi

# Generate Prisma Client AFTER migrations (to ensure it matches the database)
echo "📦 Generating Prisma Client..."
npm run prisma:generate
PRISMA_GEN_EXIT=$?
if [ $PRISMA_GEN_EXIT -ne 0 ]; then
  echo "❌ Prisma generate failed (exit code: $PRISMA_GEN_EXIT)"
  echo "📝 This is critical - Prisma Client must be generated"
  exit 1
else
  echo "✅ Prisma Client generated successfully"
fi

# Seed database (only if not already seeded - will fail gracefully if data exists)
echo "🌱 Seeding database..."
npm run db:seed
SEED_EXIT=$?
if [ $SEED_EXIT -ne 0 ]; then
  echo "⚠️  Database seeding skipped (exit code: $SEED_EXIT)"
  echo "📝 This is OK if data already exists"
else
  echo "✅ Database seeded successfully"
fi

# Start the application
echo "✅ Starting NestJS application..."
echo "📂 Checking if dist/main.js exists..."
if [ ! -f "dist/main.js" ]; then
  echo "❌ dist/main.js not found! Build may have failed."
  echo "📂 Listing dist directory:"
  ls -la dist/ 2>/dev/null || echo "dist/ directory does not exist"
  exit 1
fi

echo "✅ Starting server..."
exec node dist/main.js

