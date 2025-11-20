# Fix 500 Error on Sellers Endpoint

## The Problem
The `/api/sellers` endpoint is returning a 500 Internal Server Error. This is likely because:
1. The database migration to add `userId` column hasn't been applied yet
2. Prisma Client was generated with the new schema, but the database doesn't have the column

## The Solution

### Step 1: Check Railway Logs
1. Go to Railway: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483
2. Click on your **API service**
3. Click **"Deployments"** tab
4. Click the **latest deployment**
5. Click **"View Logs"**

Look for:
- `🔄 Running database migrations...`
- `✅ Migrations applied successfully` OR `⚠️ Migration failed or already applied`

### Step 2: Check if Migration Ran
If you see `⚠️ Migration failed or already applied`, the migration might have failed. Check the logs for specific error messages.

### Step 3: Verify Database Schema
The migration file `apps/api/prisma/migrations/add_user_id_to_sellers/migration.sql` should add:
- `userId` column to `sellers` table
- Index on `userId`
- Foreign key constraint

### Step 4: Manual Migration (If Needed)
If the migration didn't run automatically, you can run it manually via Railway CLI:

```bash
railway link
railway run npm run prisma:deploy
```

Or check Railway logs to see the exact error.

## What the Error Means
- **500 Internal Server Error**: Server-side error, likely database schema mismatch
- The Prisma schema expects `userId` column, but database doesn't have it
- OR Prisma Client needs to be regenerated after migration

## Expected Behavior After Fix
Once the migration is applied:
- `/api/sellers` should return 200 with seller data
- `/api/coffee-entries` should work (already working)
- All endpoints should function correctly

## Quick Test
After checking logs, test the endpoint:
```bash
curl https://coffee-break-co-production.up.railway.app/api/sellers
```

Should return JSON array of sellers, not 500 error.

