import { NextRequest, NextResponse } from 'next/server';

// Simple logging for admin operations
const log = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || '')
};

// Mock database - replace with real database in production
let customers = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Smith',
    subscriptionStatus: 'active',
    subscriptionTier: 'premium',
    subscriptionExpiry: '2025-03-01',
    totalSpent: 450,
    coffeeCount: 15,
    lastPurchase: '2024-12-15',
    createdAt: '2024-03-01',
    isActive: true,
    customerCount: 100
  },
  {
    id: '2',
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    subscriptionStatus: 'active',
    subscriptionTier: 'basic',
    subscriptionExpiry: '2025-01-15',
    totalSpent: 180,
    coffeeCount: 8,
    lastPurchase: '2024-12-10',
    createdAt: '2024-06-01',
    isActive: true,
    customerCount: 50
  },
  {
    id: '3',
    email: 'mike@example.com',
    name: 'Mike Wilson',
    subscriptionStatus: 'inactive',
    subscriptionTier: 'basic',
    subscriptionExpiry: '2024-11-01',
    totalSpent: 95,
    coffeeCount: 5,
    lastPurchase: '2024-10-15',
    createdAt: '2024-07-01',
    isActive: false,
    customerCount: 25
  }
];

/**
 * GET /api/admin/customers
 * Retrieve all customers with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    log.info('🔍 Admin: Fetching customers list');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const search = searchParams.get('search');
    
    let filteredCustomers = [...customers];
    
    // Filter by subscription status
    if (status && status !== 'all') {
      filteredCustomers = filteredCustomers.filter(customer => customer.subscriptionStatus === status);
    }
    
    // Filter by subscription tier
    if (tier && tier !== 'all') {
      filteredCustomers = filteredCustomers.filter(customer => customer.subscriptionTier === tier);
    }
    
    // Search functionality
    if (search) {
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    log.info(`✅ Admin: Retrieved ${filteredCustomers.length} customers`);
    
    return NextResponse.json({
      success: true,
      data: filteredCustomers,
      total: filteredCustomers.length
    });
    
  } catch (error) {
    log.error('❌ Admin: Error fetching customers', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/customers
 * Create a new customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    log.info('🔍 Admin: Creating new customer', { email: body.email });
    
    // Validate required fields
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }
    
    // Check if customer already exists
    if (customers.find(customer => customer.email === body.email)) {
      return NextResponse.json(
        { success: false, error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new customer
    const newCustomer = {
      id: Date.now().toString(),
      email: body.email,
      name: body.name,
      subscriptionStatus: body.subscriptionStatus || 'pending',
      subscriptionTier: body.subscriptionTier || 'basic',
      subscriptionExpiry: body.subscriptionExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalSpent: body.totalSpent || 0,
      coffeeCount: body.coffeeCount || 0,
      lastPurchase: body.lastPurchase || null,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
      customerCount: body.customerCount || 0
    };
    
    customers.push(newCustomer);
    
    log.info('✅ Admin: Customer created successfully', { customerId: newCustomer.id });
    
    return NextResponse.json({
      success: true,
      data: newCustomer,
      message: 'Customer created successfully'
    }, { status: 201 });
    
  } catch (error) {
    log.error('❌ Admin: Error creating customer', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/customers
 * Update an existing customer
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    log.info('🔍 Admin: Updating customer', { customerId: body.id });
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    const customerIndex = customers.findIndex(customer => customer.id === body.id);
    if (customerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Update customer fields
    customers[customerIndex] = {
      ...customers[customerIndex],
      ...body,
      id: body.id // Ensure ID cannot be changed
    };
    
    log.info('✅ Admin: Customer updated successfully', { customerId: body.id });
    
    return NextResponse.json({
      success: true,
      data: customers[customerIndex],
      message: 'Customer updated successfully'
    });
    
  } catch (error) {
    log.error('❌ Admin: Error updating customer', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers
 * Delete a customer
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    log.info('🔍 Admin: Deleting customer', { customerId });
    
    const customerIndex = customers.findIndex(customer => customer.id === customerId);
    if (customerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    const deletedCustomer = customers.splice(customerIndex, 1)[0];
    
    log.info('✅ Admin: Customer deleted successfully', { customerId });
    
    return NextResponse.json({
      success: true,
      data: deletedCustomer,
      message: 'Customer deleted successfully'
    });
    
  } catch (error) {
    log.error('❌ Admin: Error deleting customer', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
