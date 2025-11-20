# Run Migrations on Railway - Quick Guide

## The Problem

You're trying to run migrations locally, but `DATABASE_URL` points to `postgres.railway.internal:5432`, which is **only accessible from inside Railway's network**, not from your local machine.

## Solution: Run Migrations on Railway

You have two options:

### Option 1: Railway Dashboard Shell (Easiest)

1. **Go to Railway:**
   - https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483

2. **Open API Service Shell:**
   - Click your **API service** (not PostgreSQL)
   - Click **"Deployments"** tab
   - Click on **latest deployment**
   - Click **"Shell"** button

3. **Run Migrations:**
   ```bash
   cd apps/api
   npm run prisma:deploy
   ```

4. **Seed Database:**
   ```bash
   npm run db:seed
   ```

5. **Verify:**
   - Go to PostgreSQL service → "Data" tab
   - You should see tables: `sellers`, `coffees`, etc.

### Option 2: Wait for Automatic Migration

The startup script will run migrations automatically when Railway deploys. Just wait for the next deployment to complete.

## Why This Happens

- `postgres.railway.internal` is Railway's **internal network address**
- It's only accessible from services running **inside Railway**
- Your local machine can't reach it
- Railway Shell runs **inside Railway**, so it can access the database

## After Migrations

Once migrations complete:
- ✅ All tables will be created
- ✅ 5 sellers will be seeded
- ✅ 8 mock coffees will be available
- ✅ Your API will work!

## Quick Test

After migrations, test your API:
```bash
curl https://coffee-break-co-production.up.railway.app/health
curl https://coffee-break-co-production.up.railway.app/api/coffee-entries
```

You should see your 8 mock coffees! ☕

