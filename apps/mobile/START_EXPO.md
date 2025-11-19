# 🚀 Starting Your Coffee Break Expo App

## Quick Start

Your Expo app is fully configured and ready to run! Here's how to start it:

### 1. Start the Expo Development Server

```bash
cd apps/mobile
npm start
```

This will:
- Start Metro Bundler
- Open Expo Dev Tools in your browser
- Show a QR code for testing on physical devices

### 2. Choose Your Platform

Once the server starts, you can:

**Option A: Use Expo Go (Recommended for Testing)**
- Install **Expo Go** app on your iOS/Android device
- Scan the QR code shown in terminal/browser
- App will load on your device instantly!

**Option B: iOS Simulator**
- Press `i` in the terminal
- Or click "Run on iOS simulator" in Expo Dev Tools
- Requires Xcode (macOS only)

**Option C: Android Emulator**
- Press `a` in the terminal
- Or click "Run on Android device/emulator" in Expo Dev Tools
- Requires Android Studio

**Option D: Web Browser**
- Press `w` in the terminal
- Or click "Run in web browser" in Expo Dev Tools
- Opens in Chrome/Safari

### 3. Make Sure Your Backend is Running

The mobile app connects to your API at `http://localhost:4000`. 

**Before testing:**
```bash
# In a separate terminal, start your backend:
cd apps/api
npm run dev
```

## ✅ What's Configured

- ✅ Expo SDK 54
- ✅ Expo Router (file-based navigation)
- ✅ TypeScript
- ✅ All dependencies installed
- ✅ Metro bundler configured
- ✅ Camera permissions for QR scanning
- ✅ Theme and styling
- ✅ API service layer

## 📱 App Structure

```
apps/mobile/
├── src/
│   ├── app/              # Expo Router screens
│   │   ├── (tabs)/       # Tab navigation
│   │   │   ├── index.tsx    # Home
│   │   │   ├── coffees.tsx  # Coffees list
│   │   │   ├── sellers.tsx  # Sellers list
│   │   │   └── scanner.tsx  # QR scanner
│   │   └── _layout.tsx      # Root layout
│   ├── config/           # Configuration
│   ├── services/         # API services
│   └── types/            # TypeScript types
├── app.json              # Expo config
└── package.json          # Dependencies
```

## 🎯 Testing Checklist

- [ ] Home screen loads with hero section
- [ ] Coffees tab fetches and displays coffees
- [ ] Sellers tab fetches and displays sellers
- [ ] Scanner tab requests camera permission
- [ ] QR code scanning works
- [ ] Navigation between tabs works
- [ ] Pull-to-refresh works on list screens

## 🐛 Troubleshooting

**"Network error" when fetching data:**
- Check backend is running on port 4000
- Verify API URL in `src/config/api.ts`
- Check CORS settings on API server

**Camera doesn't work:**
- Grant permissions in device settings
- Check `app.json` has camera permissions
- Restart the app after granting permissions

**App won't start:**
- Run `npm run clean:install`
- Clear cache: `npx expo start --clear`
- Check `npx expo-doctor` for issues

**Metro bundler errors:**
- Clear cache: `npx expo start --clear`
- Delete `node_modules` and reinstall
- Check for TypeScript errors

## 🎉 You're All Set!

Your Coffee Break mobile app is ready to use with Expo! Just run `npm start` and choose your platform.

For more details, see `README.md` in the mobile directory.
