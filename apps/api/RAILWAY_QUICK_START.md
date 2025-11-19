# 🚂 Railway Quick Start Guide

## ✅ Project Connected!

Your project is linked to Railway:
- **Project**: Coffee-co
- **Project ID**: `77902d5f-1af6-405b-a42d-28990545f483`
- **Environment**: production

## 🎯 Next Steps: Create API Service

You currently have a **Postgres** service. You need to create a **separate service** for your API.

### Option 1: Via Railway Dashboard (Easiest) ⭐

1. **Go to your Railway project**: 
   https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483

2. **Click "New"** → **"GitHub Repo"** (if your code is on GitHub) or **"Empty Service"**

3. **If using GitHub**:
   - Select your repository
   - Set **Root Directory** to: `apps/api`
   - Railway will auto-detect Node.js

4. **If using Empty Service**:
   - Click "Empty Service"
   - Connect your GitHub repo or upload code
   - Set root directory to `apps/api`

5. **Railway will automatically**:
   - Detect it's a Node.js app
   - Run `npm install` and `npm run build`
   - Start with `npm run start:prod`

6. **Get your API URL**:
   - Click on the service
   - Go to "Settings" → "Generate Domain"
   - Copy the URL (e.g., `https://your-api.up.railway.app`)

### Option 2: Via CLI

```bash
cd apps/api

# Unlink from Postgres
railway unlink

# Create new service (this will prompt you)
railway service

# Deploy
railway up
```

## 📝 Environment Variables

In your **API service** (not Postgres), set:

```
NODE_ENV=production
```

Railway automatically sets `PORT`, so you don't need to set it.

## 🔗 Connect Mobile App

Once you have your API URL:

1. **Create `.env` file** in `apps/mobile/`:
   ```bash
   EXPO_PUBLIC_API_URL=https://your-api-service.up.railway.app
   ```

2. **Restart Expo**:
   ```bash
   cd apps/mobile
   npx expo start --clear
   ```

## 🗄️ Database Connection (Optional)

If you want to use the Postgres database instead of JSON files:

1. **Get database URL** from Postgres service variables:
   ```bash
   railway variables
   ```

2. **Set in API service**:
   ```
   DATABASE_URL=postgresql://postgres:...@yamanote.proxy.rlwy.net:58620/railway
   ```

3. **Update services** to use database instead of JSON files

## 📊 Check Deployment Status

```bash
cd apps/api
railway logs --tail 50
railway status
railway domain
```

## 🐛 Troubleshooting

**Service not found?**
- Make sure you created a new service (not using Postgres)
- Check Railway dashboard for all services

**Build fails?**
- Check build logs in Railway dashboard
- Verify `package.json` has correct scripts
- Check `railway.json` configuration

**Can't connect from mobile?**
- Verify API service is running (check logs)
- Check CORS is enabled (it is by default)
- Verify Railway URL is correct (no trailing slash)

## 📚 Current Configuration

- ✅ `railway.json` - Railway config
- ✅ `nixpacks.toml` - Build configuration  
- ✅ `main.ts` - Uses `PORT` from environment
- ✅ CORS enabled for mobile app
- ✅ Data files support `DATA_DIR` env var

Your API is ready to deploy! Just create the service in Railway dashboard.
