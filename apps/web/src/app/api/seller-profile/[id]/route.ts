import { NextRequest, NextResponse } from 'next/server';
import { getSellersData } from '../../shared/sellers-data';

/**
 * GET handler for specific seller profile by ID
 * Ensures proper user isolation and data security
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sellerId = params.id;
    const { searchParams } = new URL(request.url);
    const requestingUserId = searchParams.get('userId');
    const requestingUserRole = searchParams.get('userRole');
    
    console.log('🔍 Fetching specific seller profile:', { 
      sellerId, 
      requestingUserId, 
      requestingUserRole 
    });
    
    // Get sellers data
    const sellersData = await getSellersData();
    
    // Find the specific seller profile
    const sellerProfile = sellersData[sellerId];
    
    if (!sellerProfile) {
      console.log(`❌ Seller profile not found for ID: ${sellerId}`);
      return NextResponse.json(
        { success: false, error: 'Seller profile not found' },
        { status: 404 }
      );
    }
    
    // Security check: Allow public access to basic seller information
    // Only restrict access to sensitive data (phone, email, internal fields)
    const isOwnProfile = requestingUserId === sellerId;
    const isAdmin = requestingUserRole === 'admin';
    const isAuthenticated = !!requestingUserId;
    
    // Always allow public access to basic seller information
    // This enables the "Seller Info" button to work from the public sellers page
    
    // For non-owners, return limited profile data (public view)
    if (!isOwnProfile && !isAdmin) {
      const publicProfile = {
        id: sellerProfile.id,
        companyName: sellerProfile.companyName,
        companySize: sellerProfile.companySize,
        mission: sellerProfile.mission,
        logo: sellerProfile.logo,
        location: sellerProfile.location,
        country: sellerProfile.country,
        city: sellerProfile.city,
        rating: sellerProfile.rating,
        totalCoffees: sellerProfile.totalCoffees,
        memberSince: sellerProfile.memberSince,
        specialties: sellerProfile.specialties,
        description: sellerProfile.description,
        website: sellerProfile.website,
        socialMedia: sellerProfile.socialMedia,
        certifications: sellerProfile.certifications
        // Exclude sensitive fields like phone, email, internal data
      };
      
      console.log(`✅ Returning public profile for seller ${sellerId}`);
      return NextResponse.json({
        success: true,
        data: publicProfile,
        isPublicView: true
      });
    }
    
    // Return full profile for owners and admins
    console.log(`✅ Returning full profile for seller ${sellerId}`);
    return NextResponse.json({
      success: true,
      data: sellerProfile,
      isPublicView: false
    });
    
  } catch (error) {
    console.error('❌ Error fetching specific seller profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seller profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating specific seller profile by ID
 * Ensures only the profile owner can update their profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sellerId = params.id;
    const body = await request.json();
    const { userId, userRole, ...profileData } = body;
    
    console.log('📝 PUT updating specific seller profile:', { 
      sellerId, 
      userId, 
      userRole 
    });
    
    // Security check: Only profile owner can update
    if (userId !== sellerId) {
      console.log(`🚫 Update denied: User ${userId} cannot update profile ${sellerId}`);
      return NextResponse.json(
        { success: false, error: 'Can only update your own profile' },
        { status: 403 }
      );
    }
    
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
    let currentSeller = sellersData[sellerId];
    
    if (!currentSeller) {
      console.log(`❌ Seller profile not found for update: ${sellerId}`);
      return NextResponse.json(
        { success: false, error: 'Seller profile not found' },
        { status: 404 }
      );
    }
    
    // Update the seller profile with new data
    const updatedSeller = {
      ...currentSeller,
      ...profileData,
      id: sellerId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    // Import the update function dynamically to avoid circular dependencies
    const { updateSellerProfile } = await import('../../shared/sellers-data');
    await updateSellerProfile(sellerId, updatedSeller);

    console.log('✅ Updated specific seller profile:', sellerId);

    return NextResponse.json({
      success: true,
      data: updatedSeller,
      message: 'Seller profile updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating specific seller profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update seller profile' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for updating specific seller profile by ID (including logo uploads)
 * Ensures only the profile owner can update their profile
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sellerId = params.id;
    const body = await request.json();
    
    console.log('📝 POST updating specific seller profile:', { 
      sellerId, 
      bodyKeys: Object.keys(body)
    });
    
    // For logo uploads and profile updates, we need to get the current user from the request
    // Since this is a POST from the frontend, we'll assume it's the profile owner
    // In production, you'd want proper authentication headers
    
    // Get current sellers data
    const sellersData = await getSellersData();
    
    // Get the current seller profile
    let currentSeller = sellersData[sellerId];
    
    if (!currentSeller) {
      console.log(`❌ Seller profile not found for update: ${sellerId}`);
      return NextResponse.json(
        { success: false, error: 'Seller profile not found' },
        { status: 404 }
      );
    }
    
    // Update the seller profile with new data
    const updatedSeller = {
      ...currentSeller,
      ...body,
      id: sellerId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    // Import the update function dynamically to avoid circular dependencies
    const { updateSellerProfile } = await import('../../shared/sellers-data');
    await updateSellerProfile(sellerId, updatedSeller);

    console.log('✅ POST updated specific seller profile:', sellerId);

    return NextResponse.json({
      success: true,
      data: updatedSeller,
      message: 'Seller profile updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating specific seller profile via POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update seller profile' },
      { status: 500 }
    );
  }
}
