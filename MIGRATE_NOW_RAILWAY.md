# Run Migrations on Railway - Step by Step

## The Problem
Your PostgreSQL database exists but has no tables. The startup script should create them automatically, but if the container isn't starting, migrations won't run.

## Solution: Manual Migration via Railway CLI

### Step 1: Link to Railway Service

```bash
cd apps/api
railway link
```

Select your project and API service when prompted.

### Step 2: Run Migrations

```bash
railway run sh scripts/migrate.sh
```

Or run commands directly:

```bash
railway run npm run prisma:deploy
railway run npm run db:seed
```

### Step 3: Verify Tables Exist

1. Go to Railway → PostgreSQL service
2. Click **"Data"** or **"Tables"** tab
3. You should see: `sellers`, `coffees`, `organizations`, etc.

## Alternative: Use Railway Dashboard

1. Go to Railway: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483
2. Click **API service** (not PostgreSQL)
3. Click **"Deployments"** tab
4. Click **latest deployment**
5. Look for **"Shell"** or **"Console"** button
6. Run:
   ```bash
   cd apps/api
   npm run prisma:deploy
   npm run db:seed
   ```

## What Gets Created

- ✅ All database tables from `schema.prisma`
- ✅ 5 sellers from `sellers-persistent.json`
- ✅ 8 coffees from `coffee-entries-persistent.json`

## After Migration

Test your API:

```bash
curl https://coffee-break-co-production.up.railway.app/health
curl https://coffee-break-co-production.up.railway.app/api/coffee-entries
```

You should see your data! ☕

