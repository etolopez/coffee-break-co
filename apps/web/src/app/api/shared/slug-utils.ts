/**
 * Enhanced Slug Generation Utilities
 * Implements best practices for coffee identification and URL management
 * Uses persistent IDs with human-readable slugs for better UX and SEO
 */

/**
 * Generates a URL-friendly slug from text
 * Removes special characters, converts to lowercase, replaces spaces with hyphens
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a short, unique coffee identifier
 * Format: COFFEE-XXXX (where XXXX is a unique 4-character code)
 * @param coffeeId - The unique coffee identifier
 * @returns A short, scannable coffee ID
 */
export function generateCoffeeId(coffeeId: string): string {
  // Extract last 4 characters from the timestamp-based ID
  const shortId = coffeeId.slice(-4);
  return `COFFEE-${shortId}`;
}

/**
 * Generates a human-readable coffee slug that won't break when names change
 * Format: coffee-name-COFFEE-XXXX
 * @param coffeeName - The coffee name
 * @param coffeeId - The unique coffee identifier
 * @returns A human-readable slug with persistent ID
 */
export function generateCoffeeSlug(
  coffeeName: string, 
  coffeeId: string
): string {
  const coffeeSlug = generateSlug(coffeeName);
  const shortId = generateCoffeeId(coffeeId);
  
  // Create the slug: coffee-name-COFFEE-XXXX
  return `${coffeeSlug}-${shortId}`;
}

/**
 * Generates a short, unique identifier for QR codes
 * Format: COFFEE-XXXX
 * @param coffeeId - Unique coffee identifier
 * @returns A short, scannable QR code identifier
 */
export function generateQRCode(coffeeId: string): string {
  return generateCoffeeId(coffeeId);
}

/**
 * Parses a coffee slug to extract its components
 * @param slug - The coffee slug to parse
 * @returns Object containing coffee name slug and unique identifier
 */
export function parseCoffeeSlug(slug: string): {
  coffeeNameSlug: string;
  coffeeId: string;
  shortId: string;
} {
  // Split by the last occurrence of COFFEE-
  const lastCoffeeIndex = slug.lastIndexOf('COFFEE-');
  
  if (lastCoffeeIndex === -1) {
    throw new Error('Invalid coffee slug format - missing COFFEE- identifier');
  }
  
  const coffeeNameSlug = slug.substring(0, lastCoffeeIndex).replace(/-$/, ''); // Remove trailing hyphen
  const shortId = slug.substring(lastCoffeeIndex); // COFFEE-XXXX
  const coffeeId = shortId.replace('COFFEE-', ''); // XXXX
  
  return {
    coffeeNameSlug,
    coffeeId,
    shortId
  };
}

/**
 * Validates if a slug follows the correct format
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 */
export function isValidCoffeeSlug(slug: string): boolean {
  try {
    parseCoffeeSlug(slug);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates a display-friendly version of the slug for UI
 * @param slug - The full slug
 * @returns A human-readable version
 */
export function formatSlugForDisplay(slug: string): string {
  try {
    const { coffeeNameSlug, shortId } = parseCoffeeSlug(slug);
    return `${coffeeNameSlug.replace(/-/g, ' ')} (${shortId})`;
  } catch {
    return slug.replace(/-/g, ' ');
  }
}

/**
 * Extracts the unique coffee ID from a slug
 * @param slug - The coffee slug
 * @returns The unique coffee ID or null if invalid
 */
export function extractCoffeeIdFromSlug(slug: string): string | null {
  try {
    const { coffeeId } = parseCoffeeSlug(slug);
    return coffeeId;
  } catch {
    return null;
  }
}

/**
 * Generates a fallback slug when the original name is not available
 * @param coffeeId - The unique coffee identifier
 * @returns A fallback slug
 */
export function generateFallbackSlug(coffeeId: string): string {
  const shortId = generateCoffeeId(coffeeId);
  return `coffee-${shortId}`;
}
