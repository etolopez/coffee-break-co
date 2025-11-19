import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Coffee entries data file path - same as main API
const COFFEE_ENTRIES_FILE = path.join(process.cwd(), '..', '..', 'data', 'coffee-entries-persistent.json');

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

// Function to get all coffee entries from persistent storage
async function getAllCoffeeEntries(): Promise<any[]> {
  try {
    // Reload from file to get latest data
    coffeeEntries = await getCoffeeEntriesData();
    return coffeeEntries;
  } catch (error) {
    console.error('Error loading coffee entries:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sellerId = params.id;
    
    // Validate seller ID
    if (!sellerId || typeof sellerId !== 'string') {
      console.error('Invalid seller ID:', sellerId);
      return NextResponse.json(
        { success: false, error: 'Invalid seller ID' },
        { status: 400 }
      );
    }
    
    const allCoffees = await getAllCoffeeEntries();
    
    // Filter coffees by seller ID
    const sellerCoffees = allCoffees.filter((coffee: any) => {
      return coffee.sellerId === sellerId;
    });
    
    console.log(`📝 Found ${sellerCoffees.length} coffee entries for seller ${sellerId}`);
    
    return NextResponse.json({
      success: true,
      data: sellerCoffees,
      count: sellerCoffees.length,
      sellerId: sellerId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching coffee entries for seller:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coffee entries' },
      { status: 500 }
    );
  }
}
