# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for the Coffee Break backend on Railway.

## Overview

The backend has been migrated from JSON file storage to PostgreSQL using Prisma ORM. All coffee and seller data is now stored in a PostgreSQL database.

## Prerequisites

- Railway account (for production)
- Local PostgreSQL (optional, for development)

## Step 1: Add PostgreSQL to Railway

1. Go to your Railway project: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL database and provide a `DATABASE_URL` environment variable

## Step 2: Configure Environment Variables

Railway should automatically set `DATABASE_URL` when you add PostgreSQL. Verify it's set:

1. Go to your API service settings
2. Check that `DATABASE_URL` is present in the Variables tab
3. It should look like: `postgresql://user:password@host:port/database`

## Step 3: Run Database Migrations

After Railway deploys your code, you need to run migrations to create the database schema:

### Option A: Using Railway CLI (Recommended)

```bash
# Install Railway CLI if you haven't
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run npm run prisma:deploy

# Seed the database with mock data
railway run npm run db:seed
```

### Option B: Using Railway Dashboard

1. Go to your API service in Railway
2. Click on **"Deployments"** tab
3. Click on the latest deployment
4. Open **"Shell"** or **"Logs"**
5. Run:
   ```bash
   npm run prisma:deploy
   npm run db:seed
   ```

## Step 4: Verify Database Connection

After migrations and seeding, check your API health endpoint:

```bash
curl https://coffee-break-co-production.up.railway.app/health
```

The API should respond successfully.

## Local Development Setup

If you want to run PostgreSQL locally:

### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Create Local Database

```bash
createdb coffee_break
```

### Configure Local Environment

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/coffee_break?schema=public"
NODE_ENV=development
PORT=4000
```

### Run Migrations Locally

```bash
cd apps/api
npm run prisma:migrate
npm run db:seed
```

## Database Schema

The database includes the following main models:

- **Seller**: Coffee sellers/roasters
- **Coffee**: Coffee entries with full traceability data
- **Organization**: Multi-tenant organizations (for future use)
- **Product, Facility, Lot, Batch**: EPCIS traceability models
- **Certificate**: Certifications and credentials
- **EpcisEventRecord**: EPCIS event tracking
- **ScanEvent**: QR code scan analytics

## Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Apply migrations (production)
npm run prisma:deploy

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database with mock data
npm run db:seed
```

## Troubleshooting

### Database Connection Errors

1. **Check DATABASE_URL**: Ensure it's correctly set in Railway
2. **Check Network**: Railway PostgreSQL should be accessible from your API service
3. **Check Migrations**: Ensure migrations have been run

### Migration Errors

If migrations fail:

```bash
# Reset database (WARNING: Deletes all data)
railway run npx prisma migrate reset

# Then re-run migrations
railway run npm run prisma:deploy
railway run npm run db:seed
```

### Seed Script Errors

If seeding fails:

1. Check that JSON data files exist in `data/` directory
2. Verify DATABASE_URL is correct
3. Check that migrations have been applied

## Production Checklist

- [ ] PostgreSQL database added to Railway
- [ ] DATABASE_URL environment variable set
- [ ] Database migrations applied (`prisma:deploy`)
- [ ] Database seeded with initial data (`db:seed`)
- [ ] API health check passes
- [ ] Mobile app can connect to API

## Next Steps

Once PostgreSQL is set up:

1. Your API will automatically use the database instead of JSON files
2. All coffee and seller data will be stored in PostgreSQL
3. The mobile app will fetch data from the database-backed API
4. You can manage data through Prisma Studio or direct database access

## Support

If you encounter issues:

1. Check Railway logs for error messages
2. Verify DATABASE_URL format
3. Ensure migrations have been run
4. Check that seed script completed successfully

