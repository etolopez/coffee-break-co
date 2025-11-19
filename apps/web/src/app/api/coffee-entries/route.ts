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
import { writeFile, mkdir } from 'fs/promises';

// Coffee entries data file path
const COFFEE_ENTRIES_FILE = path.join(process.cwd(), '..', '..', 'data', 'coffee-entries-persistent.json');

// Uploads directory path
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Function to save uploaded file
async function saveUploadedFile(file: File, filename: string): Promise<string> {
  try {
    // Ensure uploads directory exists
    await mkdir(UPLOADS_DIR, { recursive: true });
    
    // Create unique filename to avoid conflicts
    const timestamp = Date.now();
    const extension = path.extname(filename);
    const uniqueFilename = `${timestamp}-${filename}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    
    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Return the public URL path
    return `/uploads/${uniqueFilename}`;
  } catch (error) {
    console.error('Error saving uploaded file:', error);
    throw error;
  }
}

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
let isInitialized = false;

// Function to ensure coffee entries are loaded
async function ensureCoffeeEntriesLoaded(): Promise<void> {
  if (!isInitialized) {
    try {
      coffeeEntries = await getCoffeeEntriesData();
      isInitialized = true;
      console.log(`📝 Loaded ${coffeeEntries.length} coffee entries from persistent storage`);
    } catch (error) {
      console.error('❌ Error loading coffee entries from file:', error);
      coffeeEntries = [];
      isInitialized = true;
    }
  }
}

// Initialize coffee entries from file on module load
(async () => {
  await ensureCoffeeEntriesLoaded();
})();

export async function GET(request: NextRequest) {
  try {
    // Ensure coffee entries are loaded before processing
    await ensureCoffeeEntriesLoaded();
    
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
    
    // Return data directly (not wrapped in success response for mobile compatibility)
    const response = NextResponse.json(filteredEntries);
    return response;
  } catch (error) {
    logError('GET Error', error);
    return createErrorResponse('Failed to fetch coffee entries', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure coffee entries are loaded before processing
    await ensureCoffeeEntriesLoaded();
    
    // Handle multipart form data for file uploads
    const formData = await request.formData();
    
    // Extract text fields
    const body: any = {};
    const entries = Array.from(formData.entries());
    
    for (const [key, value] of entries) {
      if (key.startsWith('farmPhotos[')) {
        // Handle single farm photo (limit to 1 as requested)
        if (!body.farmPhotos) body.farmPhotos = [];
        if (value instanceof File) {
          try {
            // Save the uploaded file and get the URL
            const fileUrl = await saveUploadedFile(value, value.name);
            // Only keep the first photo (limit to 1)
            body.farmPhotos = [fileUrl];
          } catch (error) {
            console.error('Error saving farm photo:', error);
            // Continue with other files if one fails
          }
        }
      } else if (key === 'roastingCurveImage' && value instanceof File) {
        // Handle roasting curve image
        try {
          const fileUrl = await saveUploadedFile(value, value.name);
          body.roastingCurveImage = fileUrl;
        } catch (error) {
          console.error('Error saving roasting curve image:', error);
        }
      } else if (key === 'certifications' || key === 'environmentalPractices' || key === 'coordinates') {
        // Parse JSON strings back to objects/arrays
        try {
          body[key] = JSON.parse(value as string);
        } catch {
          body[key] = value;
        }
      } else {
        body[key] = value;
      }
    }
    
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
    
    // Generate unique slug for the coffee entry using the new system
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
    // Ensure coffee entries are loaded before processing
    await ensureCoffeeEntriesLoaded();
    
    // Handle multipart form data for file uploads
    const formData = await request.formData();
    
    // Extract text fields
    const body: any = {};
    const entries = Array.from(formData.entries());
    
    for (const [key, value] of entries) {
      if (key.startsWith('farmPhotos[')) {
        // Handle single farm photo (limit to 1 as requested)
        if (!body.farmPhotos) body.farmPhotos = [];
        if (value instanceof File) {
          try {
            // Save the uploaded file and get the URL
            const fileUrl = await saveUploadedFile(value, value.name);
            // Only keep the first photo (limit to 1)
            body.farmPhotos = [fileUrl];
          } catch (error) {
            console.error('Error saving farm photo:', error);
            // Continue with other files if one fails
          }
        } else {
          // Handle existing photo URLs
          try {
            const photoUrls = JSON.parse(value as string);
            if (Array.isArray(photoUrls)) {
              // Only keep the first photo (limit to 1)
              body.farmPhotos = photoUrls.slice(0, 1);
            }
          } catch {
            // Only keep the first photo (limit to 1)
            body.farmPhotos = [value as string];
          }
        }
      } else if (key === 'roastingCurveImage') {
        // Handle roasting curve image
        if (value instanceof File) {
          try {
            const fileUrl = await saveUploadedFile(value, value.name);
            body.roastingCurveImage = fileUrl;
          } catch (error) {
            console.error('Error saving roasting curve image:', error);
          }
        } else {
          // Handle existing image URL
          body.roastingCurveImage = value as string;
        }
      } else if (key === 'certifications' || key === 'environmentalPractices' || key === 'coordinates') {
        // Parse JSON strings back to objects/arrays
        try {
          body[key] = JSON.parse(value as string);
        } catch {
          body[key] = value;
        }
      } else {
        body[key] = value;
      }
    }
    
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

    // Check if the coffee name is being updated
    const isNameUpdate = body.coffeeName && body.coffeeName !== coffeeEntries[entryIndex].coffeeName;
    
    // Update the entry while preserving the original ID and creation date
    const updatedEntry = {
      ...coffeeEntries[entryIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    // If the coffee name changed, generate a new slug but keep the same unique ID
    if (isNameUpdate) {
      console.log('🔄 Coffee name updated, generating new slug...');
      console.log('🔄 Old name:', coffeeEntries[entryIndex].coffeeName);
      console.log('🔄 New name:', body.coffeeName);
      
      // Generate new slug with the new name but same ID
      const newSlug = generateCoffeeSlug(body.coffeeName, body.id);
      updatedEntry.slug = newSlug;
      
      console.log('🔄 New slug generated:', newSlug);
      console.log('🔄 Unique ID preserved:', body.id);
    }

    coffeeEntries[entryIndex] = updatedEntry;
    
    // Save to persistent storage
    await saveCoffeeEntriesData(coffeeEntries);
    
    console.log('Coffee entry updated. Entry ID:', body.id); // Debug log
    if (isNameUpdate) {
      console.log('Slug updated from:', coffeeEntries[entryIndex].slug, 'to:', updatedEntry.slug);
    }

    return createSuccessResponse({
      data: updatedEntry,
      message: 'Coffee entry updated successfully',
      slugUpdated: isNameUpdate,
      newSlug: isNameUpdate ? updatedEntry.slug : undefined
    });
  } catch (error) {
    logError('PUT Error', error, { requestUrl: request.url });
    return createErrorResponse('Failed to update coffee entry', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Ensure coffee entries are loaded before processing
    await ensureCoffeeEntriesLoaded();
    
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
