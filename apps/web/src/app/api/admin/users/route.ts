import { NextRequest, NextResponse } from 'next/server';

// Simple logging for admin operations
const log = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || '')
};

// Mock database - replace with real database in production
let users = [
  {
    id: '1',
    email: 'admin@coffeebreak.com',
    name: 'System Administrator',
    role: 'admin',
    companyName: 'Coffee Break Co',
    sellerId: null,
    createdAt: '2024-01-01',
    lastLogin: '2024-12-19',
    isActive: true,
    subscriptionStatus: 'active',
    subscriptionTier: 'enterprise'
  },
  {
    id: '2',
    email: 'seller1@coffeebreak.com',
    name: 'John Coffee',
    role: 'seller',
    companyName: 'Premium Coffee Co',
    sellerId: '1',
    createdAt: '2024-02-01',
    lastLogin: '2024-12-18',
    isActive: true,
    subscriptionStatus: 'active',
    subscriptionTier: 'premium'
  },
  {
    id: '3',
    email: 'customer1@coffeebreak.com',
    name: 'Sarah Bean',
    role: 'customer',
    companyName: null,
    sellerId: null,
    createdAt: '2024-03-01',
    lastLogin: '2024-12-17',
    isActive: true,
    subscriptionStatus: 'active',
    subscriptionTier: 'basic'
  }
];

/**
 * GET /api/admin/users
 * Retrieve all users with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    log.info('🔍 Admin: Fetching users list');
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let filteredUsers = [...users];
    
    // Filter by role
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        filteredUsers = filteredUsers.filter(user => user.isActive);
      } else if (status === 'inactive') {
        filteredUsers = filteredUsers.filter(user => !user.isActive);
      }
    }
    
    // Search functionality
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.companyName && user.companyName.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    log.info(`✅ Admin: Retrieved ${filteredUsers.length} users`);
    
    return NextResponse.json({
      success: true,
      data: filteredUsers,
      total: filteredUsers.length
    });
    
  } catch (error) {
    log.error('❌ Admin: Error fetching users', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    log.info('🔍 Admin: Creating new user', { email: body.email });
    
    // Validate required fields
    if (!body.email || !body.name || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Email, name, and role are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    if (users.find(user => user.email === body.email)) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: body.email,
      name: body.name,
      role: body.role,
      companyName: body.companyName || null,
      sellerId: body.sellerId || null,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionTier: body.subscriptionTier || 'basic'
    };
    
    users.push(newUser);
    
    log.info('✅ Admin: User created successfully', { userId: newUser.id });
    
    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    }, { status: 201 });
    
  } catch (error) {
    log.error('❌ Admin: Error creating user', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users
 * Update an existing user
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    log.info('🔍 Admin: Updating user', { userId: body.id });
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const userIndex = users.findIndex(user => user.id === body.id);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user fields
    users[userIndex] = {
      ...users[userIndex],
      ...body,
      id: body.id // Ensure ID cannot be changed
    };
    
    log.info('✅ Admin: User updated successfully', { userId: body.id });
    
    return NextResponse.json({
      success: true,
      data: users[userIndex],
      message: 'User updated successfully'
    });
    
  } catch (error) {
    log.error('❌ Admin: Error updating user', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users
 * Delete a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    log.info('🔍 Admin: Deleting user', { userId });
    
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is admin (prevent deleting admin users)
    if (users[userIndex].role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    log.info('✅ Admin: User deleted successfully', { userId });
    
    return NextResponse.json({
      success: true,
      data: deletedUser,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    log.error('❌ Admin: Error deleting user', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
