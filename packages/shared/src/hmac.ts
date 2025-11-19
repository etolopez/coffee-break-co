/**
 * HMAC utilities for secure API communication
 * Implements HMAC-SHA256 signing and verification
 */

import crypto from 'crypto';

/**
 * Signs a message body with HMAC-SHA256
 * @param body - Raw message body to sign
 * @param secret - HMAC secret key
 * @returns HMAC signature in format 'sha256=<hex>'
 */
export function signHmacSHA256(body: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const digest = hmac.digest('hex');
  return `sha256=${digest}`;
}

/**
 * Verifies an HMAC signature against a message body
 * @param signatureHeader - Signature header from request
 * @param body - Raw message body to verify
 * @param secret - HMAC secret key
 * @returns True if signature is valid, false otherwise
 */
export function verifyHmac(
  signatureHeader: string,
  body: string,
  secret: string
): boolean {
  try {
    const expected = signHmacSHA256(body, secret);
    
    // Use constant-time comparison to prevent timing attacks
    const a = Buffer.from(signatureHeader || '');
    const b = Buffer.from(expected);
    
    // Check length first to prevent timing leaks
    if (a.length !== b.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Validates HMAC signature format
 * @param signature - Signature header value
 * @returns True if format is valid, false otherwise
 */
export function isValidHmacFormat(signature: string): boolean {
  return /^sha256=[a-f0-9]{64}$/i.test(signature);
}

/**
 * Extracts the hex digest from an HMAC signature header
 * @param signature - Signature header value
 * @returns Hex digest or null if invalid format
 */
export function extractHmacDigest(signature: string): string | null {
  const match = signature.match(/^sha256=([a-f0-9]{64})$/i);
  return match ? match[1] || null : null;
}

/**
 * Creates a secure random HMAC secret
 * @param length - Length of secret in bytes (default: 32)
 * @returns Base64 encoded secret
 */
export function generateHmacSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Validates clock skew for request timestamps
 * @param requestDate - Date header from request
 * @param maxSkewSeconds - Maximum allowed skew in seconds (default: 300)
 * @returns True if timestamp is within acceptable range
 */
export function validateClockSkew(
  requestDate: string,
  maxSkewSeconds: number = 300
): boolean {
  try {
    const requestTime = new Date(requestDate).getTime();
    const currentTime = Date.now();
    const skew = Math.abs(currentTime - requestTime);
    
    return skew <= maxSkewSeconds * 1000;
  } catch {
    return false;
  }
}

/**
 * Creates a request signature for outbound webhooks
 * @param payload - Request payload to sign
 * @param secret - HMAC secret key
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns Object with signature and timestamp
 */
export function createWebhookSignature(
  payload: string,
  secret: string,
  timestamp?: string
): { signature: string; timestamp: string } {
  const ts = timestamp || new Date().toUTCString();
  const signature = signHmacSHA256(payload, secret);
  
  return { signature, timestamp: ts };
}
