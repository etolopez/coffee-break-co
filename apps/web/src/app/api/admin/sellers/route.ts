import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple logging for admin operations
const log = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || '')
};

// Function to read sellers from persistent data
const loadSellersFromFile = async () => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'sellers-persistent.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const sellersData = JSON.parse(data);
    
    // Load coffee entries to include with sellers
    let coffeeEntries: any[] = [];
    try {
      const coffeePath = path.join(process.cwd(), 'data', 'coffee-entries-persistent.json');
      const coffeeData = await fs.readFile(coffeePath, 'utf8');
      const coffeeJson = JSON.parse(coffeeData);
      coffeeEntries = coffeeJson.entries || [];
      log.info(`☕ Loaded ${coffeeEntries.length} coffee entries`);
    } catch (coffeeError) {
      log.warn('⚠️ Could not load coffee entries:', coffeeError);
    }
    
    // Convert object format to array format and include coffee entries
    const sellersArray = Object.values(sellersData).map((seller: any) => {
      // Find coffee entries for this seller
      const sellerCoffees = coffeeEntries.filter((coffee: any) => coffee.sellerId === seller.id);
      
      if (sellerCoffees.length > 0) {
        log.info(`☕ ${seller.companyName}: Found ${sellerCoffees.length} coffees with sellerId ${seller.id}`);
        sellerCoffees.forEach((coffee: any) => {
          log.info(`  - ${coffee.coffeeName} (ID: ${coffee.id}, sellerId: ${coffee.sellerId})`);
        });
      }
      
      return {
        ...seller,
        // Ensure all required fields are present
        monthlyRevenue: seller.monthlyRevenue || 0,
        totalRevenue: seller.totalRevenue || 0,
        customerCount: seller.customerCount || 0,
        subscriptionExpiry: seller.subscriptionExpiry || '2025-12-31',
        rating: seller.rating || 0,
        totalCoffees: seller.totalCoffees || 0,
        // Include the actual coffee entries
        coffees: sellerCoffees
      };
    });
    
    log.info(`📁 Loaded ${sellersArray.length} sellers from persistent data with coffee entries`);
    return sellersArray;
  } catch (error) {
    log.warn('⚠️ Could not load sellers from file, using fallback data', error);
    return [];
  }
};

// Function to get countries from coffee entries
const loadCountriesFromCoffeeEntries = async () => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'coffee-entries-persistent.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const coffeeData = JSON.parse(data);
    
    // Extract unique countries from coffee entries
    const countries = new Set<string>();
    Object.values(coffeeData).forEach((entry: any) => {
      if (entry.origin) {
        // Extract country from origin (e.g., "Monteverde, Costa Rica" -> "Costa Rica")
        const parts = entry.origin.split(',').map((part: string) => part.trim());
        if (parts.length > 1) {
          countries.add(parts[parts.length - 1]); // Last part is usually the country
        } else {
          countries.add(parts[0]); // Single part like "Guatemala"
        }
      }
    });
    
    log.info(`🌍 Found ${countries.size} countries from coffee entries`);
    return Array.from(countries);
  } catch (error) {
    log.warn('⚠️ Could not load coffee entries, using fallback countries', error);
    return ['Canada', 'United States', 'Costa Rica', 'Ethiopia', 'Colombia', 'Guatemala', 'Mexico', 'Honduras', 'Brazil', 'Kenya', 'Panama'];
  }
};

// Mock database - replace with real database in production
let sellers = [
  {
    id: '1',
    companyName: 'Ethiopian Coffee Co.',
    companySize: 'Medium',
    mission: 'Premium Ethiopian coffee sourcing',
    logo: null,
    phone: '+251-911-123-456',
    email: 'info@ethiopiancoffee.com',
    location: 'Addis Ababa, Ethiopia',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    rating: 4.8,
    totalCoffees: 12,
    memberSince: 2023,
    specialties: ['Single Origin', 'Organic'],
    certifications: ['Organic', 'Fair Trade'],
    featuredCoffeeId: '1',
    description: 'Premium Ethiopian coffee',
    website: 'https://ethiopiancoffee.com',
    socialMedia: {
      instagram: '@ethiopiancoffee',
      facebook: 'ethiopiancoffee',
      twitter: '@ethiopiancoffee'
    },
    defaultPricePerBag: '$18.99',
    orderLink: 'https://order.ethiopiancoffee.com',
    reviews: [],
    teamMembers: [],
    subscriptionStatus: 'active',
    subscriptionTier: 'premium',
    subscriptionExpiry: '2025-01-01',
    monthlyRevenue: 2500,
    totalRevenue: 15000,
    customerCount: 45
  },
  {
    id: '2',
    companyName: 'Colombian Roasters',
    companySize: 'Large',
    mission: 'Artisanal Colombian coffee',
    logo: null,
    phone: '+57-300-123-456',
    email: 'contact@colombianroasters.com',
    location: 'Bogotá, Colombia',
    city: 'Bogotá',
    country: 'Colombia',
    rating: 4.6,
    totalCoffees: 8,
    memberSince: 2024,
    specialties: ['Artisanal', 'High Altitude'],
    certifications: ['Rainforest Alliance'],
    featuredCoffeeId: '2',
    description: 'Artisanal Colombian coffee',
    website: 'https://colombianroasters.com',
    socialMedia: {
      instagram: '@colombianroasters',
      facebook: 'colombianroasters',
      twitter: '@colombianroasters'
    },
    defaultPricePerBag: '$22.99',
    orderLink: 'https://order.colombianroasters.com',
    reviews: [],
    teamMembers: [],
    subscriptionStatus: 'active',
    subscriptionTier: 'enterprise',
    subscriptionExpiry: '2025-06-01',
    monthlyRevenue: 4200,
    totalRevenue: 28000,
    customerCount: 78
  }
];

/**
 * GET /api/admin/sellers
 * Retrieve all sellers with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    log.info('🔍 Admin: Fetching sellers list');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const search = searchParams.get('search');
    
    // Load real sellers from persistent data
    let filteredSellers = await loadSellersFromFile();
    
    // If no sellers loaded from file, fall back to mock data
    if (filteredSellers.length === 0) {
      log.warn('⚠️ No sellers loaded from file, using mock data');
      filteredSellers = [...sellers];
    }
    
    // Filter by subscription status
    if (status && status !== 'all') {
      filteredSellers = filteredSellers.filter(seller => seller.subscriptionStatus === status);
    }
    
    // Filter by subscription tier
    if (tier && tier !== 'all') {
      filteredSellers = filteredSellers.filter(seller => seller.subscriptionTier === tier);
    }
    
    // Search functionality
    if (search) {
      filteredSellers = filteredSellers.filter(seller => 
        seller.companyName.toLowerCase().includes(search.toLowerCase()) ||
        seller.email.toLowerCase().includes(search.toLowerCase()) ||
        seller.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    log.info(`✅ Admin: Retrieved ${filteredSellers.length} sellers`);
    
    return NextResponse.json({
      success: true,
      data: filteredSellers,
      total: filteredSellers.length
    });
    
  } catch (error) {
    log.error('❌ Admin: Error fetching sellers', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sellers
 * Create a new seller
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    log.info('🔍 Admin: Creating new seller', { companyName: body.companyName });
    
    // Validate required fields
    if (!body.companyName || !body.email || !body.location) {
      return NextResponse.json(
        { success: false, error: 'Company name, email, and location are required' },
        { status: 400 }
      );
    }
    
    // Check if seller already exists
    if (sellers.find(seller => seller.email === body.email)) {
      return NextResponse.json(
        { success: false, error: 'Seller with this email already exists' },
        { status: 409 }
      );
    }
    
    // Check if company name is already taken
    if (sellers.find(seller => seller.companyName?.toLowerCase().trim() === body.companyName?.toLowerCase().trim())) {
      return NextResponse.json(
        { success: false, error: `Company name "${body.companyName}" is already taken by another seller. Please choose a different name.` },
        { status: 409 }
      );
    }
    
    // Create new seller
    const newSeller = {
      id: Date.now().toString(),
      companyName: body.companyName,
      companySize: body.companySize || 'Small',
      mission: body.mission || `Premium coffee from ${body.location}`,
      logo: body.logo || null,
      phone: body.phone || '',
      email: body.email,
      location: body.location,
      city: body.city || body.location.split(',')[0]?.trim(),
      country: body.country || body.location.split(',').pop()?.trim(),
      rating: 0,
      totalCoffees: 0,
      memberSince: new Date().getFullYear(),
      specialties: body.specialties || ['Single Origin'],
      certifications: body.certifications || [],
      featuredCoffeeId: '',
      description: body.description || `Premium coffee from ${body.location}`,
      website: body.website || '',
      socialMedia: body.socialMedia || {},
      defaultPricePerBag: body.defaultPricePerBag || '$19.99',
      orderLink: body.orderLink || '',
      reviews: [],
      teamMembers: [],
      subscriptionStatus: 'pending',
      subscriptionTier: body.subscriptionTier || 'basic',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyRevenue: 0,
      totalRevenue: 0,
      customerCount: 0
    };
    
    sellers.push(newSeller);
    
    log.info('✅ Admin: Seller created successfully', { sellerId: newSeller.id });
    
    return NextResponse.json({
      success: true,
      data: newSeller,
      message: 'Seller created successfully'
    }, { status: 201 });
    
  } catch (error) {
    log.error('❌ Admin: Error creating seller', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create seller' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/sellers
 * Update an existing seller
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    log.info('🔍 Admin: Updating seller', { sellerId: body.id });
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Seller ID is required' },
        { status: 400 }
      );
    }
    
    const sellerIndex = sellers.findIndex(seller => seller.id === body.id);
    if (sellerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Seller not found' },
        { status: 404 }
      );
    }
    
    // Check if company name is being updated and if it's unique
    if (body.companyName && body.companyName.trim()) {
      const existingSellerWithName = sellers.find(seller => 
        seller.id !== body.id && 
        seller.companyName?.toLowerCase().trim() === body.companyName.toLowerCase().trim()
      );
      
      if (existingSellerWithName) {
        return NextResponse.json(
          { success: false, error: `Company name "${body.companyName}" is already taken by another seller. Please choose a different name.` },
          { status: 409 }
        );
      }
    }
    
    // Update seller fields
    sellers[sellerIndex] = {
      ...sellers[sellerIndex],
      ...body,
      id: body.id // Ensure ID cannot be changed
    };
    
    log.info('✅ Admin: Seller updated successfully', { sellerId: body.id });
    
    return NextResponse.json({
      success: true,
      data: sellers[sellerIndex],
      message: 'Seller updated successfully'
    });
    
  } catch (error) {
    log.error('❌ Admin: Error updating seller', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update seller' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sellers
 * Delete a seller
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('id');
    
    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: 'Seller ID is required' },
        { status: 400 }
      );
    }
    
    log.info('🔍 Admin: Deleting seller', { sellerId });
    
    const sellerIndex = sellers.findIndex(seller => seller.id === sellerId);
    if (sellerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Seller not found' },
        { status: 404 }
      );
    }
    
    const deletedSeller = sellers.splice(sellerIndex, 1)[0];
    
    log.info('✅ Admin: Seller deleted successfully', { sellerId });
    
    return NextResponse.json({
      success: true,
      data: deletedSeller,
      message: 'Seller deleted successfully'
    });
    
  } catch (error) {
    log.error('❌ Admin: Error deleting seller', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete seller' },
      { status: 500 }
    );
  }
}
