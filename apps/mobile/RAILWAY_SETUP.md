# 📱 Mobile App - Railway Backend Setup

## Quick Setup

After deploying your backend to Railway, update the mobile app to use the Railway URL.

## Option 1: Environment Variable (Recommended)

Create a `.env` file in `apps/mobile/`:

```bash
EXPO_PUBLIC_API_URL=https://your-app.railway.app
```

Then start Expo:
```bash
npx expo start
```

## Option 2: Update app.json

Edit `apps/mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-app.railway.app"
    }
  }
}
```

## Option 3: Runtime Configuration

The app will automatically use:
1. `EXPO_PUBLIC_API_URL` environment variable (highest priority)
2. `app.json` extra.apiUrl
3. Development defaults (localhost for emulators)

## Testing

1. **Get your Railway URL**:
   ```bash
   cd apps/api
   railway domain
   ```

2. **Update mobile app** with the Railway URL

3. **Test the connection**:
   - Open the mobile app
   - Check console logs for: `🔗 API Base URL: https://your-app.railway.app`
   - Verify coffees and sellers load correctly

## Development vs Production

- **Development**: Uses localhost/emulator addresses
- **Production**: Uses Railway URL from environment variable

## Troubleshooting

**Network errors?**
- Verify Railway app is deployed and running
- Check Railway URL is correct (no trailing slash)
- Verify CORS is enabled (it is by default)
- Check Railway logs: `railway logs`

**Can't connect?**
- Make sure Railway app is running
- Check the URL format: `https://your-app.railway.app` (not `http://`)
- Verify environment variable is set correctly
