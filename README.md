# ☕ Coffee Break - Mobile App

A mobile-first coffee digital passport application built with Expo and React Native, powered by a NestJS backend on Railway.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (for Mac) or Android Emulator

### Mobile App Setup

```bash
# Navigate to mobile app
cd apps/mobile

# Install dependencies
npm install

# Start Expo development server
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

### Backend API

The backend is deployed on Railway. The mobile app automatically connects to:
- **Development**: Local backend on port 4000 (if running locally)
- **Production**: Railway URL (set via `EXPO_PUBLIC_API_URL` environment variable)

#### Local Backend Development (Optional)

```bash
# Navigate to API
cd apps/api

# Install dependencies
npm install

# Start development server
npm run dev
```

The API will run on `http://localhost:4000`

## 📱 Mobile App Features

- ☕ Browse coffee entries
- 🏪 View seller profiles
- 📊 See ratings and reviews
- 📷 QR code scanner
- 🔍 Search and filter coffees
- 💾 Save favorite coffees

## 🔧 Configuration

### API URL Configuration

The mobile app automatically detects the API URL:

1. **Environment Variable** (highest priority):
   ```bash
   EXPO_PUBLIC_API_URL=https://your-api.railway.app
   ```

2. **app.json config**:
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "https://your-api.railway.app"
       }
     }
   }
   ```

3. **Development defaults**:
   - iOS Simulator: `http://localhost:4000`
   - Android Emulator: `http://10.0.2.2:4000`

### For Physical Devices

When testing on a real device, use your computer's IP address:

```bash
# Find your IP (macOS)
ipconfig getifaddr en0

# Then set in app.json or .env
EXPO_PUBLIC_API_URL=http://YOUR_IP:4000
```

## 🚂 Railway Deployment

The backend is configured for Railway deployment:

- **Dockerfile**: `apps/api/Dockerfile`
- **Railway config**: `railway.toml`
- **Auto-deploy**: Connected to GitHub

See `apps/api/RAILWAY_QUICK_START.md` for deployment details.

## 📁 Project Structure

```
Coffee Break/
├── apps/
│   ├── api/          # NestJS backend API
│   └── mobile/       # Expo React Native app
├── packages/
│   └── shared/       # Shared TypeScript types
└── data/             # JSON data files
```

## 🛠️ Development

### Running Services

**Mobile App:**
```bash
cd apps/mobile
npm start
```

**API Backend (local):**
```bash
cd apps/api
npm run dev
```

### Building

**Mobile App:**
```bash
cd apps/mobile
npx expo build:android  # or build:ios
```

**API Backend:**
```bash
cd apps/api
npm run build
```

## 📚 Documentation

- `apps/mobile/README.md` - Mobile app documentation
- `apps/mobile/QUICK_START.md` - Quick start guide
- `apps/api/RAILWAY_QUICK_START.md` - Railway deployment guide
- `apps/api/RAILWAY_DEPLOY.md` - Detailed deployment instructions

## 🔗 API Endpoints

- `GET /api/coffee-entries` - Get all coffees
- `GET /api/coffee-entries/:id` - Get coffee by ID
- `GET /api/sellers` - Get all sellers
- `GET /api/sellers/:id` - Get seller by ID
- `GET /api/comments?coffeeId=:id` - Get comments/ratings
- `GET /health` - Health check

## 📝 License

Private project