"use strict";
/**
 * GS1 Digital Link utilities for building and parsing QR codes
 * Follows GS1 Digital Link 1.1.1 standard syntax
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDigitalLink = buildDigitalLink;
exports.parseDigitalLink = parseDigitalLink;
exports.isValidDigitalLink = isValidDigitalLink;
exports.extractDigitalLinkFromUrl = extractDigitalLinkFromUrl;
exports.buildQRFriendlyDigitalLink = buildQRFriendlyDigitalLink;
/**
 * Builds a GS1 Digital Link URL from component parts
 * @param keys - Digital Link identifier keys
 * @param base - Base URL for the resolver
 * @returns Complete Digital Link URL
 */
function buildDigitalLink({ gtin, lot, serial }, base = 'https://id.example.com') {
    // Start with 01 (GTIN) - always required
    const segments = ['01', encodeURIComponent(gtin)];
    // Add 10 (Lot) if provided
    if (lot) {
        segments.push('10', encodeURIComponent(lot));
    }
    // Add 21 (Serial) if provided
    if (serial) {
        segments.push('21', encodeURIComponent(serial));
    }
    // Build the path and add query parameters
    const path = segments.join('/');
    const queryParams = new URLSearchParams({
        linkType: 'product',
        ctx: 'mobile'
    });
    return `${base}/${path}?${queryParams.toString()}`;
}
/**
 * Parses a GS1 Digital Link path into component keys
 * @param pathname - URL pathname (e.g., "/01/09506000134352/10/L2305")
 * @returns Parsed Digital Link keys
 */
function parseDigitalLink(pathname) {
    // Split path and filter out empty segments
    const segments = pathname.split('/').filter(Boolean);
    const keys = {};
    // Parse AI (Application Identifier) pairs
    for (let i = 0; i < segments.length; i += 2) {
        const ai = segments[i];
        const value = segments[i + 1];
        if (value) {
            if (ai)
                keys[ai] = decodeURIComponent(value);
        }
    }
    return {
        gtin: keys['01'] || '',
        lot: keys['10'] || '',
        serial: keys['21'] || ''
    };
}
/**
 * Validates if a Digital Link path follows GS1 syntax
 * @param pathname - URL pathname to validate
 * @returns True if valid, false otherwise
 */
function isValidDigitalLink(pathname) {
    try {
        const keys = parseDigitalLink(pathname);
        // Must have at least GTIN (01)
        if (!keys.gtin) {
            return false;
        }
        // GTIN should be numeric and reasonable length (8-14 digits)
        if (!/^\d{8,14}$/.test(keys.gtin)) {
            return false;
        }
        // If lot is present, it should not be empty
        if (keys.lot !== undefined && keys.lot === '') {
            return false;
        }
        // If serial is present, it should not be empty
        if (keys.serial !== undefined && keys.serial === '') {
            return false;
        }
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Extracts Digital Link keys from a full URL
 * @param url - Complete Digital Link URL
 * @returns Parsed Digital Link keys
 */
function extractDigitalLinkFromUrl(url) {
    try {
        const urlObj = new URL(url);
        return parseDigitalLink(urlObj.pathname);
    }
    catch {
        throw new Error('Invalid URL format');
    }
}
/**
 * Generates a QR code friendly Digital Link (shorter for mobile scanning)
 * @param keys - Digital Link identifier keys
 * @param base - Base URL for the resolver
 * @returns Optimized Digital Link URL
 */
function buildQRFriendlyDigitalLink({ gtin, lot, serial }, base = 'https://id.example.com') {
    // Use shorter base if possible
    const shortBase = base.replace('https://', '');
    // Build minimal path
    const segments = ['01', gtin];
    if (lot)
        segments.push('10', lot);
    if (serial)
        segments.push('21', serial);
    const path = segments.join('/');
    // Minimal query params for QR
    return `https://${shortBase}/${path}`;
}
//# sourceMappingURL=digital-link.js.map