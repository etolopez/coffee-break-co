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
   * Debug log - Only in development
   */
  debug(message: string, ...args: any[]): void {
    if (__DEV__) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, ...args);
      console.log(formatted);
    }
  }

  /**
   * Info log - Only in development
   */
  info(message: string, ...args: any[]): void {
    if (__DEV__) {
      const formatted = this.formatMessage(LogLevel.INFO, message, ...args);
      console.log(formatted);
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
   * Error log - Always visible
   */
  error(message: string, error?: any, ...args: any[]): void {
    const formatted = this.formatMessage(LogLevel.ERROR, message, ...args);
    
    // Log error message
    console.error('❌ ERROR:', formatted);
    
    if (error) {
      // Log error message and stack only (less verbose)
      console.error('❌ Error:', error?.message || 'Unknown error');
      if (__DEV__ && error?.stack) {
        console.error('❌ Stack:', error.stack);
      }
    }
  }

  /**
   * Log API errors with context
   */
  apiError(url: string, method: string, error: any): void {
    const status = error?.response?.status;
    const statusText = error?.response?.statusText;
    this.error(`API Error: ${method} ${url} ${status ? `(${status} ${statusText})` : ''}`, error);
  }

  /**
   * Log network errors
   */
  networkError(url: string, error: any): void {
    this.error(`Network Error: ${url}`, error);
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

