# How to Check Railway Logs and Fix Deployment Issues

## Step 1: Check Railway Deployment Status

1. Go to your Railway project: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483
2. Click on your **API service** (not the PostgreSQL database)
3. Check the **"Deployments"** tab
4. Look for the latest deployment - it should show:
   - ✅ **Active** (green) - means it's running
   - ⏳ **Building** - means it's still deploying
   - ❌ **Failed** - means there was an error

## Step 2: View Railway Logs

### Option A: From Deployment Page
1. Click on the **latest deployment**
2. Click **"View Logs"** or **"Logs"** button
3. Scroll through the logs to see what happened

### Option B: From Service Page
1. Go to your **API service**
2. Click **"Logs"** tab (if available)
3. View real-time logs

## Step 3: What to Look For in Logs

### ✅ Good Signs (Everything Working):
```
🚀 Starting Coffee Break API...
✅ DATABASE_URL is set
📦 Generating Prisma Client...
✅ Prisma Client generated successfully
🔄 Running database migrations...
✅ Migrations applied successfully
🌱 Seeding database...
✅ Database seeded successfully
✅ Starting NestJS application...
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [PrismaService] ✅ Successfully connected to PostgreSQL database
Coffee Digital Passport API running on port XXXX
```

### ❌ Bad Signs (Problems):
```
❌ DATABASE_URL is not set!
❌ Migration failed
❌ Database seeding failed
❌ Failed to connect to PostgreSQL database
Error: Column 'sellers.userId' does not exist
```

## Step 4: Common Issues and Fixes

### Issue 1: "Column sellers.userId does not exist"
**Fix**: The migration needs to run. Check if you see:
- `🔄 Running database migrations...` in logs
- If not, the migration might not have run

**Solution**: The migration file is now in the repo. Railway should run it automatically on next deploy.

### Issue 2: "No coffees/sellers appearing"
**Possible causes**:
1. Database not seeded
2. Migration didn't run
3. API returning empty arrays

**Check**:
1. Look for `✅ Database seeded successfully` in logs
2. Check if you see `✅ Migrations applied successfully`
3. Test API directly: `curl https://coffee-break-co-production.up.railway.app/api/coffee-entries`

### Issue 3: "Migration failed or already applied"
**This is OK!** It means:
- Migrations were already run
- Or the migration file format is wrong

**Check**: Look for the actual error message after this line.

## Step 5: Force a New Deployment

If you want to trigger a new deployment:

1. **Make a small change** (like updating a comment)
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Trigger Railway redeploy"
   git push origin main
   ```
3. **Wait 2-3 minutes** for Railway to build and deploy
4. **Check logs** again

## Step 6: Test the API

After deployment, test if it's working:

```bash
# Health check
curl https://coffee-break-co-production.up.railway.app/health

# Get coffees (should return array)
curl https://coffee-break-co-production.up.railway.app/api/coffee-entries

# Get sellers (should return array)
curl https://coffee-break-co-production.up.railway.app/api/sellers
```

## Step 7: Check Database Tables

1. Go to **PostgreSQL service** in Railway
2. Click **"Data"** or **"Tables"** tab
3. You should see:
   - `sellers` table (with `userId` column)
   - `coffees` table
   - `users` table
   - `user_profiles` table
   - `user_favorites` table

If `sellers` table doesn't have `userId` column, the migration didn't run.

## Quick Debugging Commands

If you have Railway CLI access:

```bash
# Link to project
railway link

# Check logs
railway logs

# Run migration manually
railway run npm run prisma:deploy

# Seed database manually
railway run npm run db:seed
```

## What Should Happen on Next Deploy

1. ✅ Railway detects new commit
2. ✅ Builds Docker image
3. ✅ Starts container
4. ✅ Runs `start.sh` script
5. ✅ Generates Prisma Client
6. ✅ Runs migrations (adds `userId` column)
7. ✅ Seeds database (adds sellers and coffees)
8. ✅ Starts API server
9. ✅ API should return data

## If Still Not Working

1. **Check Railway logs** for specific error messages
2. **Verify DATABASE_URL** is set in Railway environment variables
3. **Check PostgreSQL service** is running
4. **Test database connection** from Railway shell
5. **Share the error logs** so we can debug further

