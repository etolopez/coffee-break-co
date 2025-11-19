/**
 * Slug Migration Utility
 * Migrates existing coffee entries from old slug format to new simplified format
 * Preserves all existing data while updating slugs to be more user-friendly
 */

import { generateCoffeeSlug, generateQRCode } from './slug-utils';
import { promises as fs } from 'fs';
import path from 'path';

// Coffee entries data file path
const COFFEE_ENTRIES_FILE = path.join(process.cwd(), '..', '..', 'data', 'coffee-entries-persistent.json');

/**
 * Migrates existing coffee entries to use the new slug format
 * @returns Promise<{ success: boolean; migrated: number; errors: string[] }>
 */
export async function migrateCoffeeSlugs(): Promise<{
  success: boolean;
  migrated: number;
  errors: string[];
}> {
  try {
    console.log('🔄 Starting coffee slug migration...');
    
    // Read existing coffee entries
    const data = await fs.readFile(COFFEE_ENTRIES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const coffeeEntries = parsed.entries || [];
    
    console.log(`📝 Found ${coffeeEntries.length} coffee entries to migrate`);
    
    let migrated = 0;
    const errors: string[] = [];
    
    // Process each coffee entry
    for (const entry of coffeeEntries) {
      try {
        // Check if this entry needs migration (has old format slug)
        if (entry.slug && entry.slug.includes('/')) {
          console.log(`🔄 Migrating entry: ${entry.coffeeName} (ID: ${entry.id})`);
          console.log(`🔄 Old slug: ${entry.slug}`);
          
          // Generate new slug using the new format
          const newSlug = generateCoffeeSlug(entry.coffeeName, entry.id);
          entry.slug = newSlug;
          
          // Update QR code to use new format
          entry.qrCode = generateQRCode(entry.id);
          
          console.log(`✅ New slug: ${newSlug}`);
          console.log(`✅ New QR code: ${entry.qrCode}`);
          
          migrated++;
        } else if (entry.slug && entry.slug.includes('COFFEE-')) {
          console.log(`✅ Entry already migrated: ${entry.coffeeName} (ID: ${entry.id})`);
        } else {
          console.log(`⚠️ Entry has no slug, generating new one: ${entry.coffeeName} (ID: ${entry.id})`);
          
          // Generate new slug for entries without slugs
          const newSlug = generateCoffeeSlug(entry.coffeeName, entry.id);
          entry.slug = newSlug;
          
          // Generate QR code if missing
          if (!entry.qrCode) {
            entry.qrCode = generateQRCode(entry.id);
          }
          
          console.log(`✅ Generated slug: ${newSlug}`);
          console.log(`✅ Generated QR code: ${entry.qrCode}`);
          
          migrated++;
        }
      } catch (error) {
        const errorMsg = `Failed to migrate entry ${entry.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    // Save migrated data back to file
    if (migrated > 0) {
      await fs.writeFile(COFFEE_ENTRIES_FILE, JSON.stringify({ entries: coffeeEntries }, null, 2), 'utf-8');
      console.log(`💾 Saved ${migrated} migrated entries to file`);
    }
    
    console.log(`✅ Migration completed. Migrated: ${migrated}, Errors: ${errors.length}`);
    
    return {
      success: errors.length === 0,
      migrated,
      errors
    };
    
  } catch (error) {
    const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMsg}`);
    return {
      success: false,
      migrated: 0,
      errors: [errorMsg]
    };
  }
}

/**
 * Validates that all coffee entries have proper slugs
 * @returns Promise<{ valid: number; invalid: number; details: any[] }>
 */
export async function validateCoffeeSlugs(): Promise<{
  valid: number;
  invalid: number;
  details: any[];
}> {
  try {
    const data = await fs.readFile(COFFEE_ENTRIES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const coffeeEntries = parsed.entries || [];
    
    let valid = 0;
    let invalid = 0;
    const details: any[] = [];
    
    for (const entry of coffeeEntries) {
      const isValid = entry.slug && 
                     entry.slug.includes('COFFEE-') && 
                     !entry.slug.includes('/');
      
      if (isValid) {
        valid++;
      } else {
        invalid++;
        details.push({
          id: entry.id,
          name: entry.coffeeName,
          slug: entry.slug,
          issues: []
        });
        
        if (!entry.slug) {
          details[details.length - 1].issues.push('Missing slug');
        } else if (entry.slug.includes('/')) {
          details[details.length - 1].issues.push('Old format slug (contains /)');
        } else if (!entry.slug.includes('COFFEE-')) {
          details[details.length - 1].issues.push('Invalid slug format (missing COFFEE- prefix)');
        }
      }
    }
    
    return { valid, invalid, details };
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return { valid: 0, invalid: 0, details: [] };
  }
}
