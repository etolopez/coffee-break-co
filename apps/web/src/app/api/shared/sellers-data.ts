// Shared sellers data - this would come from your database
// This data is shared between seller-profile/[id] and /sellers endpoints
// Now properly handles user-specific data with unique IDs

// Import Node.js modules for file system operations
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';

// Path to the persistent data file
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'sellers-persistent.json');

// Default sellers data with unique IDs matching the auth system
const defaultSellersData: { [key: string]: any } = {
  'seller-001': {
    id: 'seller-001',
    companyName: 'Premium Coffee Co.',
    companySize: '25 employees',
    mission: 'Connecting coffee lovers with exceptional farmers worldwide through transparent, sustainable sourcing.',
    logo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center',
    phone: '+1 (555) 123-4567',
    email: 'orders@premiumcoffee.com',
    location: 'Toronto, Canada',
    country: 'Canada',
    city: 'Toronto',
    rating: 0, // Will be calculated dynamically from actual reviews
    totalCoffees: 0, // Will be calculated dynamically from actual coffee entries
    memberSince: 2023,
    specialties: ['Single Origin', 'Organic', 'Fair Trade'],
    featuredCoffeeId: '',
    description: 'premium-sourcing',
    website: 'https://premiumcoffee.com',
    socialMedia: {
      instagram: '@premiumcoffee',
      facebook: 'Premium Coffee Co.',
      twitter: '@premiumcoffee'
    },
    reviews: [],
    teamMembers: [],
    certifications: ['Organic', 'Fair Trade', 'Direct Trade'],
    uniqueSlug: 'premium-coffee-co-001',
    subscriptionTier: 'free',
    subscriptionStatus: 'active'
  },
  'seller-002': {
    id: 'seller-002',
    companyName: 'Liquid Soul Coffee',
    companySize: '15 employees',
    mission: 'Bringing you the finest beans from high-altitude farms with a focus on sustainability.',
    logo: undefined, // Will be updated when user uploads logo
    phone: '+1 (555) 234-5678',
    email: 'hello@liquidsoul.com',
    location: 'Denver, Colorado',
    rating: 0, // Will be calculated dynamically from actual reviews
    totalCoffees: 0, // Will be calculated dynamically from actual coffee entries
    memberSince: 2022,
    specialties: ['High Altitude', 'Sustainability', 'Small Batch'],
    featuredCoffeeId: '',
    description: 'artisan-roasting',
    website: 'https://liquidsoul.com',
    socialMedia: {
      instagram: '@liquidsoul',
      facebook: 'Liquid Soul',
      twitter: '@liquidsoul'
    },
    reviews: [],
    teamMembers: [],
    certifications: ['Organic', 'Rainforest Alliance'],
    uniqueSlug: 'liquid-soul-coffee-002',
    subscriptionTier: 'basic',
    subscriptionStatus: 'active'
  },
  'seller-003': {
    id: 'seller-003',
    companyName: 'Basic Coffee Co',
    companySize: '8 employees',
    mission: 'Sourcing exceptional coffees with a commitment to quality and accessibility.',
    logo: undefined,
    phone: '+1 (555) 345-6789',
    email: 'info@basiccoffee.com',
    location: 'San Francisco, California',
    rating: 0, // Will be calculated dynamically from actual reviews
    totalCoffees: 0, // Will be calculated dynamically from actual coffee entries
    memberSince: 2021,
    specialties: ['Quality', 'Accessibility', 'Direct Trade'],
    featuredCoffeeId: '',
    description: 'quality-focused',
    website: 'https://basiccoffee.com',
    socialMedia: {
      instagram: '@basiccoffee',
      facebook: 'Basic Coffee Co',
      twitter: '@basiccoffee'
    },
    reviews: [],
    teamMembers: [],
    certifications: ['Organic', 'Fair Trade'],
    uniqueSlug: 'basic-coffee-co-003',
    subscriptionTier: 'basic',
    subscriptionStatus: 'active'
  },
  // New test seller for complete journey testing
  'test-seller-001': {
    id: 'test-seller-001',
    companyName: 'Test Coffee Company',
    companySize: '5 employees',
    mission: 'Testing the complete seller journey from signup to premium tier with coffee entries.',
    logo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center', // Added logo
    phone: '+1 (555) 999-8888',
    email: 'testseller@coffeebreak.com',
    location: 'Test City, Test Country',
    country: 'Test Country',
    city: 'Test City',
    rating: 4.7, // Added rating
    totalCoffees: 3, // Added coffee entries
    memberSince: new Date().getFullYear(),
    specialties: ['Testing', 'Quality Assurance', 'System Validation', 'Premium Roasting'],
    featuredCoffeeId: 'test-coffee-001',
    description: 'test-seller-journey',
    website: 'https://testcoffee.com',
    socialMedia: {
      instagram: '@testcoffee',
      facebook: 'Test Coffee Company',
      twitter: '@testcoffee'
    },
    reviews: [
      {
        id: 'review-001',
        rating: 5,
        comment: 'Excellent test coffee! Perfect for system validation.',
        reviewer: 'System Tester',
        date: new Date().toISOString()
      }
    ],
    teamMembers: [
      {
        id: 'member-001',
        name: 'Test Roaster',
        occupation: 'Quality Assurance Specialist',
        image: undefined
      }
    ],
    certifications: ['Test Certified', 'Quality Validated', 'Premium Roaster'],
    uniqueSlug: 'test-seller-user-001',
    subscriptionTier: 'premium', // Upgraded to premium tier
    subscriptionStatus: 'active',
    monthlyRevenue: 79.99, // Premium tier pricing
    totalRevenue: 239.97, // 3 months of premium
    customerCount: 12, // Added customer count
    subscriptionExpiry: '2025-12-31'
  },
  'seller-004': {
    id: 'seller-004',
    companyName: 'Monteverde Coffee Estates',
    companySize: '30 employees',
    mission: 'Premium coffee from the finest regions, featuring exceptional quality and unique flavor profiles.',
    logo: undefined,
    phone: '+1 (555) 456-7890',
    email: 'contact@premiumcoffee.com',
    location: 'Monteverde, Costa Rica',
    rating: 0, // Will be calculated dynamically from actual reviews
    totalCoffees: 0, // Will be calculated dynamically from actual coffee entries
    memberSince: 2020,
    specialties: ['Premium Quality', 'Unique Flavors', 'Expert Roasting'],
    featuredCoffeeId: '',
    description: 'premium-quality',
    website: 'https://premiumcoffee.com',
    socialMedia: {
      instagram: '@premiumcoffee',
      facebook: 'Premium Coffee Co',
      twitter: '@premiumcoffee'
    },
    reviews: [],
    teamMembers: [],
    certifications: ['Fair Trade', 'Direct Trade', 'Organic'],
    uniqueSlug: 'monteverde-coffee-estates-004',
    subscriptionTier: 'premium',
    subscriptionStatus: 'active'
  },
  'seller-005': {
    id: 'seller-005',
    companyName: 'Enterprise Coffee Co',
    companySize: '50 employees',
    mission: 'Leading the coffee industry with innovative solutions and enterprise-grade services.',
    logo: undefined,
    phone: '+1 (555) 567-8901',
    email: 'enterprise@enterprisecoffee.com',
    location: 'New York, New York',
    rating: 0, // Will be calculated dynamically from actual reviews
    totalCoffees: 0, // Will be calculated dynamically from actual coffee entries
    memberSince: 2019,
    specialties: ['Enterprise Solutions', 'Innovation', 'Scale'],
    featuredCoffeeId: '',
    description: 'enterprise-solutions',
    website: 'https://enterprisecoffee.com',
    socialMedia: {
      instagram: '@enterprisecoffee',
      facebook: 'Enterprise Coffee Co',
      twitter: '@enterprisecoffee'
    },
    reviews: [],
    teamMembers: [],
    certifications: ['ISO 9001', 'Organic', 'Fair Trade'],
    uniqueSlug: 'enterprise-coffee-co-005',
    subscriptionTier: 'enterprise',
    subscriptionStatus: 'active'
  }
};

// In-memory cache for sellers data
let sellersDataCache: { [key: string]: any } = { ...defaultSellersData };

/**
 * Loads seller data from persistent storage and merges with defaults
 * Ensures all data is consistent with current schema and unique IDs
 */
const loadPersistentData = async (): Promise<{ [key: string]: any }> => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE_PATH);
    if (!fsSync.existsSync(dataDir)) {
      fsSync.mkdirSync(dataDir, { recursive: true });
    }

    // Check if persistent data file exists
    if (fsSync.existsSync(DATA_FILE_PATH)) {
      const fileContent = fsSync.readFileSync(DATA_FILE_PATH, 'utf8');
      const persistentData = JSON.parse(fileContent);
      
      // Clean up old pricing data and merge with defaults
      const cleanedData: { [key: string]: any } = {};
      
      Object.keys(persistentData).forEach(sellerId => {
        const seller = persistentData[sellerId];
        const defaultSeller = defaultSellersData[sellerId];
        
        if (defaultSeller) {
          // Merge persistent data with defaults, removing pricing fields
          const { defaultPricePerBag, orderLink, ...cleanSeller } = seller;
          cleanedData[sellerId] = {
            ...defaultSeller,
            ...cleanSeller,
            // Ensure these fields are always present and clean
            defaultPricePerBag: undefined,
            orderLink: undefined
          };
        } else {
          // If no default found, clean the existing data
          const { defaultPricePerBag, orderLink, ...cleanSeller } = seller;
          cleanedData[sellerId] = {
            ...cleanSeller,
            defaultPricePerBag: undefined,
            orderLink: undefined
          };
        }
      });
      
      // Add any new default sellers that don't exist in persistent data
      Object.keys(defaultSellersData).forEach(sellerId => {
        if (!cleanedData[sellerId]) {
          cleanedData[sellerId] = defaultSellersData[sellerId];
        }
      });
      
      sellersDataCache = cleanedData;
      
      // Save the cleaned data back to file
      await savePersistentData(cleanedData);
      
      console.log(`✅ Loaded and cleaned ${Object.keys(cleanedData).length} sellers from persistent storage`);
      return cleanedData;
    } else {
      // No persistent data exists, use defaults
      sellersDataCache = { ...defaultSellersData };
      console.log(`📝 No persistent data found, using ${Object.keys(defaultSellersData).length} default sellers`);
      return { ...defaultSellersData };
    }
  } catch (error) {
    console.error('❌ Error loading persistent data:', error);
    // Fallback to defaults on error
    sellersDataCache = { ...defaultSellersData };
    console.log(`⚠️ Error loading persistent data, using ${Object.keys(defaultSellersData).length} default sellers`);
    return { ...defaultSellersData };
  }
};

/**
 * Saves sellers data to persistent storage file
 * Ensures data persists across server restarts
 */
async function savePersistentData(data: { [key: string]: any }): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Save data to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    
    // Update cache
    sellersDataCache = { ...data };
    
    console.log('💾 Saved sellers data to persistent storage:', DATA_FILE_PATH);
    console.log('📊 Data summary:', Object.keys(data).length, 'sellers saved');
  } catch (error) {
    console.error('❌ Failed to save persistent data:', error);
    console.error('📁 File path:', DATA_FILE_PATH);
    console.error('🔍 Error details:', error.message);
    // Still update cache even if file save fails
    sellersDataCache = { ...data };
  }
}

/**
 * Checks if a company name is already taken by another seller
 * @param companyName - The company name to check
 * @param excludeSellerId - The seller ID to exclude from the check (for updates)
 * @returns true if the name is available, false if it's taken
 */
export async function isCompanyNameAvailable(companyName: string, excludeSellerId?: string): Promise<boolean> {
  try {
    const currentData = await loadPersistentData();
    
    // Check if any other seller has this company name
    for (const [sellerId, seller] of Object.entries(currentData)) {
      // Skip the current seller if we're updating
      if (excludeSellerId && sellerId === excludeSellerId) {
        continue;
      }
      
      // Check if the company name matches (case-insensitive)
      if (seller.companyName && seller.companyName.toLowerCase().trim() === companyName.toLowerCase().trim()) {
        return false; // Name is taken
      }
    }
    
    return true; // Name is available
  } catch (error) {
    console.error('❌ Error checking company name availability:', error);
    // If there's an error checking, assume the name is not available for safety
    return false;
  }
}

/**
 * Updates a specific seller profile and persists the changes
 * Now properly handles user-specific data with unique IDs and prevents duplicate names
 * @param sellerId - The seller's unique identifier
 * @param updates - The data to update
 * @returns The updated seller profile
 */
export async function updateSellerProfile(sellerId: string, updates: any): Promise<any> {
  try {
    // Load latest data from file
    const currentData = await loadPersistentData();
    
    // Check if company name is being updated and if it's unique
    if (updates.companyName && updates.companyName.trim()) {
      const isNameAvailable = await isCompanyNameAvailable(updates.companyName, sellerId);
      if (!isNameAvailable) {
        throw new Error(`Company name "${updates.companyName}" is already taken by another seller. Please choose a different name.`);
      }
    }
    
    // Update the seller profile
    const updatedSeller = {
      ...currentData[sellerId],
      ...updates,
      id: sellerId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    // Update the data
    currentData[sellerId] = updatedSeller;
    
    // Save to persistent storage
    await savePersistentData(currentData);
    
    console.log(`✅ Updated seller ${sellerId} profile and saved to persistent storage`);
    return updatedSeller;
  } catch (error) {
    console.error(`❌ Failed to update seller ${sellerId} profile:`, error);
    throw error;
  }
}

/**
 * Gets the current sellers data (from cache or loads from file)
 * @returns The current sellers data
 */
export async function getSellersData(): Promise<{ [key: string]: any }> {
  // If cache is empty, load from file
  if (Object.keys(sellersDataCache).length === 0) {
    await loadPersistentData();
  }
  return sellersDataCache;
}

/**
 * Gets a specific seller profile by ID
 * Now properly handles unique user IDs
 * @param sellerId - The seller's unique identifier
 * @returns The seller profile or null if not found
 */
export async function getSellerProfile(sellerId: string): Promise<any | null> {
  const data = await getSellersData();
  return data[sellerId] || null;
}

// Legacy export for backward compatibility
export let sellersData = sellersDataCache;

// Initialize data on module load
loadPersistentData().then(() => {
  console.log('🚀 Sellers data module initialized with persistent storage and unique IDs');
}).catch(error => {
  console.error('❌ Failed to initialize sellers data module:', error);
});

/**
 * Helper function to generate consistent brand colors for sellers
 * Ensures each seller has a unique and visually appealing color scheme
 * @param sellerId - The seller's unique identifier
 * @returns CSS gradient class string
 */
export function getBrandColor(sellerId: string): string {
  const colorSchemes = [
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-green-500 to-emerald-600',
    'from-yellow-500 to-amber-600',
    'from-red-500 to-pink-600',
    'from-indigo-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-orange-500 to-red-600',
    'from-teal-500 to-green-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-sky-500 to-blue-600'
  ];
  
  // Use the seller ID to consistently assign colors
  const colorIndex = parseInt(sellerId.replace(/\D/g, '')) % colorSchemes.length;
  return colorSchemes[colorIndex] || colorSchemes[0];
}
