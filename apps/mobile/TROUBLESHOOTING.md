# Mobile App Troubleshooting Guide

## Connection Issues

### API Not Responding

If you see "Network Error" or "Unable to connect to the backend API":

1. **Check Railway Backend Status**
   - Verify the backend is deployed and running on Railway
   - Check Railway logs for errors
   - Test the API directly: `curl https://coffee-break-co-production.up.railway.app/health`

2. **Check API URL Configuration**
   - In development: The app should use `http://10.0.2.2:4000` (Android) or `http://localhost:4000` (iOS)
   - In production: The app uses the Railway URL from `EXPO_PUBLIC_API_URL` or `app.json`

3. **Verify Database Connection**
   - Ensure PostgreSQL is set up on Railway
   - Check that migrations have been run
   - Verify the database has been seeded

### Development Mode

If running locally:

1. **Start the Backend**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Check API is Running**
   ```bash
   curl http://localhost:4000/health
   ```

3. **Reload Expo App**
   - Press `r` in the Expo terminal
   - Or shake your device and select "Reload"

## Common Issues

### "No coffees available"

This usually means:
- Backend API is not running
- Database is not seeded
- Network connection issue

**Solution:**
1. Check Railway backend is deployed
2. Run database seed: `railway run npm run db:seed`
3. Verify API endpoint: `curl https://coffee-break-co-production.up.railway.app/api/coffee-entries`

### "Network Error"

**Possible causes:**
- Backend is down
- Wrong API URL
- CORS issues
- Firewall blocking connection

**Solution:**
1. Check backend status on Railway
2. Verify API URL in `apps/mobile/src/config/api.ts`
3. Check Railway logs for errors

### Database Connection Errors

If you see database-related errors:

1. **Check DATABASE_URL**
   - Verify it's set in Railway environment variables
   - Format: `postgresql://user:password@host:port/database`

2. **Run Migrations**
   ```bash
   railway run npm run prisma:deploy
   ```

3. **Seed Database**
   ```bash
   railway run npm run db:seed
   ```

## Getting Help

1. Check Railway deployment logs
2. Check API health endpoint
3. Verify database connection
4. Review `POSTGRESQL_SETUP.md` for database setup

