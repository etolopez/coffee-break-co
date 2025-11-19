# 🔧 Troubleshooting Guide

## Network Errors in Mobile App

If you see "Network Error" or "Cannot connect to API":

### Quick Fix: Run Backend Locally

**Terminal 1 - Start API:**
```bash
npm run api
# or
cd apps/api && npm run dev
```

**Terminal 2 - Start Mobile:**
```bash
npm start
```

The mobile app will automatically connect to `http://localhost:4000` (iOS) or `http://10.0.2.2:4000` (Android).

### Check API URL

In your Expo console, you should see:
```
🔗 API Base URL: http://localhost:4000
📱 Platform: ios
```

If it shows Railway URL but Railway isn't working, the app will fail to connect.

### Railway Backend Issues

If Railway returns 502 errors:

1. **Check Railway Dashboard**:
   - Go to https://railway.com/project/77902d5f-1af6-405b-a42d-28990545f483
   - Check deployment logs
   - Verify service is running

2. **Common Issues**:
   - Build failed (check build logs)
   - Application crashed (check runtime logs)
   - Wrong start command (should be `cd apps/api && node dist/main.js`)

3. **Temporary Solution**:
   - Run backend locally: `npm run api`
   - Mobile app will auto-connect to localhost

### Verify Connection

**Test Railway:**
```bash
curl https://coffee-break-co-production.up.railway.app/health
```

**Test Local:**
```bash
curl http://localhost:4000/health
```

### Switch Between Railway and Local

**Use Railway (Production):**
- Already configured in `app.json`
- Just make sure Railway is deployed and running

**Use Local (Development):**
```bash
# Start local backend
npm run api

# Mobile app will automatically use localhost
npm start
```

The mobile app prioritizes:
1. `EXPO_PUBLIC_API_URL` environment variable
2. `app.json` extra.apiUrl (Railway URL)
3. Development defaults (localhost)

## Common Solutions

**Problem**: Network errors
**Solution**: Start local backend with `npm run api`

**Problem**: Railway 502 errors  
**Solution**: Check Railway logs, or use local backend for development

**Problem**: Can't connect from physical device
**Solution**: Use your computer's IP address in `app.json` or `.env`
