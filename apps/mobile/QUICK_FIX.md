# 🚨 Quick Fix for Network Errors

## The Problem
Your mobile app can't connect to the API because the **Next.js web app isn't running**.

## ✅ Solution (2 steps)

### Step 1: Start the Next.js Web App

Open a **new terminal** and run:

```bash
cd apps/web
npm run dev
```

Wait until you see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

### Step 2: Reload Your Expo App

In your Expo terminal, press `r` to reload, or shake your device and select "Reload".

## ✅ Verify It's Working

After starting Next.js, you should see in the Expo console:
- `🔗 API Base URL: http://10.0.2.2:3000` (Android) or `http://localhost:3000` (iOS)
- `📡 API Request: GET /api/coffee-entries`
- `✅ API Response: 200`

## 📱 For Physical Devices

If testing on a **real phone** (not emulator), you need your computer's IP:

1. Find your IP:
   ```bash
   ipconfig getifaddr en0  # macOS
   # or
   ifconfig | grep "inet "  # Linux
   ```

2. Update the API URL in `app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "http://YOUR_IP:3000"
       }
     }
   }
   ```

3. Restart Expo: `npx expo start --clear`

## 🎯 That's It!

Once Next.js is running on port 3000, your mobile app will connect automatically.
