import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../users';

/**
 * Enhanced authentication system with proper user isolation
 * Each user now has a unique ID and sees only their own data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Auth attempt for email:', email);

    // Enhanced admin authentication with unique ID
    if (email === 'admin@coffeebreak.com' && password === 'password') {
      console.log('✅ Admin login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin-001', // Unique admin ID
          email: 'admin@coffeebreak.com',
          name: 'Admin User',
          role: 'admin',
          adminId: 'admin-001' // Additional admin identifier
        }
      });
    }

    // Enhanced seller authentication with unique IDs and proper data isolation
    if (email === 'seller@coffeebreak.com' && password === 'password') {
      console.log('✅ Free tier seller login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'seller-001', // Unique seller ID
          email: 'seller@coffeebreak.com',
          name: 'Free Tier Seller',
          role: 'seller',
          companyName: 'Free Tier Seller',
          sellerId: 'seller-001', // Unique seller identifier
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          uniqueSlug: 'free-tier-seller-001' // Unique slug for this seller
        }
      });
    }
    
    // Seller from premiumcoffee.com
    if (email === 'seller@premiumcoffee.com' && password === 'password') {
      console.log('✅ Premium Coffee seller login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'seller-002', // Unique seller ID
          email: 'seller@premiumcoffee.com',
          name: 'Premium Coffee Co',
          role: 'seller',
          companyName: 'Premium Coffee Co',
          sellerId: 'seller-002', // Unique seller identifier
          subscriptionTier: 'basic',
          subscriptionStatus: 'active',
          uniqueSlug: 'premium-coffee-co-002' // Unique slug for this seller
        }
      });
    }
    
    // Seller from mountainview.com
    if (email === 'seller@mountainview.com' && password === 'password') {
      console.log('✅ Mountain View seller login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'seller-003', // Unique seller ID
          email: 'seller@mountainview.com',
          name: 'Mountain View Roasters',
          role: 'seller',
          companyName: 'Mountain View Roasters',
          sellerId: 'seller-003', // Unique seller identifier
          subscriptionTier: 'basic',
          subscriptionStatus: 'active',
          uniqueSlug: 'mountain-view-roasters-003' // Unique slug for this seller
        }
      });
    }
    
    // Enhanced Liquid Soul seller authentication
    if (email === 'liquidsoul@coffeebreak.com' && password === 'password') {
      console.log('✅ Liquid Soul seller login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'seller-004', // Unique seller ID
          email: 'liquidsoul@coffeebreak.com',
          name: 'Liquid Soul',
          role: 'seller',
          companyName: 'Liquid Soul',
          sellerId: 'seller-004', // Unique seller identifier
          subscriptionTier: 'basic',
          subscriptionStatus: 'active',
          uniqueSlug: 'liquid-soul-004' // Unique slug for this seller
        }
      });
    }

    // Enhanced demo seller accounts for different tiers with unique IDs
    if (email === 'basic@coffeebreak.com' && password === 'password') {
      console.log('✅ Basic tier seller login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'seller-005', // Unique seller ID
          email: 'basic@coffeebreak.com',
          name: 'Basic Coffee Co',
          role: 'seller',
          companyName: 'Basic Coffee Co',
          sellerId: 'seller-005', // Unique seller identifier
          subscriptionTier: 'basic',
          subscriptionStatus: 'active',
          uniqueSlug: 'basic-coffee-co-005' // Unique slug for this seller
        }
      });
    }

    if (email === 'premium@coffeebreak.com' && password === 'password') {
      console.log('✅ Premium tier seller login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'seller-006', // Unique seller ID
          email: 'premium@coffeebreak.com',
          name: 'Premium Coffee Co',
          role: 'seller',
          companyName: 'Premium Coffee Co',
          sellerId: 'seller-006', // Unique seller identifier
          subscriptionTier: 'premium',
          subscriptionStatus: 'active',
          uniqueSlug: 'premium-coffee-co-006' // Unique slug for this seller
        }
      });
    }

    if (email === 'enterprise@coffeebreak.com' && password === 'password') {
      console.log('✅ Enterprise tier seller login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'seller-007', // Unique seller ID
          email: 'enterprise@coffeebreak.com',
          name: 'Enterprise Coffee Co',
          role: 'seller',
          companyName: 'Enterprise Coffee Co',
          sellerId: 'seller-007', // Unique seller identifier
          subscriptionTier: 'enterprise',
          subscriptionStatus: 'active',
          uniqueSlug: 'enterprise-coffee-co-007' // Unique slug for this seller
        }
      });
    }

    // Enhanced customer authentication with unique IDs
    if (email === 'customer@coffeebreak.com' && password === 'password') {
      console.log('✅ Customer login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'customer-001', // Unique customer ID
          email: 'customer@coffeebreak.com',
          name: 'Coffee Lover',
          role: 'customer',
          customerId: 'customer-001', // Unique customer identifier
          uniqueSlug: 'coffee-lover-001' // Unique slug for this customer
        }
      });
    }

    // Customer from example.com (the one you mentioned)
    if (email === 'customer@example.com' && password === 'password') {
      console.log('✅ Demo customer login successful');
      return NextResponse.json({
        success: true,
        user: {
          id: 'customer-002', // Unique customer ID
          email: 'customer@example.com',
          name: 'Demo Customer',
          role: 'customer',
          customerId: 'customer-002', // Unique customer identifier
          uniqueSlug: 'demo-customer-002' // Unique slug for this customer
        }
      });
    }

    // Then check the shared users array (for signup users)
    const user = findUserByEmail(email);
    
    if (user) {
      console.log('🔍 User found in shared storage:', { 
        email: user.email, 
        role: user.role, 
        hasPassword: !!user.password,
        passwordLength: user.password.length 
      });
      
      // Compare password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('🔐 Password comparison result:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('✅ User login successful:', user.role);
        
        // Generate unique ID if not present
        if (!user.id) {
          user.id = `${user.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Generate unique slug if not present
        if (!user.uniqueSlug) {
          const baseSlug = user.name || user.email.split('@')[0];
          user.uniqueSlug = `${baseSlug.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({
          success: true,
          user: userWithoutPassword
        });
      } else {
        console.log('❌ Invalid password for user:', email);
        console.log('🔍 Input password length:', password.length);
        console.log('🔍 Stored password hash length:', user.password.length);
      }
    } else {
      console.log('❌ User not found in shared storage:', email);
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
