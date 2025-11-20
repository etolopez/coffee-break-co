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
echo "📂 Checking migration files..."
ls -la prisma/migrations/ || echo "⚠️  Could not list migrations directory"

# Run migrations with verbose output
npm run prisma:deploy 2>&1 | tee /tmp/migration.log
MIGRATION_EXIT=$?

if [ $MIGRATION_EXIT -ne 0 ]; then
  echo "⚠️  Migration command exited with code: $MIGRATION_EXIT"
  echo "📝 Migration output:"
  cat /tmp/migration.log || echo "Could not read migration log"
  echo ""
  echo "🔄 Attempting to verify if users table exists..."
  
  # Try to check if users table exists using Prisma
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.\$queryRaw\`SELECT 1 FROM users LIMIT 1\`
      .then(() => {
        console.log('✅ Users table exists');
        process.exit(0);
      })
      .catch((err) => {
        console.error('❌ Users table does NOT exist:', err.message);
        process.exit(1);
      })
      .finally(() => prisma.\$disconnect());
  " 2>&1
  
  USERS_TABLE_EXISTS=$?
  if [ $USERS_TABLE_EXISTS -ne 0 ]; then
    echo "❌ CRITICAL: Users table does not exist and migrations failed!"
    echo "🔧 Attempting emergency fix: running ensure_users_table.sh..."
    sh ./scripts/ensure_users_table.sh
    EMERGENCY_FIX_EXIT=$?
    if [ $EMERGENCY_FIX_EXIT -eq 0 ]; then
      echo "✅ Emergency fix succeeded - users table created!"
    else
      echo "❌ Emergency fix also failed!"
      echo "📝 This means authentication will not work."
      echo "📝 Please check Railway logs above for migration errors."
      echo "📝 You may need to manually run migrations via Railway Shell."
    fi
  else
    echo "✅ Users table exists - migrations may have already been applied"
  fi
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

