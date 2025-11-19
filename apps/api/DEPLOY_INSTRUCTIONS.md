# 🚂 Railway Deployment Instructions

## Current Status

✅ Project linked: Coffee-co (77902d5f-1af6-405b-a42d-28990545f483)
✅ Postgres database service exists
⚠️ Need to create API service

## Steps to Deploy

### Option 1: Via Railway Dashboard (Recommended)

1. Go to your Railway project: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483
2. Click "New" → "GitHub Repo" or "Empty Service"
3. Select your repository or create a new service
4. Set the root directory to `apps/api`
5. Railway will auto-detect Node.js and use the build/start commands

### Option 2: Via CLI (Create New Service)

```bash
cd apps/api

# Unlink from Postgres service
railway unlink

# Create new service (interactive)
railway service

# Deploy
railway up
```

### Option 3: Use Existing Service

If service ID `7855f09e-762e-4f31-9386-0ab03ec43cbf` is your API service:

```bash
cd apps/api
railway link --project 77902d5f-1af6-405b-a42d-28990545f483 --service 7855f09e-762e-4f31-9386-0ab03ec43cbf
railway up
```

## Environment Variables to Set

In Railway dashboard, set these variables for your API service:

```
NODE_ENV=production
PORT=4000  # Railway sets this automatically, but good to have
```

## After Deployment

1. Get your API domain:
   ```bash
   railway domain
   ```

2. Update mobile app with Railway URL:
   - Create `apps/mobile/.env`:
     ```
     EXPO_PUBLIC_API_URL=https://your-api-service.up.railway.app
     ```

3. Test the API:
   ```bash
   curl https://your-api-service.up.railway.app/health
   ```

## Data Files

⚠️ **Important**: Railway uses ephemeral file system. JSON data files won't persist.

**Solutions:**
1. **Use Railway Volumes** (Recommended):
   - Create a volume in Railway dashboard
   - Mount to `/app/data`
   - Upload JSON files to volume

2. **Use PostgreSQL** (Better for production):
   - You already have Postgres service
   - Migrate data from JSON to database
   - Update services to use database instead of files

3. **Use External Storage**:
   - S3, Google Cloud Storage, etc.
   - Update services to fetch from storage

## Current Database Connection

Your Postgres service is available at:
- **Internal URL**: `postgres.railway.internal:5432`
- **Public URL**: `postgresql://postgres:...@yamanote.proxy.rlwy.net:58620/railway`

You can use these credentials to connect your API to the database.
