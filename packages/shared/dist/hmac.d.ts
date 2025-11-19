/**
 * HMAC utilities for secure API communication
 * Implements HMAC-SHA256 signing and verification
 */
/**
 * Signs a message body with HMAC-SHA256
 * @param body - Raw message body to sign
 * @param secret - HMAC secret key
 * @returns HMAC signature in format 'sha256=<hex>'
 */
export declare function signHmacSHA256(body: string, secret: string): string;
/**
 * Verifies an HMAC signature against a message body
 * @param signatureHeader - Signature header from request
 * @param body - Raw message body to verify
 * @param secret - HMAC secret key
 * @returns True if signature is valid, false otherwise
 */
export declare function verifyHmac(signatureHeader: string, body: string, secret: string): boolean;
/**
 * Validates HMAC signature format
 * @param signature - Signature header value
 * @returns True if format is valid, false otherwise
 */
export declare function isValidHmacFormat(signature: string): boolean;
/**
 * Extracts the hex digest from an HMAC signature header
 * @param signature - Signature header value
 * @returns Hex digest or null if invalid format
 */
export declare function extractHmacDigest(signature: string): string | null;
/**
 * Creates a secure random HMAC secret
 * @param length - Length of secret in bytes (default: 32)
 * @returns Base64 encoded secret
 */
export declare function generateHmacSecret(length?: number): string;
/**
 * Validates clock skew for request timestamps
 * @param requestDate - Date header from request
 * @param maxSkewSeconds - Maximum allowed skew in seconds (default: 300)
 * @returns True if timestamp is within acceptable range
 */
export declare function validateClockSkew(requestDate: string, maxSkewSeconds?: number): boolean;
/**
 * Creates a request signature for outbound webhooks
 * @param payload - Request payload to sign
 * @param secret - HMAC secret key
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns Object with signature and timestamp
 */
export declare function createWebhookSignature(payload: string, secret: string, timestamp?: string): {
    signature: string;
    timestamp: string;
};
//# sourceMappingURL=hmac.d.ts.map