"use strict";
/**
 * HMAC utilities for secure API communication
 * Implements HMAC-SHA256 signing and verification
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.signHmacSHA256 = signHmacSHA256;
exports.verifyHmac = verifyHmac;
exports.isValidHmacFormat = isValidHmacFormat;
exports.extractHmacDigest = extractHmacDigest;
exports.generateHmacSecret = generateHmacSecret;
exports.validateClockSkew = validateClockSkew;
exports.createWebhookSignature = createWebhookSignature;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
/**
 * Signs a message body with HMAC-SHA256
 * @param body - Raw message body to sign
 * @param secret - HMAC secret key
 * @returns HMAC signature in format 'sha256=<hex>'
 */
function signHmacSHA256(body, secret) {
    const hmac = crypto_1.default.createHmac('sha256', secret);
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
function verifyHmac(signatureHeader, body, secret) {
    try {
        const expected = signHmacSHA256(body, secret);
        // Use constant-time comparison to prevent timing attacks
        const a = Buffer.from(signatureHeader || '');
        const b = Buffer.from(expected);
        // Check length first to prevent timing leaks
        if (a.length !== b.length) {
            return false;
        }
        return crypto_1.default.timingSafeEqual(a, b);
    }
    catch {
        return false;
    }
}
/**
 * Validates HMAC signature format
 * @param signature - Signature header value
 * @returns True if format is valid, false otherwise
 */
function isValidHmacFormat(signature) {
    return /^sha256=[a-f0-9]{64}$/i.test(signature);
}
/**
 * Extracts the hex digest from an HMAC signature header
 * @param signature - Signature header value
 * @returns Hex digest or null if invalid format
 */
function extractHmacDigest(signature) {
    const match = signature.match(/^sha256=([a-f0-9]{64})$/i);
    return match ? match[1] || null : null;
}
/**
 * Creates a secure random HMAC secret
 * @param length - Length of secret in bytes (default: 32)
 * @returns Base64 encoded secret
 */
function generateHmacSecret(length = 32) {
    return crypto_1.default.randomBytes(length).toString('base64');
}
/**
 * Validates clock skew for request timestamps
 * @param requestDate - Date header from request
 * @param maxSkewSeconds - Maximum allowed skew in seconds (default: 300)
 * @returns True if timestamp is within acceptable range
 */
function validateClockSkew(requestDate, maxSkewSeconds = 300) {
    try {
        const requestTime = new Date(requestDate).getTime();
        const currentTime = Date.now();
        const skew = Math.abs(currentTime - requestTime);
        return skew <= maxSkewSeconds * 1000;
    }
    catch {
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
function createWebhookSignature(payload, secret, timestamp) {
    const ts = timestamp || new Date().toUTCString();
    const signature = signHmacSHA256(payload, secret);
    return { signature, timestamp: ts };
}
//# sourceMappingURL=hmac.js.map