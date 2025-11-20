# Railway Migration Status

## Current Situation

✅ **PostgreSQL is connected** - Database exists on Railway  
❌ **No tables exist** - Migrations haven't been run yet  
✅ **Startup script ready** - Will run migrations automatically on next deploy  

## Why No Tables?

The migrations need to run **on Railway**, not locally. The `DATABASE_URL` environment variable is only available in Railway's environment.

## Automatic Migration (Recommended)

The startup script (`apps/api/scripts/start.sh`) will automatically:
1. ✅ Generate Prisma Client
2. ✅ Run migrations (`npm run prisma:deploy`)
3. ✅ Seed database (`npm run db:seed`)
4. ✅ Start the API

**This happens automatically when Railway deploys your code.**

## Manual Migration (If Needed)

If you want to run migrations manually right now:

1. **Go to Railway Dashboard:**
   - https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483

2. **Open API Service Shell:**
   - Click API service → Deployments → Latest → Shell

3. **Run:**
   ```bash
   cd apps/api
   npm run prisma:deploy
   npm run db:seed
   ```

## What Will Be Created

After migrations run, you'll have these tables:

### Main Tables
- **`sellers`** - 5 coffee sellers/roasters
- **`coffees`** - 8 mock coffee entries
- **`organizations`** - Multi-tenant organizations

### EPCIS/Traceability Tables
- **`products`** - Product catalog
- **`facilities`** - Processing facilities  
- **`lots`** - Coffee lots
- **`batches`** - Roasting batches
- **`certificates`** - Certifications
- **`epcis_events`** - Event tracking
- **`scan_events`** - Analytics

### System Tables
- **`actor_users`** - User accounts
- **`idempotency_records`** - API idempotency

## Next Deploy

When Railway deploys your latest code:
- ✅ Startup script will run migrations automatically
- ✅ Database will be seeded with 5 sellers and 8 coffees
- ✅ API will start successfully
- ✅ Mobile app will be able to fetch data

## Verify After Migration

1. **Check Railway PostgreSQL:**
   - Go to PostgreSQL service → Data tab
   - You should see all tables listed

2. **Test API:**
   ```bash
   curl https://coffee-break-co-production.up.railway.app/health
   curl https://coffee-break-co-production.up.railway.app/api/coffee-entries
   ```

3. **Check Mobile App:**
   - Reload Expo app (press `r`)
   - Coffees should load from Railway

## Troubleshooting

### "DATABASE_URL not found" (Local)
- ✅ This is **normal** - DATABASE_URL only exists on Railway
- ✅ Migrations will run automatically on Railway

### "Migration failed" (Railway)
- Check Railway logs for detailed errors
- Verify PostgreSQL service is running
- Ensure DATABASE_URL is set in Railway variables

### "Tables already exist"
- That's fine! Just seed: `npm run db:seed`

