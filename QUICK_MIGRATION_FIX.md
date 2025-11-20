# Quick Fix: Create Tables in PostgreSQL

## The Issue
PostgreSQL database exists but has no tables. Migrations need to run.

## Fastest Solution: Railway Dashboard

### Step 1: Open Railway Shell
1. Go to: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483
2. Click **API service** (the one that's deployed, not PostgreSQL)
3. Click **"Deployments"** tab
4. Click the **latest deployment**
5. Look for **"Shell"**, **"Console"**, or **"Terminal"** button
6. Click it to open a shell

### Step 2: Run Migrations
In the Railway shell, run:

```bash
cd apps/api
npm run prisma:deploy
```

You should see:
```
✅ Applied migration: 0_init
```

### Step 3: Seed Database
```bash
npm run db:seed
```

You should see:
```
✅ Seeded 5 sellers
✅ Seeded 8 coffees
```

### Step 4: Verify
Go to **PostgreSQL service** → **"Data"** tab → You should see tables!

## Alternative: Wait for Auto-Migration

The improved startup script will run migrations automatically on the next deploy. Just wait 2-3 minutes after the latest code push.

## Test After Migration

```bash
curl https://coffee-break-co-production.up.railway.app/health
curl https://coffee-break-co-production.up.railway.app/api/coffee-entries
```

You should see your 8 coffees! ☕

