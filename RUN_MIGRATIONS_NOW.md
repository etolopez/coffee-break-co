# Run Migrations Now - Quick Guide

Since Railway CLI needs interactive input, here are two ways to run migrations:

## Option 1: Railway Dashboard (Easiest - 2 minutes)

1. **Go to Railway Dashboard:**
   - https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483

2. **Open Your API Service:**
   - Click on your API service (not the PostgreSQL service)
   - Click **"Deployments"** tab
   - Click on the **latest deployment**
   - Click **"Shell"** button (or "View Logs" → "Open Shell")

3. **Run These Commands:**
   ```bash
   cd apps/api
   npm run prisma:deploy
   npm run db:seed
   ```

4. **Verify:**
   ```bash
   curl https://coffee-break-co-production.up.railway.app/health
   ```

That's it! Your database will be set up.

## Option 2: Automatic on Next Deploy

I've updated the code so migrations run automatically when you deploy. Just:

1. **Commit and push the changes:**
   ```bash
   git add .
   git commit -m "Fix Prisma schema and add auto-migration"
   git push origin main
   ```

2. **Wait for Railway to deploy** (2-3 minutes)

3. **The startup script will automatically:**
   - Generate Prisma Client
   - Run migrations
   - Seed the database
   - Start the API

## What Gets Created

- ✅ All database tables (sellers, coffees, etc.)
- ✅ 5 sellers from your JSON data
- ✅ 8 mock coffees we created earlier

## Troubleshooting

### "DATABASE_URL not found"
- Make sure PostgreSQL is added to Railway
- Check that DATABASE_URL is in your API service variables

### "Migration already applied"
- That's fine! Just run: `npm run db:seed`

### "Tables already exist"
- Skip migration, just seed: `npm run db:seed`

## Quick Test

After migrations complete, test your API:

```bash
# Health check
curl https://coffee-break-co-production.up.railway.app/health

# Get coffees
curl https://coffee-break-co-production.up.railway.app/api/coffee-entries

# Get sellers
curl https://coffee-break-co-production.up.railway.app/api/sellers
```

You should see your 8 mock coffees! ☕

