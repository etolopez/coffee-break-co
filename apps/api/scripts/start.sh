#!/bin/sh
# Startup script for Railway deployment
# Runs migrations and seeds database before starting the app

set -e

echo "🚀 Starting Coffee Break API..."

# Change to API directory (handle both Docker paths)
if [ -d "/app/apps/api" ]; then
  cd /app/apps/api
elif [ -d "apps/api" ]; then
  cd apps/api
else
  echo "❌ Cannot find apps/api directory"
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  echo "Please add PostgreSQL database to Railway"
  exit 1
fi

# Generate Prisma Client (in case it wasn't generated during build)
echo "📦 Generating Prisma Client..."
npm run prisma:generate || {
  echo "⚠️  Prisma generate failed, but continuing..."
}

# Run database migrations
echo "🔄 Running database migrations..."
npm run prisma:deploy || {
  echo "⚠️  Migration failed or already applied, continuing..."
}

# Seed database (only if not already seeded - will fail gracefully if data exists)
echo "🌱 Seeding database..."
npm run db:seed || {
  echo "⚠️  Database seeding skipped (data may already exist)"
}

# Start the application
echo "✅ Starting NestJS application..."
exec node dist/main.js

