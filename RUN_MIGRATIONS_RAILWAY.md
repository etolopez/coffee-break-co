# Run Migrations on Railway - Step by Step

Your PostgreSQL database is connected but has no tables yet. Here's how to create them:

## Quick Method: Railway Dashboard

1. **Go to Railway Dashboard:**
   - https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483

2. **Open Your API Service:**
   - Click on your **API service** (not PostgreSQL)
   - Click **"Deployments"** tab
   - Click on the **latest deployment**
   - Click **"Shell"** button

3. **Run Migrations:**
   ```bash
   cd apps/api
   npm run prisma:deploy
   ```

4. **Seed the Database:**
   ```bash
   npm run db:seed
   ```

5. **Verify Tables Created:**
   - Go to PostgreSQL service
   - Click **"Data"** tab
   - You should see tables: `sellers`, `coffees`, `organizations`, etc.

## What Tables Will Be Created

- ✅ **sellers** - Coffee sellers/roasters (5 sellers)
- ✅ **coffees** - Coffee entries (8 mock coffees)
- ✅ **organizations** - Multi-tenant organizations
- ✅ **products** - Product catalog
- ✅ **facilities** - Processing facilities
- ✅ **lots** - Coffee lots
- ✅ **batches** - Roasting batches
- ✅ **certificates** - Certifications
- ✅ **epcis_events** - Event tracking
- ✅ **scan_events** - Analytics
- ✅ **actor_users** - User accounts
- ✅ **idempotency_records** - API idempotency

## After Migrations

Once migrations complete:
- ✅ All tables will be created
- ✅ 5 sellers will be seeded
- ✅ 8 mock coffees will be available
- ✅ Your API will work!

## Troubleshooting

### "Migration failed"
- Check that DATABASE_URL is set in Railway
- Verify PostgreSQL service is running
- Check Railway logs for detailed errors

### "Tables already exist"
- That's fine! Just run: `npm run db:seed`

### "Seed failed"
- Check that JSON files are valid (I just fixed sellers-persistent.json)
- Verify data directory is accessible

## Next Steps

After migrations and seeding:
1. Your API will be fully functional
2. Mobile app will be able to fetch data
3. All 8 mock coffees will be visible

