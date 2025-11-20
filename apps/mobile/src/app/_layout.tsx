/**
 * Root Layout Component
 * Sets up the navigation structure for the Expo Router app
 * Handles initial routing and screen configuration
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AuthProvider } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

/**
 * Initialize error handling
 */
if (__DEV__) {
  // Log app startup
  
  // Catch unhandled promise rejections
  const originalHandler = global.ErrorUtils?.getGlobalHandler?.();
  if (originalHandler) {
    global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      logger.error('Unhandled Error (Global Handler)', error, { isFatal });
      originalHandler(error, isFatal);
    });
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="favorites" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="coffees/[id]" />
            <Stack.Screen name="sellers/[id]" />
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
