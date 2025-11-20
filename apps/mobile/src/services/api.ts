/**
 * API Service Layer
 * Handles all API communication for the mobile app
 * Provides typed methods for fetching data from the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { ApiResponse, CoffeeEntry, Seller, CoffeeRating } from '../types';
import { logger, logApiError, logNetworkError } from '../utils/logger';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token and debugging
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    try {
      const token = await AsyncStorage.getItem('@coffee_break_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      logger.error('Error getting auth token', error);
    }

    const fullUrl = buildApiUrl(config.url || '');
    logger.info(`API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
    logger.debug('Request Config:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    logger.error('Request Setup Error', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    logger.info(`API Response: ${response.status} ${response.config.url || response.config.method}`);
    logger.debug('Response Data:', response.data);
    return response;
  },
  (error: AxiosError) => {
    const url = error.config?.url || 'unknown';
    const method = error.config?.method || 'unknown';
    
    // Always log errors (not just in __DEV__) for Android visibility
    if (error.response) {
      // Server responded with error
      logApiError(url, method, error);
      logger.error(`API Error Response: ${error.response.status}`, error, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request made but no response
      logNetworkError(url, error);
      logger.error('Network Error: No response received', error, {
        code: error.code,
        message: error.message,
        timeout: error.config?.timeout,
      });
    } else {
      // Error setting up request
      logger.error('Request Setup Error', error, {
        message: error.message,
        config: error.config,
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Handle API errors
 */
const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request made but no response received
    return 'Network error: Please check your internet connection';
  } else {
    // Error setting up request
    return `Request error: ${error.message}`;
  }
};

/**
 * Coffee API Service
 * Handles all coffee-related API calls
 */
export const coffeeService = {
  /**
   * Fetch all coffee entries
   */
  async getAllCoffees(): Promise<CoffeeEntry[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.COFFEES);
      const response = await apiClient.get<CoffeeEntry[]>(url);
      return response.data;
    } catch (error) {
      logger.error('Error fetching coffees', error);
      logApiError(API_ENDPOINTS.COFFEES, 'GET', error as AxiosError);
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Fetch coffee by ID
   */
  async getCoffeeById(id: string): Promise<CoffeeEntry> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.COFFEE_BY_ID(id));
      const response = await apiClient.get<CoffeeEntry | { error: string }>(url);
      
      // Check if response is an error object
      if (response.data && typeof response.data === 'object' && 'error' in response.data) {
        throw new Error((response.data as { error: string }).error);
      }
      
      return response.data as CoffeeEntry;
    } catch (error) {
      logger.error(`Error fetching coffee ${id}`, error);
      logApiError(API_ENDPOINTS.COFFEE_BY_ID(id), 'GET', error as AxiosError);
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Fetch coffee by slug
   */
  async getCoffeeBySlug(slug: string): Promise<CoffeeEntry> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.COFFEE_BY_SLUG(slug));
      const response = await apiClient.get<CoffeeEntry | { error: string }>(url);
      
      // Check if response is an error object
      if (response.data && typeof response.data === 'object' && 'error' in response.data) {
        throw new Error((response.data as { error: string }).error);
      }
      
      return response.data as CoffeeEntry;
    } catch (error) {
      logger.error(`Error fetching coffee by slug ${slug}`, error);
      logApiError(API_ENDPOINTS.COFFEE_BY_SLUG(slug), 'GET', error as AxiosError);
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Fetch coffee ratings
   */
  async getCoffeeRatings(coffeeId: string): Promise<CoffeeRating> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.COMMENTS(coffeeId));
      const response = await apiClient.get<ApiResponse<any[]>>(url);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const comments = response.data.data;
        const totalRating = comments.reduce((sum: number, comment: any) => sum + (comment.rating || 0), 0);
        const averageRating = totalRating / comments.length;
        return {
          coffeeId,
          rating: averageRating,
          count: comments.length,
        };
      }
      
      return { coffeeId, rating: 0, count: 0 };
    } catch (error) {
      logger.error(`Error fetching ratings for coffee ${coffeeId}`, error);
      return { coffeeId, rating: 0, count: 0 };
    }
  },
};

/**
 * Seller API Service
 * Handles all seller-related API calls
 */
export const sellerService = {
  /**
   * Fetch all sellers
   */
  async getAllSellers(): Promise<Seller[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.SELLERS);
      const response = await apiClient.get<ApiResponse<Seller[]>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to fetch sellers');
    } catch (error) {
      logger.error('Error fetching sellers', error);
      logApiError(API_ENDPOINTS.SELLERS, 'GET', error as AxiosError);
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Fetch seller by ID
   */
  async getSellerById(id: string): Promise<Seller> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.SELLER_BY_ID(id));
      const response = await apiClient.get<ApiResponse<Seller>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to fetch seller');
    } catch (error) {
      logger.error(`Error fetching seller ${id}`, error);
      logApiError(API_ENDPOINTS.SELLER_BY_ID(id), 'GET', error as AxiosError);
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Fetch seller's coffees
   */
  async getSellerCoffees(sellerId: string): Promise<CoffeeEntry[]> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.SELLER_COFFEES(sellerId));
      const response = await apiClient.get<CoffeeEntry[]>(url);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching seller coffees for ${sellerId}`, error);
      logApiError(API_ENDPOINTS.SELLER_COFFEES(sellerId), 'GET', error as AxiosError);
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

/**
 * Health check service
 */
export const healthService = {
  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.HEALTH);
      const response = await apiClient.get(url);
      return response.status === 200;
    } catch (error) {
      logger.error('Health check failed', error);
      return false;
    }
  },
};
