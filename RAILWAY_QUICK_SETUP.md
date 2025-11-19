# Railway Quick Setup - Fix 502 Error

Your backend is returning a 502 error because PostgreSQL isn't set up yet. Follow these steps:

## Step 1: Add PostgreSQL Database

1. Go to your Railway project: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483
2. Click **"+ New"** button (top right)
3. Select **"Database"** → **"Add PostgreSQL"**
4. Railway will automatically:
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable
   - Link it to your API service

## Step 2: Wait for Database to Provision

- Wait 1-2 minutes for Railway to provision the database
- You'll see a new PostgreSQL service in your project

## Step 3: Run Database Migrations

After the database is created, you need to run migrations:

### Option A: Using Railway Dashboard

1. Go to your **API service** (not the database)
2. Click on **"Deployments"** tab
3. Click on the latest deployment
4. Click **"View Logs"** or open **"Shell"**
5. Run these commands:

```bash
cd apps/api
npm run prisma:generate
npm run prisma:deploy
npm run db:seed
```

### Option B: Using Railway CLI

```bash
# Install Railway CLI (if not installed)
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run --service <your-api-service-name> npm run prisma:deploy

# Seed database
railway run --service <your-api-service-name> npm run db:seed
```

## Step 4: Verify Setup

1. Check Railway logs - you should see:
   ```
   ✅ Successfully connected to PostgreSQL database
   Coffee Digital Passport API running on port XXXX
   ```

2. Test the API:
   ```bash
   curl https://coffee-break-co-production.up.railway.app/health
   ```

   Should return: `{"status":"ok",...}`

3. Test coffees endpoint:
   ```bash
   curl https://coffee-break-co-production.up.railway.app/api/coffee-entries
   ```

## Troubleshooting

### Still Getting 502?

1. **Check Railway Logs**
   - Go to your API service → "Deployments" → Latest deployment → "Logs"
   - Look for error messages about database connection

2. **Verify DATABASE_URL**
   - Go to API service → "Variables" tab
   - Ensure `DATABASE_URL` is set
   - Format: `postgresql://user:password@host:port/database`

3. **Check Database Status**
   - Go to PostgreSQL service
   - Ensure it shows "Active" status

4. **Redeploy After Adding Database**
   - Sometimes you need to trigger a new deployment
   - Go to API service → "Settings" → "Redeploy"

### Migration Errors?

If migrations fail:

```bash
# Reset and retry (WARNING: Deletes all data)
railway run npx prisma migrate reset --force
railway run npm run prisma:deploy
railway run npm run db:seed
```

### Prisma Client Not Generated?

```bash
railway run npm run prisma:generate
```

## Expected Timeline

- Database provisioning: 1-2 minutes
- Running migrations: 30 seconds
- Seeding data: 10-30 seconds
- **Total: ~3 minutes**

## Next Steps

Once the database is set up:
- ✅ Your API will be accessible
- ✅ Mobile app will be able to fetch data
- ✅ All 8 mock coffees will be available

See `POSTGRESQL_SETUP.md` for more detailed information.

