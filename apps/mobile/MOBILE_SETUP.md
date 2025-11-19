# 📱 Mobile App Setup - Standalone API

## ✅ What Changed

Your mobile app now uses the **NestJS backend API** (port 4000) instead of the Next.js web app. Everything is mobile-first!

## 🚀 Quick Start

### 1. Start the NestJS Backend

```bash
cd apps/api
npm run dev
```

You should see:
```
Coffee Digital Passport API running on port 4000
```

### 2. Start the Mobile App

```bash
cd apps/mobile
npx expo start
```

### 3. Test the Connection

The mobile app will automatically connect to:
- **Android Emulator**: `http://10.0.2.2:4000`
- **iOS Simulator**: `http://localhost:4000`
- **Physical Device**: Use your computer's IP (see below)

## 📡 API Endpoints

All endpoints are now in the NestJS backend:

- `GET /api/coffee-entries` - Get all coffees
- `GET /api/coffee-entries/:id` - Get coffee by ID
- `GET /api/coffee-entries/slug/:slug` - Get coffee by slug
- `GET /api/sellers` - Get all sellers
- `GET /api/sellers/:id` - Get seller by ID
- `GET /api/comments?coffeeId=:id` - Get comments/ratings

## 🔧 For Physical Devices

If testing on a real phone, update the API URL:

1. Find your computer's IP:
   ```bash
   ipconfig getifaddr en0  # macOS
   ```

2. Update `apps/mobile/app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "http://YOUR_IP:4000"
       }
     }
   }
   ```

3. Restart Expo: `npx expo start --clear`

## ✅ What's Working

- ✅ Coffee listings
- ✅ Seller listings  
- ✅ Coffee details
- ✅ Seller details
- ✅ QR code scanning
- ✅ Ratings/comments (stub - returns empty for now)

## 📝 Data Storage

The API reads from JSON files in the `data/` directory:
- `data/coffee-entries-persistent.json` - Coffee data
- `data/sellers-persistent.json` - Seller data

## 🎯 Next Steps

The mobile app is now fully independent! No need for the Next.js web app.

To add more features:
1. Add endpoints to `apps/api/src/`
2. Update mobile app services in `apps/mobile/src/services/api.ts`
3. Test and deploy!

## 🐛 Troubleshooting

**Network errors?**
- Make sure NestJS backend is running on port 4000
- Check CORS is enabled (it is by default)
- For physical devices, use your computer's IP address

**Data not loading?**
- Check the JSON files exist in `data/` directory
- Check backend logs for errors
- Verify API endpoints in browser: `http://localhost:4000/api/coffee-entries`
