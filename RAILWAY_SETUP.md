# 🚂 Railway Setup Guide

## Project Information

- **Project ID**: `77902d5f-1af6-405b-a42d-28990545f483`
- **Environment**: Production
- **Project URL**: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483

## Current Setup

✅ **Backend API**: NestJS application ready for Railway
✅ **Dockerfile**: Configured for monorepo structure
✅ **Railway Config**: `railway.toml` at root
✅ **GitHub Connected**: Auto-deploys on push

## Deployment Steps

### 1. Create API Service (if not exists)

In Railway dashboard:
1. Go to your project
2. Click **"New"** → **"GitHub Repo"**
3. Select `etolopez/coffee-break-co`
4. Railway will auto-detect the Dockerfile

### 2. Configure Service Settings

**Root Directory**: Leave empty (builds from repo root)

**Build Settings**:
- Builder: Dockerfile
- Dockerfile Path: `apps/api/Dockerfile`

**Environment Variables**:
```
NODE_ENV=production
```

Railway automatically sets `PORT` - no need to set it manually.

### 3. Get Your API URL

After deployment:
```bash
cd apps/api
railway domain
```

Or in Railway dashboard:
- Go to your service
- Click **"Settings"** → **"Generate Domain"**
- Copy the URL (e.g., `https://your-api.up.railway.app`)

### 4. Update Mobile App

Once you have your Railway API URL:

**Option 1: Environment Variable**
```bash
cd apps/mobile
echo "EXPO_PUBLIC_API_URL=https://your-api.up.railway.app" > .env
```

**Option 2: Update app.json**
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-api.up.railway.app"
    }
  }
}
```

## Data Files

⚠️ **Important**: Railway uses ephemeral file system. JSON data files won't persist.

**Solutions**:

1. **Railway Volumes** (Recommended):
   - Create a volume in Railway
   - Mount to `/app/data`
   - Upload JSON files to volume

2. **Use PostgreSQL** (Better for production):
   - You already have Postgres service
   - Migrate data from JSON to database
   - Update services to use database

3. **Environment Variables**:
   - Store data in Railway environment variables (for small datasets)

## Monitoring

**Check Logs**:
```bash
cd apps/api
railway logs --tail 50
```

**Check Status**:
```bash
railway status
```

**View in Dashboard**:
- Go to your service
- Click **"Deployments"** tab
- View build logs and deployment status

## Troubleshooting

**Build Fails?**
- Check build logs in Railway dashboard
- Verify Dockerfile path is correct
- Ensure shared package builds successfully

**API Not Starting?**
- Check logs: `railway logs`
- Verify PORT is set (Railway does this automatically)
- Check if data files are accessible

**Mobile App Can't Connect?**
- Verify Railway URL is correct (no trailing slash)
- Check CORS is enabled (it is by default)
- Verify API is running: `curl https://your-api.up.railway.app/health`

## Quick Commands

```bash
# Link to Railway project
cd apps/api
railway link --project 77902d5f-1af6-405b-a42d-28990545f483

# Deploy
railway up

# Get domain
railway domain

# View logs
railway logs --tail 50

# Check status
railway status
```

## Next Steps

1. ✅ Create API service in Railway (if not exists)
2. ✅ Deploy backend
3. ✅ Get Railway API URL
4. ✅ Update mobile app with Railway URL
5. ✅ Test mobile app connection
