# 🚀 Quick Start Guide

## Run from Root Directory

You can now run everything from the project root!

### Mobile App (Expo)

```bash
# Start Expo
npm start

# Or explicitly
npm run mobile

# iOS Simulator
npm run mobile:ios

# Android Emulator
npm run mobile:android
```

### API Backend

```bash
# Start API in development mode
npm run api

# Or
npm run api:dev
```

### Both at Once

Open two terminals:

**Terminal 1 - API:**
```bash
npm run api
```

**Terminal 2 - Mobile:**
```bash
npm start
```

## Available Commands

From the root directory:

- `npm start` - Start Expo mobile app
- `npm run mobile` - Start Expo mobile app
- `npm run mobile:ios` - Start Expo on iOS Simulator
- `npm run mobile:android` - Start Expo on Android Emulator
- `npm run api` - Start NestJS API backend
- `npm run api:dev` - Start NestJS API in development mode
- `npm run build` - Build all packages
- `npm run dev` - Run all dev servers (if configured)

## Mobile App Connection

The mobile app automatically connects to:
- **Railway (Production)**: `https://coffee-break-co-production.up.railway.app`
- **Local Development**: `http://localhost:4000` (iOS) or `http://10.0.2.2:4000` (Android)

## Railway Backend

Your backend is deployed on Railway:
- **URL**: `https://coffee-break-co-production.up.railway.app`
- **Health Check**: `https://coffee-break-co-production.up.railway.app/health`

The mobile app is configured to use Railway by default. No local backend needed!
