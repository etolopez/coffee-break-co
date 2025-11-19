import { NextRequest, NextResponse } from 'next/server';

// Simple logging for admin operations
const log = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || '')
};

// Mock database - replace with real database in production
let subscriptionPlans = [
  {
    id: '1',
    name: 'Free Plan',
    tier: 'free',
    price: 0,
    billingCycle: 'monthly',
    features: [
      '1 coffee upload per month',
      'Basic profile',
      'View all coffees',
      'Email support'
    ],
    maxCoffees: 1,
    analyticsAccess: 'none',
    supportLevel: 'community',
    isActive: true,
    description: 'Perfect for coffee enthusiasts just getting started',
    setupFee: 0,
    trialDays: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01'
  },
  {
    id: '2',
    name: 'Basic Plan',
    tier: 'basic',
    price: 29.99,
    billingCycle: 'monthly',
    features: [
      'Up to 10 coffee uploads',
      'Basic analytics dashboard',
      'Seller profile customization',
      'Email support',
      'Standard branding'
    ],
    maxCoffees: 10,
    analyticsAccess: 'basic',
    supportLevel: 'email',
    isActive: true,
    description: 'Ideal for small coffee businesses and individual roasters',
    setupFee: 0,
    trialDays: 14,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01'
  },
  {
    id: '3',
    name: 'Premium Plan',
    tier: 'premium',
    price: 79.99,
    billingCycle: 'monthly',
    features: [
      'Up to 50 coffee uploads',
      'Advanced analytics & insights',
      'Priority support',
      'Custom branding',
      'API access',
      'Advanced reporting',
      'Customer insights'
    ],
    maxCoffees: 50,
    analyticsAccess: 'advanced',
    supportLevel: 'priority',
    isActive: true,
    description: 'For growing coffee businesses with multiple offerings',
    setupFee: 99,
    trialDays: 30,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01'
  },
  {
    id: '4',
    name: 'Enterprise Plan',
    tier: 'enterprise',
    price: 199.99,
    billingCycle: 'monthly',
    features: [
      'Unlimited coffee uploads',
      'Full analytics suite',
      '24/7 dedicated support',
      'Custom integrations',
      'White-label options',
      'Advanced security',
      'Custom contracts',
      'Dedicated account manager',
      'Multi-location support'
    ],
    maxCoffees: -1,
    analyticsAccess: 'full',
    supportLevel: 'dedicated',
    isActive: true,
    description: 'For large coffee businesses requiring enterprise-level features',
    setupFee: 299,
    trialDays: 45,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01'
  }
];

/**
 * GET /api/admin/subscriptions
 * Retrieve all subscription plans
 */
export async function GET(request: NextRequest) {
  try {
    log.info('🔍 Admin: Fetching subscription plans');
    
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const status = searchParams.get('status');
    
    let filteredPlans = [...subscriptionPlans];
    
    // Filter by tier
    if (tier && tier !== 'all') {
      filteredPlans = filteredPlans.filter(plan => plan.tier === tier);
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        filteredPlans = filteredPlans.filter(plan => plan.isActive);
      } else if (status === 'inactive') {
        filteredPlans = filteredPlans.filter(plan => !plan.isActive);
      }
    }
    
    log.info(`✅ Admin: Retrieved ${filteredPlans.length} subscription plans`);
    
    return NextResponse.json({
      success: true,
      data: filteredPlans,
      total: filteredPlans.length
    });
    
  } catch (error) {
    log.error('❌ Admin: Error fetching subscription plans', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/subscriptions
 * Create a new subscription plan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    log.info('🔍 Admin: Creating new subscription plan', { name: body.name });
    
    // Validate required fields
    if (!body.name || !body.tier || !body.price) {
      return NextResponse.json(
        { success: false, error: 'Name, tier, and price are required' },
        { status: 400 }
      );
    }
    
    // Check if plan already exists
    if (subscriptionPlans.find(plan => plan.name === body.name)) {
      return NextResponse.json(
        { success: false, error: 'Subscription plan with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create new subscription plan
    const newPlan = {
      id: Date.now().toString(),
      name: body.name,
      tier: body.tier,
      price: parseFloat(body.price),
      billingCycle: body.billingCycle || 'monthly',
      features: body.features || ['Basic features'],
      maxCoffees: body.maxCoffees || 10,
      analyticsAccess: body.analyticsAccess || 'none',
      supportLevel: body.supportLevel || 'community',
      isActive: body.isActive !== undefined ? body.isActive : true,
      description: body.description || `Subscription plan for ${body.tier} tier`,
      setupFee: body.setupFee || 0,
      trialDays: body.trialDays || 14,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    subscriptionPlans.push(newPlan);
    
    log.info('✅ Admin: Subscription plan created successfully', { planId: newPlan.id });
    
    return NextResponse.json({
      success: true,
      data: newPlan,
      message: 'Subscription plan created successfully'
    }, { status: 201 });
    
  } catch (error) {
    log.error('❌ Admin: Error creating subscription plan', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/subscriptions
 * Update an existing subscription plan
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    log.info('🔍 Admin: Updating subscription plan', { planId: body.id });
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Plan ID is required' },
        { status: 400 }
      );
    }
    
    const planIndex = subscriptionPlans.findIndex(plan => plan.id === body.id);
    if (planIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription plan not found' },
        { status: 404 }
      );
    }
    
    // Update plan fields
    subscriptionPlans[planIndex] = {
      ...subscriptionPlans[planIndex],
      ...body,
      id: body.id, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    log.info('✅ Admin: Subscription plan updated successfully', { planId: body.id });
    
    return NextResponse.json({
      success: true,
      data: subscriptionPlans[planIndex],
      message: 'Subscription plan updated successfully'
    });
    
  } catch (error) {
    log.error('❌ Admin: Error updating subscription plan', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription plan' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/subscriptions
 * Delete a subscription plan
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('id');
    
    if (!planId) {
      return NextResponse.json(
        { success: false, error: 'Plan ID is required' },
        { status: 400 }
      );
    }
    
    log.info('🔍 Admin: Deleting subscription plan', { planId });
    
    const planIndex = subscriptionPlans.findIndex(plan => plan.id === planId);
    if (planIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscription plan not found' },
        { status: 404 }
      );
    }
    
    // Check if plan is active (prevent deleting active plans)
    if (subscriptionPlans[planIndex].isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete active subscription plans. Deactivate first.' },
        { status: 400 }
      );
    }
    
    const deletedPlan = subscriptionPlans.splice(planIndex, 1)[0];
    
    log.info('✅ Admin: Subscription plan deleted successfully', { planId });
    
    return NextResponse.json({
      success: true,
      data: deletedPlan,
      message: 'Subscription plan deleted successfully'
    });
    
  } catch (error) {
    log.error('❌ Admin: Error deleting subscription plan', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscription plan' },
      { status: 500 }
    );
  }
}
