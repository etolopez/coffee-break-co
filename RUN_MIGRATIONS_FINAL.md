# Run Migrations on Railway - Final Guide

## Current Status

✅ **PostgreSQL is connected** - Database exists  
✅ **Startup script is ready** - Will run migrations automatically  
❌ **Tables don't exist yet** - Migrations need to run  

## The Solution

The startup script (`apps/api/scripts/start.sh`) **automatically runs migrations** when Railway deploys your code. However, if you want to run them manually right now:

## Method 1: Wait for Automatic Migration (Recommended)

The startup script will run migrations automatically on the next deploy. Just wait for Railway to finish deploying your latest code.

**Check Railway logs** to see:
- `🔄 Running database migrations...`
- `✅ Migration completed`
- `🌱 Seeding database...`

## Method 2: Railway Dashboard (If Available)

1. Go to Railway project
2. Click **API service**
3. Look for **"Shell"**, **"Terminal"**, **"Console"**, or **"Run Command"**
4. Run:
   ```bash
   cd apps/api
   npm run prisma:deploy
   npm run db:seed
   ```

## Method 3: Railway CLI (If Service is Linked)

If you can link to the specific service:

```bash
cd apps/api
railway link
railway run npm run prisma:deploy
railway run npm run db:seed
```

## Method 4: Check if Migrations Already Ran

Check Railway deployment logs. If you see:
- `✅ Migration completed` or `⚠️ Migration failed or already applied`
- Then migrations may have already run!

## Verify Tables Exist

1. Go to **PostgreSQL service** in Railway
2. Click **"Data"** or **"Tables"** tab
3. You should see: `sellers`, `coffees`, `organizations`, etc.

## What the Startup Script Does

When Railway starts your container, the script:
1. ✅ Checks DATABASE_URL is set
2. ✅ Generates Prisma Client
3. ✅ Runs `npm run prisma:deploy` (creates tables)
4. ✅ Runs `npm run db:seed` (adds 5 sellers + 8 coffees)
5. ✅ Starts the API

## If Migrations Fail

Check Railway logs for:
- Database connection errors
- Migration SQL errors
- Permission issues

The logs will show exactly what went wrong.

## Quick Test After Migration

```bash
curl https://coffee-break-co-production.up.railway.app/health
curl https://coffee-break-co-production.up.railway.app/api/coffee-entries
```

You should see your 8 mock coffees! ☕

