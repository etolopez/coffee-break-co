import { NextRequest, NextResponse } from 'next/server';
import { generateCoffeeSlug, generateQRCode } from '../shared/slug-utils';
import { 
  createErrorResponse, 
  createValidationError, 
  createNotFoundError, 
  createSuccessResponse,
  validateRequiredFields,
  logError 
} from '../shared/error-handler';
import { 
  validateCoffeeUpload, 
  createMockUserContext, 
  UserSubscriptionContext,
  CoffeeUploadValidation 
} from '../shared/subscription-middleware';
import { promises as fs } from 'fs';
import path from 'path';

// Coffee entries data file path
const COFFEE_ENTRIES_FILE = path.join(process.cwd(), 'data', 'coffee-entries-persistent.json');

// Function to read coffee entries from file
async function getCoffeeEntriesData(): Promise<any[]> {
  try {
    const data = await fs.readFile(COFFEE_ENTRIES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.entries || [];
  } catch (error) {
    console.log('📝 No existing coffee entries file found, starting with empty array');
    return [];
  }
}

// Function to save coffee entries to file
async function saveCoffeeEntriesData(entries: any[]): Promise<void> {
  try {
    await fs.writeFile(COFFEE_ENTRIES_FILE, JSON.stringify({ entries }, null, 2), 'utf-8');
    console.log('📝 Coffee entries saved to persistent storage');
  } catch (error) {
    console.error('❌ Error saving coffee entries to file:', error);
    throw error;
  }
}

// In-memory storage for demo purposes (will be loaded from file)
let coffeeEntries: any[] = [];

// Initialize coffee entries from file on module load
(async () => {
  try {
    coffeeEntries = await getCoffeeEntriesData();
    console.log(`📝 Loaded ${coffeeEntries.length} coffee entries from persistent storage`);
  } catch (error) {
    console.error('❌ Error loading coffee entries from file:', error);
    coffeeEntries = [];
  }
})();

export async function GET(request: NextRequest) {
  try {
    console.log('GET request - Total entries in memory:', coffeeEntries.length); // Debug log
    
    // Get seller ID from query parameters
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    
    // Validate data integrity
    if (!Array.isArray(coffeeEntries)) {
      logError('Data Integrity Error', new Error('Coffee entries is not an array'), { 
        type: typeof coffeeEntries,
        value: coffeeEntries 
      });
      return createErrorResponse('Data integrity error', 500);
    }
    
    // Filter entries by seller ID if provided
    let filteredEntries = coffeeEntries;
    if (sellerId) {
      filteredEntries = coffeeEntries.filter(entry => entry.sellerId === sellerId);
      console.log(`Filtered entries for seller ${sellerId}:`, filteredEntries.length);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredEntries,
      count: filteredEntries.length,
      totalCount: coffeeEntries.length,
      sellerId: sellerId || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('GET Error', error);
    return createErrorResponse('Failed to fetch coffee entries', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate request
    if (!request.body) {
      return createErrorResponse('Request body is required', 400);
    }

    const body = await request.json();
    console.log('Received coffee entry data:', body); // Debug log
    
    // Validate required fields
    if (!body.coffeeName || !body.roastedBy) {
      return createErrorResponse('Coffee name and roasted by are required fields', 400, { 
        received: Object.keys(body),
        required: ['coffeeName', 'roastedBy']
      });
    }

    // TODO: In production, get user context from authentication system
    // For now, we'll use a mock user context - replace with real user data
    const userContext: UserSubscriptionContext = createMockUserContext(body.subscriptionTier || 'basic');
    
    // Validate coffee upload limits based on subscription tier
    const uploadValidation: CoffeeUploadValidation = validateCoffeeUpload(userContext);
    
    if (!uploadValidation.canUpload) {
      return createErrorResponse(
        `Coffee upload limit reached for ${uploadValidation.tier} tier`, 
        403, 
        {
          currentCount: uploadValidation.currentCount,
          limit: uploadValidation.limit,
          tier: uploadValidation.tier,
          upgradeMessage: `Upgrade to a higher tier to upload more coffees. Current limit: ${uploadValidation.limit}`
        }
      );
    }
    
    // Generate unique ID and timestamp
    const uniqueId = Date.now().toString();
    const harvestYear = new Date().getFullYear().toString();
    
    // Generate QR code using the new utility function
    const qrCode = generateQRCode(uniqueId);
    
    // Generate unique slug for the coffee entry
    const slug = generateCoffeeSlug(
      body.coffeeName || 'Coffee',
      uniqueId
    );
    
    const newEntry = {
      ...body,
      id: uniqueId,
      qrCode,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to memory array
    coffeeEntries.unshift(newEntry);
    
    // Save to persistent storage
    await saveCoffeeEntriesData(coffeeEntries);
    
    console.log('Coffee entry saved. Total entries:', coffeeEntries.length); // Debug log
    console.log('Generated slug:', slug); // Debug log
    console.log('Generated QR code:', qrCode); // Debug log
    console.log('All entries:', coffeeEntries.map(e => ({ id: e.id, name: e.coffeeName, slug: e.slug }))); // Debug log

    return createSuccessResponse({
      data: newEntry,
      message: 'Coffee entry created successfully'
    });
  } catch (error) {
    logError('POST Error', error, { requestUrl: request.url });
    return createErrorResponse('Failed to create coffee entry', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate request
    if (!request.body) {
      return createErrorResponse('Request body is required', 400);
    }

    const body = await request.json();
    console.log('Received coffee entry update data:', body); // Debug log
    
    // Validate required fields
    if (!body.id) {
      return createErrorResponse('Entry ID is required for updates', 400, {
        received: Object.keys(body),
        required: ['id']
      });
    }
    
    const entryIndex = coffeeEntries.findIndex(entry => entry.id === body.id);
    
    if (entryIndex === -1) {
      return createErrorResponse('Coffee entry not found', 404, { 
        requestedId: body.id,
        availableIds: coffeeEntries.map(e => e.id)
      });
    }

    // Update the entry while preserving the original ID and creation date
    const updatedEntry = {
      ...coffeeEntries[entryIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    coffeeEntries[entryIndex] = updatedEntry;
    
    // Save to persistent storage
    await saveCoffeeEntriesData(coffeeEntries);
    
    console.log('Coffee entry updated. Entry ID:', body.id); // Debug log

    return createSuccessResponse({
      data: updatedEntry,
      message: 'Coffee entry updated successfully'
    });
  } catch (error) {
    logError('PUT Error', error, { requestUrl: request.url });
    return createErrorResponse('Failed to update coffee entry', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createErrorResponse('Entry ID is required', 400, {
        receivedParams: Array.from(searchParams.entries()),
        required: ['id']
      });
    }

    const entryIndex = coffeeEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
      return createErrorResponse('Coffee entry not found', 404, {
        requestedId: id,
        availableIds: coffeeEntries.map(e => e.id)
      });
    }

    const deletedEntry = coffeeEntries.splice(entryIndex, 1)[0];
    
    // Save to persistent storage
    await saveCoffeeEntriesData(coffeeEntries);
    
    console.log('Coffee entry deleted. Entry ID:', id); // Debug log

    return createSuccessResponse({
      data: deletedEntry,
      message: 'Coffee entry deleted successfully'
    });
  } catch (error) {
    logError('DELETE Error', error, { requestUrl: request.url });
    return createErrorResponse('Failed to delete coffee entry', 500);
  }
}
