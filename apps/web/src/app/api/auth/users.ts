// Shared user storage for authentication system
// In production, this would be a database

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'seller' | 'customer';
  companyName?: string;
  sellerId?: string;
  uniqueSlug?: string; // Unique identifier for user-specific data
  subscriptionTier?: string;
  subscriptionStatus?: string;
  createdAt: string;
}

// Initialize with demo users - now with unique IDs and slugs
export let users: User[] = [
  {
    id: 'admin-001',
    email: 'admin@coffeebreak.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Admin User',
    role: 'admin',
    companyName: 'Coffee Break Co',
    uniqueSlug: 'admin-user-001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seller-001',
    email: 'seller@coffeebreak.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Free Tier Seller',
    role: 'seller',
    companyName: 'Free Tier Seller',
    sellerId: 'seller-001',
    uniqueSlug: 'free-tier-seller-001',
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seller-002',
    email: 'seller@premiumcoffee.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Premium Coffee Co',
    role: 'seller',
    companyName: 'Premium Coffee Co',
    sellerId: 'seller-002',
    uniqueSlug: 'premium-coffee-co-002',
    subscriptionTier: 'basic',
    subscriptionStatus: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seller-003',
    email: 'seller@mountainview.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Mountain View Roasters',
    role: 'seller',
    companyName: 'Mountain View Roasters',
    sellerId: 'seller-003',
    uniqueSlug: 'mountain-view-roasters-003',
    subscriptionTier: 'basic',
    subscriptionStatus: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'customer-001',
    email: 'customer@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Demo Customer',
    role: 'customer',
    uniqueSlug: 'demo-customer-001',
    createdAt: new Date().toISOString()
  },
  // New test user for complete seller journey testing
  {
    id: 'test-seller-001',
    email: 'testseller@coffeebreak.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'TestPass123!'
    name: 'Test Seller User',
    role: 'seller', // Now upgraded to seller
    companyName: 'Test Coffee Company',
    sellerId: 'test-seller-001',
    uniqueSlug: 'test-seller-user-001',
    subscriptionTier: 'premium', // Upgraded to premium tier
    subscriptionStatus: 'active',
    createdAt: new Date().toISOString()
  }
];

// Helper functions
export const addUser = (user: User) => {
  // Generate unique ID if not provided
  if (!user.id) {
    user.id = `${user.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Generate unique slug if not provided
  if (!user.uniqueSlug) {
    const baseSlug = user.name || user.email.split('@')[0];
    user.uniqueSlug = `${baseSlug.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
  }
  
  users.push(user);
  console.log('✅ User added:', user.email, 'Total users:', users.length);
};

export const findUserByEmail = (email: string) => {
  return users.find(u => u.email === email);
};

export const getAllUsers = () => {
  return users.map(({ password, ...user }) => user); // Return users without passwords
};

export const getUserCount = () => users.length;
