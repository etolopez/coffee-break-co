# Run Migrations Without Railway Shell

## The Problem
Railway doesn't have a "Shell" option. Migrations need to run automatically or via Railway CLI.

## Solution: Automatic Migration (Fixed!)

I've fixed the Dockerfile so the startup script runs correctly. The next Railway deployment will:

1. ✅ Start the container
2. ✅ Run `prisma:deploy` (creates tables)
3. ✅ Run `db:seed` (adds data)
4. ✅ Start the API server

**Just wait for Railway to finish deploying the latest code!**

## Check Migration Status

### Step 1: Check Railway Logs
1. Go to Railway → API service
2. Click **"Deployments"** tab
3. Click **latest deployment**
4. Click **"View Logs"** or **"Logs"**

Look for:
- ✅ `🔄 Running database migrations...`
- ✅ `✅ Migrations applied successfully`
- ✅ `🌱 Seeding database...`
- ✅ `✅ Database seeded successfully`
- ✅ `✅ Starting NestJS application...`

### Step 2: Verify Tables
1. Go to **PostgreSQL service**
2. Click **"Data"** or **"Tables"** tab
3. You should see: `sellers`, `coffees`, `organizations`, etc.

### Step 3: Test API
```bash
curl https://coffee-break-co-production.up.railway.app/health
curl https://coffee-break-co-production.up.railway.app/api/coffee-entries
```

## If Migrations Still Don't Run

### Option 1: Railway CLI (If You Have It Set Up)
```bash
cd apps/api
railway link  # Link to your project
railway run npm run prisma:deploy
railway run npm run db:seed
```

### Option 2: Check Railway Logs
The logs will show exactly what's failing. Common issues:
- DATABASE_URL not set (but we confirmed it is ✅)
- Prisma Client not generated
- Migration SQL errors

## What Was Fixed

The Dockerfile was copying scripts to the wrong path. Now:
- Scripts are copied to `/app/apps/api/scripts/`
- CMD runs from `/app/apps/api/`
- Path `./scripts/start.sh` is correct ✅

The container should now start successfully and run migrations automatically!

