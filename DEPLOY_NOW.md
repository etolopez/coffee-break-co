# 🚀 Deploy to Railway Now

## Your Railway Project

- **Project**: Coffee-co
- **Project ID**: `77902d5f-1af6-405b-a42d-28990545f483`
- **Domain**: `https://coffee-break-co-production.up.railway.app`
- **Dashboard**: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483

## Quick Deploy Steps

### Option 1: Via Railway Dashboard (Easiest) ⭐

1. **Go to your Railway project**: https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483

2. **Click "New"** → **"GitHub Repo"**

3. **Select repository**: `etolopez/coffee-break-co`

4. **Railway will automatically**:
   - Detect the Dockerfile
   - Build the API
   - Deploy to production

5. **Wait for deployment** (usually 2-5 minutes)

6. **Get your API URL**: 
   - Go to your service → Settings → Generate Domain
   - Or use: `https://coffee-break-co-production.up.railway.app`

### Option 2: Via CLI

```bash
cd apps/api

# Link to project (if not already)
railway link --project 77902d5f-1af6-405b-a42d-28990545f483

# Deploy
railway up
```

## Mobile App Configuration

Your mobile app is already configured with the Railway URL!

**Current API URL**: `https://coffee-break-co-production.up.railway.app`

The mobile app will use this URL automatically. To test:

```bash
cd apps/mobile
npm start
```

## Verify Deployment

**Test the API**:
```bash
curl https://coffee-break-co-production.up.railway.app/health
```

**Expected response**:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

## Troubleshooting

**If deployment fails**:
1. Check Railway dashboard → Deployments → View logs
2. Verify Dockerfile is at `apps/api/Dockerfile`
3. Check that shared package builds successfully

**If mobile app can't connect**:
1. Verify API is running: `curl https://coffee-break-co-production.up.railway.app/health`
2. Check CORS is enabled (it is by default)
3. Verify URL has no trailing slash

## Next Steps

1. ✅ Deploy to Railway (via dashboard or CLI)
2. ✅ Wait for build to complete
3. ✅ Test API: `curl https://coffee-break-co-production.up.railway.app/health`
4. ✅ Start mobile app: `cd apps/mobile && npm start`
5. ✅ Test mobile app connection

Your mobile app is ready to connect to Railway! 🎉
