# 🔧 Troubleshooting Network Errors

## Current Issue: Network Error when fetching data

The mobile app is trying to connect to the API but getting network errors. Here's how to fix it:

## ✅ Step 1: Verify Next.js Web App is Running

The mobile app connects to the **Next.js web app** (port 3000), not the NestJS backend (port 4000).

**Check if it's running:**
```bash
# In a separate terminal
cd apps/web
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

## ✅ Step 2: Test API Endpoints

Test if the API is accessible:

```bash
# Test from your computer
curl http://localhost:3000/api/coffee-entries
curl http://localhost:3000/api/sellers
```

If these work, the API is running correctly.

## ✅ Step 3: Check API URL Configuration

The mobile app uses different URLs based on platform:

- **Android Emulator**: `http://10.0.2.2:3000` (maps to host's localhost)
- **iOS Simulator**: `http://localhost:3000`
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)

**To find your computer's IP:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or
ipconfig getifaddr en0
```

## ✅ Step 4: Update API URL for Physical Devices

If testing on a **physical device** (not emulator), update the API URL:

**Option A: Set environment variable**
```bash
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000 npm start
```

**Option B: Update app.json**
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP:3000"
    }
  }
}
```

Replace `YOUR_IP` with your computer's local IP address.

## ✅ Step 5: Check CORS Configuration

The Next.js app should have CORS headers configured in `next.config.js`. Verify:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        // ... other headers
      ],
    },
  ];
}
```

## ✅ Step 6: Restart Everything

1. **Stop the Expo dev server** (Ctrl+C)
2. **Restart Next.js web app** (if needed)
3. **Clear Expo cache and restart:**
   ```bash
   cd apps/mobile
   npx expo start --clear
   ```

## 🔍 Debugging Tips

Check the console logs in Expo. You should see:
- `🔗 API Base URL: http://10.0.2.2:3000` (or your configured URL)
- `📱 Platform: android` (or ios)
- `📡 API Request: GET /api/coffee-entries`

If you see network errors:
1. Verify Next.js is running on port 3000
2. Check the API URL matches your setup
3. For physical devices, use your computer's IP address
4. Check firewall isn't blocking port 3000

## 🚨 Common Issues

**"Network Error" on Android Emulator:**
- Make sure Next.js is running
- Verify URL is `http://10.0.2.2:3000` (not localhost)

**"Network Error" on Physical Device:**
- Use your computer's IP address, not localhost
- Make sure phone and computer are on same WiFi network
- Check firewall allows connections on port 3000

**"CORS Error":**
- Verify CORS headers in `next.config.js`
- Restart Next.js after changing config

## 📝 Quick Test

Run this to test the connection:
```bash
# Test from Android emulator perspective
adb shell
curl http://10.0.2.2:3000/api/coffee-entries
```

If this works, the connection is fine and the issue is in the app configuration.
