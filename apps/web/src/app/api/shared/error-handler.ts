import { NextResponse } from 'next/server';

/**
 * Comprehensive error handling utilities for API routes
 * Provides consistent error responses and logging across the application
 */

export interface ErrorDetails {
  [key: string]: any;
}

/**
 * Logs errors with context and additional data
 * @param context - The context where the error occurred
 * @param error - The error object or message
 * @param additionalData - Additional data to log with the error
 */
export const logError = (context: string, error: any, additionalData?: ErrorDetails) => {
  const errorMessage = error?.message || error;
  const errorStack = error?.stack;
  
  console.error(`[API Error] ${context}:`, {
    error: errorMessage,
    stack: errorStack,
    additionalData,
    timestamp: new Date().toISOString(),
    context
  });
};

/**
 * Creates a standardized error response
 * @param message - Human-readable error message
 * @param status - HTTP status code
 * @param details - Additional error details for debugging
 * @returns NextResponse with error details
 */
export const createErrorResponse = (
  message: string, 
  status: number = 500, 
  details?: ErrorDetails
) => {
  logError('Error Response', new Error(message), { status, details });
  
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      status
    },
    { status }
  );
};

/**
 * Creates a validation error response
 * @param field - The field that failed validation
 * @param message - Validation error message
 * @param received - What was actually received
 * @returns NextResponse with validation error
 */
export const createValidationError = (
  field: string,
  message: string,
  received?: any
) => {
  return createErrorResponse(`Validation Error: ${message}`, 400, {
    field,
    received,
    type: 'validation_error'
  });
};

/**
 * Creates a not found error response
 * @param resource - The resource that was not found
 * @param identifier - The identifier used to search
 * @returns NextResponse with not found error
 */
export const createNotFoundError = (resource: string, identifier: any) => {
  return createErrorResponse(`${resource} not found`, 404, {
    resource,
    identifier,
    type: 'not_found_error'
  });
};

/**
 * Creates a server error response
 * @param message - Error message
 * @param originalError - The original error that occurred
 * @returns NextResponse with server error
 */
export const createServerError = (message: string, originalError?: any) => {
  return createErrorResponse(message, 500, {
    originalError: originalError?.message || originalError,
    type: 'server_error'
  });
};

/**
 * Wraps an async function with error handling
 * @param handler - The async function to wrap
 * @param context - Context for error logging
 * @returns Wrapped function with error handling
 */
export const withErrorHandling = <T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(context, error);
      throw error;
    }
  };
};

/**
 * Validates required fields in a request body
 * @param body - The request body to validate
 * @param requiredFields - Array of required field names
 * @returns Validation result with missing fields
 */
export const validateRequiredFields = (
  body: any, 
  requiredFields: string[]
) => {
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields,
      received: Object.keys(body)
    };
  }
  
  return { isValid: true, missingFields: [] };
};

/**
 * Creates a success response with consistent structure
 * @param data - The response data
 * @param message - Success message
 * @param additionalData - Additional response data
 * @returns NextResponse with success data
 */
export const createSuccessResponse = (
  data: any, 
  message?: string, 
  additionalData?: ErrorDetails
) => {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
    ...additionalData,
    timestamp: new Date().toISOString()
  });
};
