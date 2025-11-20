/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@coffee_break_token';
const USER_KEY = '@coffee_break_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load stored auth data on mount
   */
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Load authentication data from AsyncStorage
   */
  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        logger.info('Loaded stored authentication');
      }
    } catch (error) {
      logger.error('Error loading stored auth', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://coffee-break-co-production.up.railway.app'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        logger.error('Login failed', error);
        return false;
      }

      const data = await response.json();
      const { user: userData, token: authToken } = data;

      // Store auth data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, authToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
      ]);

      setUser(userData);
      setToken(authToken);
      logger.info('User logged in successfully', { email: userData.email, role: userData.role });
      return true;
    } catch (error) {
      logger.error('Login error', error);
      return false;
    }
  };

  /**
   * Register new user
   */
  const register = async (
    email: string,
    password: string,
    name?: string,
    role: string = 'customer',
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://coffee-break-co-production.up.railway.app'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        logger.error('Registration failed', error);
        return false;
      }

      const data = await response.json();
      const { user: userData, token: authToken } = data;

      // Store auth data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, authToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
      ]);

      setUser(userData);
      setToken(authToken);
      logger.info('User registered successfully', { email: userData.email, role: userData.role });
      return true;
    } catch (error) {
      logger.error('Registration error', error);
      return false;
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
      setUser(null);
      setToken(null);
      logger.info('User logged out');
    } catch (error) {
      logger.error('Logout error', error);
    }
  };

  /**
   * Update user data
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

