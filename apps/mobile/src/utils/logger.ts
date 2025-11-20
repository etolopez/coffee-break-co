/**
 * Enhanced Logger Utility
 * Ensures all logs are visible on Android and iOS
 * Provides consistent logging format across platforms
 */

import { Platform } from 'react-native';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Enhanced logger that works reliably on Android
 */
class Logger {
  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const platform = Platform.OS;
    const prefix = `[${timestamp}] [${level}] [${platform}]`;
    
    if (args.length > 0) {
      return `${prefix} ${message} ${JSON.stringify(args, null, 2)}`;
    }
    return `${prefix} ${message}`;
  }

  /**
   * Debug log
   */
  debug(message: string, ...args: any[]): void {
    const formatted = this.formatMessage(LogLevel.DEBUG, message, ...args);
    console.log(formatted);
    // Also log to console.debug for better visibility
    if (console.debug) {
      console.debug(formatted);
    }
  }

  /**
   * Info log
   */
  info(message: string, ...args: any[]): void {
    const formatted = this.formatMessage(LogLevel.INFO, message, ...args);
    console.log(formatted);
    // Use console.info if available
    if (console.info) {
      console.info(formatted);
    }
  }

  /**
   * Warning log
   */
  warn(message: string, ...args: any[]): void {
    const formatted = this.formatMessage(LogLevel.WARN, message, ...args);
    console.warn(formatted);
    // Also log to console.error for Android visibility
    if (Platform.OS === 'android') {
      console.error(`⚠️ WARNING: ${formatted}`);
    }
  }

  /**
   * Error log - Always visible on Android
   */
  error(message: string, error?: any, ...args: any[]): void {
    const formatted = this.formatMessage(LogLevel.ERROR, message, ...args);
    
    // Always log to console.error (most visible on Android)
    console.error('❌ ERROR:', formatted);
    
    if (error) {
      // Log error details
      console.error('❌ Error Object:', error);
      console.error('❌ Error Message:', error?.message || 'No message');
      console.error('❌ Error Stack:', error?.stack || 'No stack trace');
      
      // Log full error details as JSON for debugging
      try {
        console.error('❌ Error Details (JSON):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      } catch (e) {
        console.error('❌ Could not stringify error:', e);
      }
    }
    
    // Also use console.warn for additional visibility
    console.warn('⚠️ ERROR LOGGED:', formatted);
  }

  /**
   * Log API errors with full context
   */
  apiError(url: string, method: string, error: any): void {
    this.error(`API Error: ${method} ${url}`, error, {
      url,
      method,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      code: error?.code,
      message: error?.message,
    });
  }

  /**
   * Log network errors
   */
  networkError(url: string, error: any): void {
    this.error(`Network Error: ${url}`, error, {
      url,
      code: error?.code,
      message: error?.message,
      isNetworkError: !error?.response,
      isTimeout: error?.code === 'ECONNABORTED',
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Also export individual methods for convenience
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logApiError = logger.apiError.bind(logger);
export const logNetworkError = logger.networkError.bind(logger);

