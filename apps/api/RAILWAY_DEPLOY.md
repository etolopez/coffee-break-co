# 🚂 Deploying to Railway

## Quick Deploy

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway project** (from `apps/api` directory):
   ```bash
   cd apps/api
   railway init
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

## Environment Variables

Set these in Railway dashboard or via CLI:

```bash
# Required
NODE_ENV=production
PORT=4000  # Railway will set this automatically

# Optional - if you want to use a different data directory
DATA_DIR=/app/data
```

## Data Files

Railway doesn't persist file system changes by default. You have two options:

### Option 1: Use Railway Volumes (Recommended for production)

1. Create a volume in Railway dashboard
2. Mount it to `/app/data`
3. Upload your JSON files to the volume

### Option 2: Use Environment Variables or External Storage

For production, consider:
- Moving data to a database (PostgreSQL, MongoDB)
- Using Railway's PostgreSQL service
- Using external storage (S3, etc.)

## Manual Deploy Steps

1. **Link to Railway project**:
   ```bash
   railway link
   ```

2. **Set environment variables**:
   ```bash
   railway variables set NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   railway up
   ```

4. **Get your Railway URL**:
   ```bash
   railway domain
   ```

## Update Mobile App

After deployment, update your mobile app's API URL:

1. Get your Railway URL (e.g., `https://your-app.railway.app`)
2. Update `apps/mobile/app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "https://your-app.railway.app"
       }
     }
   }
   ```

Or set it via environment variable:
```bash
EXPO_PUBLIC_API_URL=https://your-app.railway.app npx expo start
```

## Monitoring

- Check logs: `railway logs`
- View metrics in Railway dashboard
- Set up alerts for errors

## Troubleshooting

**Build fails?**
- Check `railway.json` configuration
- Verify `package.json` has correct build/start scripts

**App won't start?**
- Check logs: `railway logs`
- Verify PORT environment variable is set
- Verify data files are accessible (if using file storage)

**CORS errors?**
- Railway URL is already configured for CORS (allows all origins)
- Check mobile app is using correct Railway URL
