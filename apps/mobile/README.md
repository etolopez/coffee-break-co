# Coffee Break Mobile App

Mobile application for the Coffee Digital Passport platform, built with Expo and React Native.

## 🚀 Features

- **Browse Coffees**: Explore premium coffee collection with filtering and search
- **Discover Sellers**: View coffee sellers and their profiles
- **QR Code Scanner**: Scan QR codes on coffee packages to view digital passports
- **Mobile-Optimized UI**: Beautiful, responsive design with coffee-themed styling
- **Real-time Data**: Connects to the Coffee Break API for live data

## 📱 Tech Stack

- **Expo SDK 54**: React Native framework
- **Expo Router**: File-based routing
- **TypeScript**: Type-safe development
- **React Native**: Mobile UI framework
- **Axios**: HTTP client for API calls
- **Expo Camera**: QR code scanning
- **Expo Linear Gradient**: Beautiful gradients

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Navigate to the mobile app directory:
```bash
cd apps/mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## 📁 Project Structure

```
apps/mobile/
├── src/
│   ├── app/              # Expo Router app directory
│   │   ├── (tabs)/       # Tab navigation screens
│   │   │   ├── index.tsx      # Home screen
│   │   │   ├── coffees.tsx    # Coffees list screen
│   │   │   ├── sellers.tsx    # Sellers list screen
│   │   │   └── scanner.tsx    # QR scanner screen
│   │   └── _layout.tsx        # Root layout
│   ├── components/        # Reusable components
│   ├── config/           # Configuration files
│   │   ├── api.ts        # API endpoints
│   │   └── theme.ts      # Theme configuration
│   ├── services/         # API services
│   │   └── api.ts        # API client
│   ├── types/            # TypeScript types
│   │   └── index.ts      # Type definitions
│   └── utils/            # Utility functions
│       └── icons.tsx      # Icon utilities
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Configuration

### API Configuration

The app connects to the Coffee Break API. Configure the API URL in:

- `src/config/api.ts` - API base URL
- `app.json` - Extra configuration (for production)

Default API URL: `http://localhost:4000`

### Environment Variables

For production, set the API URL via Expo Constants:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-api-url.com"
    }
  }
}
```

## 📱 Screens

### Home Screen
- Hero section with app branding
- Feature highlights
- Quick action buttons
- Call-to-action for sellers

### Coffees Screen
- List of all available coffees
- Search functionality
- Filter by certifications, process, variety, origin
- Pull-to-refresh
- Coffee ratings display

### Sellers Screen
- List of all coffee sellers
- Seller profiles with logos
- Ratings and coffee counts
- Certifications display
- Pull-to-refresh

### Scanner Screen
- QR code scanner
- Camera permission handling
- Automatic navigation to coffee details
- Scan again functionality

## 🎨 Theming

The app uses a coffee-themed color palette:

- **Primary**: Amber/Orange tones (#F59E0B, #F97316)
- **Secondary**: Coffee browns (#D97706, #EA580C)
- **Accents**: Emerald, Blue, Purple for features

Theme configuration is in `src/config/theme.ts`.

## 🔌 API Integration

The app uses the following API endpoints:

- `GET /api/coffee-entries` - Get all coffees
- `GET /api/coffee-entries/:id` - Get coffee by ID
- `GET /api/sellers` - Get all sellers
- `GET /api/sellers/:id` - Get seller by ID
- `GET /api/comments?coffeeId=:id` - Get coffee ratings

API service layer is in `src/services/api.ts`.

## 🚀 Building for Production

### iOS

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure EAS:
```bash
eas build:configure
```

3. Build for iOS:
```bash
eas build --platform ios
```

### Android

1. Build for Android:
```bash
eas build --platform android
```

## 📝 Development Notes

- The app uses Expo Router for navigation (file-based routing)
- All screens are in `src/app/(tabs)/` for tab navigation
- API calls are handled through the service layer
- Icons use `@expo/vector-icons` (Ionicons)
- Styling uses React Native StyleSheet with theme configuration

## 🐛 Troubleshooting

### Camera Permission Issues

If camera doesn't work:
1. Check app permissions in device settings
2. Ensure `expo-camera` is properly installed
3. Check `app.json` for camera permissions configuration

### API Connection Issues

If API calls fail:
1. Verify the API server is running
2. Check API URL in `src/config/api.ts`
3. Ensure CORS is configured on the API server
4. Check network connectivity

### Build Issues

If build fails:
1. Clear cache: `npm run clean`
2. Reinstall dependencies: `npm install`
3. Clear Expo cache: `npx expo start --clear`

## 📄 License

Part of the Coffee Digital Passport platform.
