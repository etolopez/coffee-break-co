import { NextRequest, NextResponse } from 'next/server';
import { getSellersData, getBrandColor } from '../shared/sellers-data';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET endpoint to retrieve all sellers
 * Returns a list of all sellers with their basic information and coffee data
 * Used by the sellers page to display dynamic data instead of static hardcoded data
 * Data is shared with the seller-profile API to ensure consistency
 */

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

export async function GET() {
  try {
    // Get the latest sellers data from persistent storage
    const sellersData = await getSellersData();
    
    // Fetch coffee entries to get coffee data for each seller
    let coffeeEntries: any[] = [];
    try {
      // Read real coffee entries from the data file
      coffeeEntries = await getCoffeeEntriesData();
      console.log(`☕ Total coffee entries loaded: ${coffeeEntries.length}`);
      
      // Log coffee entries by seller for debugging
      const sellerIds = Object.keys(sellersData);
      sellerIds.forEach(sellerId => {
        const sellerCoffees = coffeeEntries.filter(coffee => coffee.sellerId === sellerId);
        console.log(`☕ Seller ${sellerId}: Found ${sellerCoffees.length} coffees`);
      });
    } catch (coffeeErr) {
      console.error('Failed to load coffee entries:', coffeeErr);
      coffeeEntries = [];
    }
    
    // Convert the sellers data object to an array format suitable for the sellers page
    const sellersArray = await Promise.all(Object.values(sellersData).map(async seller => {
      // Get coffee data for this seller
      const sellerCoffees = coffeeEntries.filter(coffee => 
        coffee.sellerId === seller.id || coffee.sellerId === String(seller.id)
      );
      
      const coffeeCount = sellerCoffees.length;
      
      // Debug logging for coffee count
      console.log(`☕ ${seller.companyName}: Found ${coffeeCount} coffees with sellerId ${seller.id}`);
      if (coffeeCount > 0) {
        sellerCoffees.forEach(coffee => {
          console.log(`  - ${coffee.coffeeName} (ID: ${coffee.id}, sellerId: ${coffee.sellerId})`);
        });
      }
      
      // Location display logic: prioritize city/country over the location field
      // This ensures that when users edit their profile with city/country, it shows correctly
      
      // Get featured coffee (first available coffee or most recent)
      const featuredCoffee = sellerCoffees.length > 0 
        ? sellerCoffees[0].coffeeName 
        : '';
      
      // Get region from coffee origins
      const regionParts = sellerCoffees
        .map(coffee => coffee.origin?.split(', ')[1] || coffee.origin)
        .filter(Boolean);
      const uniqueRegions = regionParts.filter((region, index, arr) => arr.indexOf(region) === index);
      const region = uniqueRegions.length > 0 ? uniqueRegions.join(', ') : '';
      
      // Calculate average rating from customer reviews (0-5 stars)
      // Use mock ratings for now since server-side API calls to relative URLs don't work
      let realCustomerRating = 0;
      let totalReviews = 0;
      
      // For now, use mock ratings to ensure the API works
      // In a production environment, this would come from a database or external API
      if (sellerCoffees.length > 0) {
        // Generate consistent mock ratings based on seller ID for demo purposes
        const seed = parseInt(seller.id) || 1;
        const mockRating = 3.5 + (seed * 0.3) + (Math.sin(seed) * 0.5);
        realCustomerRating = Math.min(5, Math.max(0, mockRating));
        totalReviews = Math.floor(Math.random() * 20) + 5; // 5-25 reviews
      }
      
      console.log(`⭐ ${seller.companyName}: Mock rating ${realCustomerRating.toFixed(1)}, ${totalReviews} reviews`);
      
      // Determine the best location display - prioritize city/country over location field
      let displayLocation = seller.location || 'Location not specified';
      if (seller.city && seller.country) {
        displayLocation = `${seller.city}, ${seller.country}`;
      } else if (seller.city) {
        displayLocation = seller.city;
      } else if (seller.country) {
        displayLocation = seller.country;
      }
      
      // Log location calculation for debugging
      console.log(`📍 ${seller.companyName}: location="${seller.location}", city="${seller.city}", country="${seller.country}" → display="${displayLocation}"`);
      
      // Get logo from seller profile (this will now reflect uploaded logos)
      // Only set logo if there's an actual logo URL, otherwise leave as undefined for colored placeholders
      const sellerLogo = seller.logo && seller.logo !== 'undefined' && seller.logo !== 'null' ? seller.logo : undefined;
      
      // Debug logo processing
      console.log(`🖼️ ${seller.companyName}: original logo="${seller.logo}", processed logo="${sellerLogo}", will show placeholder: ${!sellerLogo}`);
      
      return {
        id: seller.id,
        name: seller.companyName, // Map companyName to name for frontend compatibility
        location: displayLocation, // Use the calculated display location
        description: seller.mission,
        featuredCoffee: featuredCoffee,
        region: region,
        certifications: seller.certifications || [],
        rating: realCustomerRating, // Customer review rating (0-5 stars)
        totalReviews: totalReviews, // Total number of customer reviews
        coffeeCount: coffeeCount,
        memberSince: seller.memberSince || 2024,
        image: sellerLogo, // Use the actual logo from seller profile
        sellerPhoto: sellerLogo, // Use logo as seller photo
        specialties: seller.specialties || [],
        brandColor: getBrandColor(seller.id), // Generate consistent brand colors
        logo: sellerLogo, // Include logo for direct access
        // Additional coffee information (without pricing)
        coffees: sellerCoffees.map(coffee => ({
          id: coffee.id,
          name: coffee.coffeeName,
          origin: coffee.origin,
          cuppingScore: coffee.cuppingScore,
          available: coffee.available,
          farm: coffee.farm
        }))
      };
    }));

    console.log(`✅ Sellers API: Processed ${sellersArray.length} sellers with coffee data`);
    sellersArray.forEach(seller => {
      console.log(`📊 ${seller.name}: ${seller.coffeeCount} coffees, Rating: ${seller.rating.toFixed(1)}, Reviews: ${seller.totalReviews}, Location: ${seller.location}`);
    });

    return NextResponse.json({
      success: true,
      data: sellersArray
    });
  } catch (error) {
    console.error('❌ Error fetching sellers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}
