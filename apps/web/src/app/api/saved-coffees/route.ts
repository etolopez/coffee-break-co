import { NextRequest, NextResponse } from 'next/server';

/**
 * Winston-style logging function for development environment
 * In production, this should be replaced with Winston logger
 * 
 * @param level - Log level (info, warn, error, debug)
 * @param message - Log message
 * @param data - Optional data to log
 */
const log = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
};

/**
 * In-memory storage for saved coffees with localStorage fallback
 * In production, this would connect to a database
 */
let savedCoffees: any[] = [
  {
    id: '1',
    userId: 'customer_001',
    coffeeId: '1',
    coffeeName: 'Ethiopian Single Origin',
    origin: 'Yirgacheffe, Ethiopia',
    farm: 'Konga Cooperative',
    farmer: 'Tadesse Meskela',
    process: 'Washed',
    cuppingScore: '87',
    notes: 'Bright citrus, floral jasmine, dark chocolate finish',
    savedAt: new Date('2024-12-01T10:30:00Z').toISOString()
  }
];

/**
 * Helper function to get saved coffees from localStorage if available
 * Falls back to in-memory storage
 */
const getSavedCoffees = () => {
  try {
    // In a real app, this would be a database call
    // For now, we'll use in-memory storage but could extend to localStorage
    return savedCoffees;
  } catch (error) {
    log('warn', 'Failed to get saved coffees from storage, using in-memory fallback', error);
    return savedCoffees;
  }
};

/**
 * Helper function to save coffees to storage
 */
const saveCoffeesToStorage = (coffees: any[]) => {
  try {
    // In a real app, this would be a database save
    // For now, we'll update in-memory storage
    savedCoffees = coffees;
    return true;
  } catch (error) {
    log('error', 'Failed to save coffees to storage', error);
    return false;
  }
};

/**
 * GET /api/saved-coffees
 * Retrieves saved coffees for a specific user
 * 
 * @param request - Next.js request object
 * @param request.url - Request URL with userId query parameter
 * @returns JSON response with saved coffees data or error message
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      log('warn', 'Saved coffees fetch failed: missing userId parameter');
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      );
    }
    
    log('info', `Fetching saved coffees for user: ${userId}`);
    
    const allSavedCoffees = getSavedCoffees();
    const userSavedCoffees = allSavedCoffees.filter(saved => saved.userId === userId);
    
    // Sort by saved date (newest first)
    userSavedCoffees.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    
    log('info', `Successfully fetched ${userSavedCoffees.length} saved coffees for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      data: userSavedCoffees,
      count: userSavedCoffees.length
    });
  } catch (error) {
    log('error', 'Error fetching saved coffees', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch saved coffees' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-coffees
 * Saves a coffee for a user
 * 
 * @param request - Next.js request object
 * @param request.body - Request body containing coffee data
 * @param request.body.userId - ID of the user saving the coffee
 * @param request.body.coffeeId - ID of the coffee being saved
 * @param request.body.coffeeData - Coffee information to save
 * @returns JSON response with saved coffee data or error message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    log('info', 'Saving coffee for user', { userId: body.userId, coffeeId: body.coffeeId });
    
    // Validate required fields
    if (!body.userId || !body.coffeeId || !body.coffeeData) {
      log('warn', 'Coffee save failed: missing required fields', body);
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, coffeeId, and coffeeData are required' },
        { status: 400 }
      );
    }
    
    const allSavedCoffees = getSavedCoffees();
    
    // Check if coffee is already saved by this user
    const existingSave = allSavedCoffees.find(
      saved => saved.userId === body.userId && saved.coffeeId === body.coffeeId
    );
    
    if (existingSave) {
      log('warn', 'Coffee save failed: coffee already saved by user', { 
        userId: body.userId, 
        coffeeId: body.coffeeId 
      });
      return NextResponse.json(
        { success: false, error: 'This coffee is already saved in your profile' },
        { status: 409 }
      );
    }
    
    const newSavedCoffee = {
      id: Date.now().toString(),
      userId: body.userId,
      coffeeId: body.coffeeId,
      coffeeName: body.coffeeData.coffeeName,
      origin: body.coffeeData.origin,
      farm: body.coffeeData.farm,
      farmer: body.coffeeData.farmer,
      process: body.coffeeData.process,
      cuppingScore: body.coffeeData.cuppingScore,
      notes: body.coffeeData.notes,
      savedAt: new Date().toISOString()
    };
    
    // Add to saved coffees array
    const updatedCoffees = [newSavedCoffee, ...allSavedCoffees];
    
    // Save to storage
    if (!saveCoffeesToStorage(updatedCoffees)) {
      log('error', 'Failed to persist saved coffee to storage');
      return NextResponse.json(
        { success: false, error: 'Failed to save coffee to storage' },
        { status: 500 }
      );
    }
    
    log('info', 'Coffee saved successfully', { 
      saveId: newSavedCoffee.id, 
      userId: body.userId, 
      coffeeId: body.coffeeId 
    });
    
    return NextResponse.json({
      success: true,
      data: newSavedCoffee,
      message: 'Coffee saved successfully'
    });
  } catch (error) {
    log('error', 'Error saving coffee', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save coffee' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-coffees
 * Removes a saved coffee for a user
 * 
 * @param request - Next.js request object
 * @param request.url - Request URL with save ID query parameter
 * @returns JSON response with deleted coffee data or error message
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const saveId = searchParams.get('id');
    
    log('info', `Attempting to remove saved coffee with ID: ${saveId}`);
    
    if (!saveId) {
      log('warn', 'Saved coffee removal failed: missing save ID');
      return NextResponse.json(
        { success: false, error: 'Save ID is required' },
        { status: 400 }
      );
    }
    
    const allSavedCoffees = getSavedCoffees();
    const saveIndex = allSavedCoffees.findIndex(saved => saved.id === saveId);
    
    if (saveIndex === -1) {
      log('warn', `Saved coffee removal failed: save not found with ID: ${saveId}`);
      return NextResponse.json(
        { success: false, error: 'Saved coffee not found' },
        { status: 404 }
      );
    }
    
    const deletedSave = allSavedCoffees[saveIndex];
    const updatedCoffees = allSavedCoffees.filter(saved => saved.id !== saveId);
    
    // Save updated list to storage
    if (!saveCoffeesToStorage(updatedCoffees)) {
      log('error', 'Failed to persist updated saved coffees to storage');
      return NextResponse.json(
        { success: false, error: 'Failed to update saved coffees list' },
        { status: 500 }
      );
    }
    
    log('info', 'Saved coffee removed successfully', { saveId, userId: deletedSave.userId, coffeeId: deletedSave.coffeeId });
    
    return NextResponse.json({
      success: true,
      data: deletedSave,
      message: 'Coffee removed from saved list successfully'
    });
  } catch (error) {
    log('error', 'Error removing saved coffee', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove saved coffee' },
      { status: 500 }
    );
  }
}

