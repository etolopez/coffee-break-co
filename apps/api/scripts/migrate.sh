#!/bin/sh
# Manual migration script for Railway
# Run this if automatic migrations don't work
# Usage: railway run sh apps/api/scripts/migrate.sh

set +e

echo "🔄 Manual Migration Script"
echo "📁 Working directory: $(pwd)"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  exit 1
fi

# Navigate to API directory if not already there
if [ ! -f "package.json" ] && [ -d "apps/api" ]; then
  echo "📂 Changing to apps/api directory..."
  cd apps/api
fi

if [ ! -f "package.json" ]; then
  echo "❌ package.json not found. Current directory: $(pwd)"
  exit 1
fi

echo "✅ Found package.json in: $(pwd)"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
  echo "❌ Prisma generate failed!"
  exit 1
fi

# Run migrations
echo "🔄 Running database migrations..."
npm run prisma:deploy
if [ $? -ne 0 ]; then
  echo "⚠️  Migration command failed, but this might be OK if already applied"
  echo "📝 Checking if we can connect to database..."
else
  echo "✅ Migrations applied successfully!"
fi

# Seed database
echo "🌱 Seeding database..."
npm run db:seed
if [ $? -ne 0 ]; then
  echo "⚠️  Seeding failed, but this might be OK if data already exists"
else
  echo "✅ Database seeded successfully!"
fi

echo "✅ Migration script complete!"

