/**
 * GS1 Digital Link utilities for building and parsing QR codes
 * Follows GS1 Digital Link 1.1.1 standard syntax
 */
import { DigitalLinkKeys } from './index';
/**
 * Builds a GS1 Digital Link URL from component parts
 * @param keys - Digital Link identifier keys
 * @param base - Base URL for the resolver
 * @returns Complete Digital Link URL
 */
export declare function buildDigitalLink({ gtin, lot, serial }: DigitalLinkKeys, base?: string): string;
/**
 * Parses a GS1 Digital Link path into component keys
 * @param pathname - URL pathname (e.g., "/01/09506000134352/10/L2305")
 * @returns Parsed Digital Link keys
 */
export declare function parseDigitalLink(pathname: string): DigitalLinkKeys;
/**
 * Validates if a Digital Link path follows GS1 syntax
 * @param pathname - URL pathname to validate
 * @returns True if valid, false otherwise
 */
export declare function isValidDigitalLink(pathname: string): boolean;
/**
 * Extracts Digital Link keys from a full URL
 * @param url - Complete Digital Link URL
 * @returns Parsed Digital Link keys
 */
export declare function extractDigitalLinkFromUrl(url: string): DigitalLinkKeys;
/**
 * Generates a QR code friendly Digital Link (shorter for mobile scanning)
 * @param keys - Digital Link identifier keys
 * @param base - Base URL for the resolver
 * @returns Optimized Digital Link URL
 */
export declare function buildQRFriendlyDigitalLink({ gtin, lot, serial }: DigitalLinkKeys, base?: string): string;
//# sourceMappingURL=digital-link.d.ts.map