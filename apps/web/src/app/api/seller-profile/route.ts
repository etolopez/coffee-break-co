import { NextRequest, NextResponse } from 'next/server';
import { getSellersData, updateSellerProfile } from '../shared/sellers-data';

/**
 * GET handler for seller profile
 * Now properly handles user-specific data based on authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameters or headers
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    
    console.log('🔍 Fetching seller profile for:', { userId, userRole });
    
    // If no user ID provided, return error
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }
    
    // Get sellers data
    const sellersData = await getSellersData();
    
    // Find the specific seller profile for this user
    let sellerProfile = null;
    
    if (userRole === 'seller') {
      // For sellers, find by user ID
      sellerProfile = sellersData[userId] || null;
      
      // If no profile found, create a default one
      if (!sellerProfile) {
        console.log(`📝 Creating default profile for new seller: ${userId}`);
        sellerProfile = {
          id: userId,
          companyName: 'New Coffee Company',
          companySize: '1-5 employees',
          mission: 'Building our coffee story one bean at a time.',
          logo: undefined,
          phone: '',
          email: '',
          location: '',
          country: '',
          city: '',
          rating: 0,
          totalCoffees: 0,
          memberSince: new Date().getFullYear(),
          specialties: [],
          featuredCoffeeId: '',
          description: 'new-seller',
          website: '',
          socialMedia: {
            instagram: '',
            facebook: '',
            twitter: ''
          },
          reviews: [],
          teamMembers: [],
          certifications: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Save the new profile
        await updateSellerProfile(userId, sellerProfile);
      }
    } else if (userRole === 'admin') {
      // For admins, return the first seller as a demo (or could return all sellers)
      sellerProfile = sellersData[Object.keys(sellersData)[0]] || null;
    } else {
      // For customers, return null (they don't have seller profiles)
      return NextResponse.json(
        { success: false, error: 'Customer users do not have seller profiles' },
        { status: 403 }
      );
    }
    
    if (!sellerProfile) {
      return NextResponse.json(
        { success: false, error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Found seller profile for user ${userId}:`, sellerProfile.companyName);
    
    return NextResponse.json({
      success: true,
      data: sellerProfile
    });
  } catch (error) {
    console.error('❌ Error fetching seller profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seller profile' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for updating seller profile
 * Now properly handles user-specific updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 POST request body received:', body);
    
    const { userId, userRole, ...profileData } = body;
    
    console.log('📝 Updating seller profile for user:', { userId, userRole });
    console.log('📝 Profile data to update:', profileData);
    
    // Validate required fields
    if (!userId || userRole !== 'seller') {
      return NextResponse.json(
        { success: false, error: 'Valid user ID and seller role required' },
        { status: 400 }
      );
    }
    
    // Get current sellers data
    const sellersData = await getSellersData();
    console.log('📝 Available seller IDs:', Object.keys(sellersData));
    console.log('📝 Looking for seller ID:', userId);
    
    // Get the current seller profile
    let currentSeller = sellersData[userId];
    console.log('📝 Current seller found:', currentSeller ? 'Yes' : 'No');
    
    if (!currentSeller) {
      // Create new profile if it doesn't exist
      currentSeller = {
        id: userId,
        companyName: 'New Coffee Company',
        companySize: '1-5 employees',
        mission: 'Building our coffee story one bean at a time.',
        logo: undefined,
        phone: '',
        email: '',
        location: '',
        country: '',
        city: '',
        rating: 0,
        totalCoffees: 0,
        memberSince: new Date().getFullYear(),
        specialties: [],
        featuredCoffeeId: '',
        description: 'new-seller',
        website: '',
        socialMedia: {
          instagram: '',
          facebook: '',
          twitter: ''
        },
        reviews: [],
        teamMembers: [],
        certifications: [],
        createdAt: new Date().toISOString()
      };
    }
    
    // Update the seller profile with new data
    const updatedSeller = {
      ...currentSeller,
      ...profileData,
      id: userId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    // Update the seller using the imported function
    await updateSellerProfile(userId, updatedSeller);

    console.log('✅ Updated seller profile for user:', userId);

    return NextResponse.json({
      success: true,
      data: updatedSeller,
      message: 'Seller profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating seller profile:', error);
    
    // Handle duplicate company name error specifically
    if (error.message && error.message.includes('already taken by another seller')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          errorType: 'DUPLICATE_NAME'
        },
        { status: 409 } // Conflict status for duplicate names
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update seller profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating seller profile (alternative to POST)
 * Now properly handles user-specific updates
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userRole, ...profileData } = body;
    
    console.log('📝 PUT updating seller profile for user:', { userId, userRole });
    
    // Validate required fields
    if (!userId || userRole !== 'seller') {
      return NextResponse.json(
        { success: false, error: 'Valid user ID and seller role required' },
        { status: 400 }
      );
    }
    
    // Get current sellers data
    const sellersData = await getSellersData();
    
    // Get the current seller profile
    let currentSeller = sellersData[userId];
    
    if (!currentSeller) {
      // Create new profile if it doesn't exist
      currentSeller = {
        id: userId,
        companyName: 'New Coffee Company',
        companySize: '1-5 employees',
        mission: 'Building our coffee story one bean at a time.',
        logo: undefined,
        phone: '',
        email: '',
        location: '',
        country: '',
        city: '',
        rating: 0,
        totalCoffees: 0,
        memberSince: new Date().getFullYear(),
        specialties: [],
        featuredCoffeeId: '',
        description: 'new-seller',
        website: '',
        socialMedia: {
          instagram: '',
          facebook: '',
          twitter: ''
        },
        reviews: [],
        teamMembers: [],
        certifications: [],
        createdAt: new Date().toISOString()
      };
    }
    
    // Update the seller profile with new data
    const updatedSeller = {
      ...currentSeller,
      ...profileData,
      id: userId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    // Update the seller using the imported function
    await updateSellerProfile(userId, updatedSeller);

    console.log('✅ PUT updated seller profile for user:', userId);

    return NextResponse.json({
      success: true,
      data: updatedSeller,
      message: 'Seller profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating seller profile:', error);
    
    // Handle duplicate company name error specifically
    if (error.message && error.message.includes('already taken by another seller')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          errorType: 'DUPLICATE_NAME'
        },
        { status: 409 } // Conflict status for duplicate names
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update seller profile' },
      { status: 500 }
    );
  }
}
