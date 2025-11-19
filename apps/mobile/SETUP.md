# Quick Setup Guide

## Assets Setup

Expo will generate placeholder assets automatically, but for production you'll want to add:

1. **Icon** (`assets/icon.png`): 1024x1024 PNG
2. **Splash** (`assets/splash.png`): 1242x2436 PNG  
3. **Adaptive Icon** (`assets/adaptive-icon.png`): 1024x1024 PNG (Android)

You can use Expo's asset generator:
```bash
npx expo install expo-asset
```

Or create them manually with a coffee-themed design.

## Running the App

1. Make sure your backend API is running on `http://localhost:4000`

2. Start the Expo dev server:
```bash
npm start
```

3. Then:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone
   - Press `w` for web browser

## Testing

- **Home Screen**: Should show hero section and features
- **Coffees Screen**: Should fetch and display coffees from API
- **Sellers Screen**: Should fetch and display sellers from API
- **Scanner Screen**: Should request camera permission and scan QR codes

## Troubleshooting

If you see "Network error" when fetching data:
- Check that the API server is running on port 4000
- Update `src/config/api.ts` if your API is on a different port
- Check CORS settings on the API server

If camera doesn't work:
- Grant camera permissions in device settings
- Check `app.json` has camera permissions configured
