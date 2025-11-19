/**
 * API Service Layer
 * Handles all API communication for the mobile app
 * Provides typed methods for fetching data from the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { ApiResponse, CoffeeEntry, Seller, CoffeeRating } from '../types';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log('📡 API Request:', config.method?.toUpperCase(), config.url);
      console.log('🔗 Full URL:', config.baseURL || '', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      console.error('❌ API Error:', error.message);
      console.error('❌ Error URL:', error.config?.url);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Request:', {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
      });
      if (error.request) {
        console.error('❌ Request made but no response:', error.request);
      }
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
      }
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
      console.error('Error fetching coffees:', error);
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Fetch coffee by ID
   */
  async getCoffeeById(id: string): Promise<CoffeeEntry> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.COFFEE_BY_ID(id));
      const response = await apiClient.get<CoffeeEntry>(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching coffee ${id}:`, error);
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Fetch coffee by slug
   */
  async getCoffeeBySlug(slug: string): Promise<CoffeeEntry> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.COFFEE_BY_SLUG(slug));
      const response = await apiClient.get<CoffeeEntry>(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching coffee by slug ${slug}:`, error);
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
      console.error(`Error fetching ratings for coffee ${coffeeId}:`, error);
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
      console.error('Error fetching sellers:', error);
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
      console.error(`Error fetching seller ${id}:`, error);
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
      console.error(`Error fetching seller coffees for ${sellerId}:`, error);
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
      console.error('Health check failed:', error);
      return false;
    }
  },
};
