# How to Access Railway Shell (Updated)

## Current Railway Interface

Railway's interface has changed. Here's how to access the shell/terminal:

### Method 1: Via Deployment Logs

1. Go to your Railway project
2. Click on your **API service**
3. Click **"Deployments"** tab
4. Click on the **latest deployment**
5. Look for **"View Logs"** or **"Terminal"** button
6. Some deployments have a **"Shell"** or **"Console"** option

### Method 2: Via Service Settings

1. Go to your Railway project
2. Click on your **API service**
3. Look for **"Settings"** or **"Configuration"**
4. Check for **"Shell"**, **"Terminal"**, or **"Console"** option

### Method 3: Use Railway CLI (If Available)

```bash
railway shell
```

### Method 4: Run Migrations via Railway Variables/Commands

Some Railway setups allow running commands directly:
1. Go to API service → Settings
2. Look for "Run Command" or "Execute Command"
3. Enter: `cd apps/api && npm run prisma:deploy`

## Alternative: Automatic Migration

The startup script will run migrations automatically when Railway deploys. Just wait for the deployment to complete.

## If Shell is Not Available

If you can't find the shell option:
1. **Wait for automatic migration** - The startup script handles it
2. **Check Railway logs** - See if migrations are running automatically
3. **Contact Railway support** - They can help you access the shell

## What to Run (When You Get Shell Access)

```bash
cd apps/api
npm run prisma:deploy
npm run db:seed
```

## Verify Migrations Ran

After migrations, check:
- PostgreSQL service → "Data" tab → Should show tables
- API health endpoint → Should return success
- Mobile app → Should be able to fetch coffees

