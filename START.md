# 🚀 How to Start the Project

## Quick Start Commands

### Mobile App (Expo)
```bash
cd apps/mobile
npx expo start
```

### API Backend (NestJS)
```bash
cd apps/api
npm run dev
```

### Web App (Next.js)
```bash
cd apps/web
npm run dev
```

## Root Directory

The root `package.json` doesn't have a `start` script because this is a monorepo. You need to navigate to the specific app directory.

## Available Root Scripts

From the root directory, you can run:

```bash
# Build all packages
npm run build

# Run all dev servers (if configured)
npm run dev

# Run tests
npm run test
```

## Recommended: Start Services Separately

Open multiple terminals:

**Terminal 1 - API:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Mobile:**
```bash
cd apps/mobile
npx expo start
```

**Terminal 3 - Web (optional):**
```bash
cd apps/web
npm run dev
```

## Mobile App Setup

The mobile app connects to:
- **Local development**: `http://localhost:4000` (iOS) or `http://10.0.2.2:4000` (Android)
- **Railway production**: Set `EXPO_PUBLIC_API_URL` environment variable

## API Endpoints

Once the API is running on port 4000:
- Health: http://localhost:4000/health
- Coffees: http://localhost:4000/api/coffee-entries
- Sellers: http://localhost:4000/api/sellers
