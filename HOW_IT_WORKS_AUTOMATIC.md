# How Automatic Migrations Work

## You Don't Need to Do Anything!

Railway **automatically** runs everything when it deploys your code. Here's how:

## What Happens Automatically

When Railway deploys your code:

1. **Railway builds your Docker image** (from Dockerfile)
2. **Railway starts the container**
3. **Railway runs the CMD** from Dockerfile: `sh ./scripts/start.sh`
4. **The startup script automatically:**
   - Generates Prisma Client
   - Runs `npm run prisma:deploy` (creates tables)
   - Runs `npm run db:seed` (adds data)
   - Starts the API server

## You Just Need To:

### Step 1: Wait for Deployment
- Go to Railway → Your API service
- Click **"Deployments"** tab
- Wait for the latest deployment to finish (2-3 minutes)

### Step 2: Check the Logs
- Click on the **latest deployment**
- Click **"View Logs"** or **"Logs"**
- Look for these messages:
  ```
  🚀 Starting Coffee Break API...
  📦 Generating Prisma Client...
  ✅ Prisma Client generated successfully
  🔄 Running database migrations...
  ✅ Migrations applied successfully
  🌱 Seeding database...
  ✅ Database seeded successfully
  ✅ Starting NestJS application...
  ```

### Step 3: Verify Tables Exist
- Go to **PostgreSQL service** (not API service)
- Click **"Data"** or **"Tables"** tab
- You should see: `sellers`, `coffees`, `organizations`, etc.

### Step 4: Test API
```bash
curl https://coffee-break-co-production.up.railway.app/health
```

## That's It!

**You don't run any commands.** Railway does everything automatically when it deploys.

The startup script (`apps/api/scripts/start.sh`) runs automatically every time the container starts.

## If Something Goes Wrong

Check the Railway logs - they'll show exactly what failed:
- Database connection issues
- Migration errors
- Seed errors
- API startup errors

But with the fixed Dockerfile, it should work! ✅

