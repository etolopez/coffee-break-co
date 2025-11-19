import { NextRequest, NextResponse } from 'next/server';
import { migrateCoffeeSlugs, validateCoffeeSlugs } from '../../shared/slug-migration';

/**
 * Admin endpoint to migrate existing coffee entries to new slug format
 * POST: Run migration
 * GET: Validate current slugs
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting slug migration via API...');
    
    const result = await migrateCoffeeSlugs();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully migrated ${result.migrated} coffee entries`,
        migrated: result.migrated,
        errors: result.errors
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Migration completed with ${result.errors.length} errors`,
        migrated: result.migrated,
        errors: result.errors
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Migration API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Validating coffee slugs via API...');
    
    const result = await validateCoffeeSlugs();
    
    return NextResponse.json({
      success: true,
      message: 'Slug validation completed',
      valid: result.valid,
      invalid: result.invalid,
      details: result.details
    });
    
  } catch (error) {
    console.error('❌ Validation API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Validation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
