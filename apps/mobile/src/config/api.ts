/**
 * API Configuration
 * Centralized API endpoint configuration for the mobile app
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get the API base URL from environment or use default
 * In development, this will use localhost or Android emulator address
 * In production, this should be set via Expo Constants
 * 
 * Note: 
 * - Android emulator uses 10.0.2.2 to access localhost
 * - iOS simulator can use localhost directly
 * - Physical devices need your computer's IP address (e.g., http://192.168.1.100:4000)
 */
const getApiBaseUrl = (): string => {
  // Priority 1: Environment variable (for Railway or custom deployments)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  
  // Priority 2: Production - use Railway URL from app.json
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configUrl) return configUrl;
  
  // Priority 3: In development, try localhost first, fallback to Railway
  // NOTE: Using NestJS backend on port 4000 (standalone API server)
  if (__DEV__) {
    // Check if we should use Railway URL even in dev (when local backend isn't running)
    // For now, use Railway URL since local backend may not be running
    const railwayUrl = Constants.expoConfig?.extra?.apiUrl;
    if (railwayUrl) {
      return railwayUrl;
    }
    
    // Fallback to localhost if Railway URL not configured
    // Android emulator needs special IP to access host machine
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4000';
    }
    // iOS simulator can use localhost
    if (Platform.OS === 'ios') {
      return 'http://localhost:4000';
    }
    // Web or other platforms
    return 'http://localhost:4000';
  }
  
  // Fallback - should not happen in production
  return 'https://coffee-break-co-production.up.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL in development for debugging
if (__DEV__) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('📱 Platform:', Platform.OS);
  console.log('🌐 __DEV__:', __DEV__);
  console.log('⚙️ Config URL:', Constants.expoConfig?.extra?.apiUrl);
  console.log('🔧 Env URL:', process.env.EXPO_PUBLIC_API_URL);
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Coffee endpoints
  COFFEES: '/api/coffee-entries',
  COFFEE_BY_ID: (id: string) => `/api/coffee-entries/${id}`,
  COFFEE_BY_SLUG: (slug: string) => `/api/coffee-entries/slug/${slug}`,
  
  // Seller endpoints
  SELLERS: '/api/sellers',
  SELLER_BY_ID: (id: string) => `/api/sellers/${id}`,
  SELLER_COFFEES: (sellerId: string) => `/api/sellers/${sellerId}/coffees`,
  
  // Comments/Ratings
  COMMENTS: (coffeeId: string) => `/api/comments?coffeeId=${coffeeId}`,
  
  // Health check
  HEALTH: '/health',
} as const;

/**
 * Build full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  // If endpoint already includes http, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  return `${baseUrl}/${cleanEndpoint}`;
};
