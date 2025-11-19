# Run Database Migrations on Railway

Your database is connected, but the tables haven't been created yet. Here's how to fix it:

## Quick Fix (Recommended)

The easiest way is to use Railway's shell to run migrations:

### Step 1: Open Railway Shell

1. Go to your Railway project
2. Click on your **API service** (not the database)
3. Click on **"Deployments"** tab
4. Click on the latest deployment
5. Click **"Shell"** or **"View Logs"** → **"Open Shell"**

### Step 2: Run Migrations

In the Railway shell, run:

```bash
cd apps/api
npm run prisma:deploy
```

This will create all the database tables.

### Step 3: Seed the Database

After migrations succeed, seed the database with your mock data:

```bash
npm run db:seed
```

### Step 4: Verify

Check that your API is working:

```bash
curl https://coffee-break-co-production.up.railway.app/health
```

## Alternative: Automatic Migration on Startup

I've also created a startup script that will automatically run migrations when the app starts. After you push the latest code:

1. The app will automatically run migrations on startup
2. Then it will seed the database
3. Then it will start the API

This means future deployments will automatically migrate!

## Manual Migration (If Shell Doesn't Work)

If Railway shell doesn't work, you can also:

1. **Use Railway CLI:**
   ```bash
   railway run npm run prisma:deploy
   railway run npm run db:seed
   ```

2. **Or connect directly to PostgreSQL:**
   - Get connection details from Railway PostgreSQL service
   - Connect using `psql` or a database client
   - The migration SQL is in `apps/api/prisma/migrations/0_init/migration.sql`

## Troubleshooting

### "Migration failed"

- Check that `DATABASE_URL` is set in Railway
- Verify PostgreSQL service is running
- Check Railway logs for detailed error messages

### "Tables already exist"

- This is fine! It means migrations were already run
- Just run the seed: `npm run db:seed`

### "Prisma Client not generated"

```bash
npm run prisma:generate
npm run prisma:deploy
```

## What Gets Created

The migration creates these tables:
- `sellers` - Coffee sellers/roasters
- `coffees` - Coffee entries
- `organizations` - Multi-tenant organizations
- `products`, `facilities`, `lots`, `batches` - EPCIS models
- `certificates` - Certifications
- `epcis_events` - Event tracking
- `scan_events` - Analytics

After seeding, you'll have:
- 5 sellers
- 8 coffees (the mock data we created)

## Next Steps

Once migrations and seeding are complete:
1. ✅ Your API will be accessible
2. ✅ Mobile app can fetch data
3. ✅ All mock coffees will be available

