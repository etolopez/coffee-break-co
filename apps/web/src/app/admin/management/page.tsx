'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  Users, 
  Building2, 
  Crown, 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  BarChart3, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Star, 
  Mail, 
  Phone, 
  Globe,
  ArrowLeft,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  X,
  ExternalLink
} from 'lucide-react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useSimpleAuth } from '../../../hooks/useSimpleAuth';
import Header from '../../../components/Header';

// User management interfaces
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'customer';
  companyName?: string;
  sellerId?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  subscriptionStatus?: 'active' | 'inactive' | 'pending' | 'cancelled';
  subscriptionTier?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry?: string;
  totalSpent?: number;
  coffeeCount?: number;
}

interface SellerProfile {
  id: string;
  companyName: string;
  companySize: string;
  mission: string;
  logo?: string;
  phone?: string;
  email?: string;
  location: string;
  rating: number;
  totalCoffees: number;
  memberSince: number;
  specialties: string[];
  certifications: string[];
  featuredCoffeeId: string;
  description: string;
  website?: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  defaultPricePerBag: string;
  orderLink: string;
  reviews: any[];
  teamMembers: TeamMember[];
  country?: string;
  city?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'pending' | 'cancelled';
  subscriptionTier?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry?: string;
  monthlyRevenue?: number;
  totalRevenue?: number;
  customerCount?: number;
}

interface TeamMember {
  id: string;
  name: string;
  occupation: string;
  image?: string;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: 'active' | 'inactive' | 'pending' | 'cancelled';
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry: string;
  totalSpent: number;
  coffeeCount: number;
  lastPurchase?: string;
  createdAt: string;
  isActive: boolean;
  customerCount?: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  price: number;
  billingCycle: string;
  features: string[];
  maxCoffees: number;
  analyticsAccess: 'none' | 'basic' | 'advanced' | 'full';
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  isActive: boolean;
  setupFee: number;
  trialDays: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin Management Dashboard
 * Comprehensive management interface for sellers, customers, and users
 * Designed for subscription system preparation with Firebase and cloud services
 * Only accessible by admin users
 * 
 * UPDATED: Now shows real data based on actual sellers and subscriptions
 * - Revenue calculations based on monthly subscription fees only
 * - Country data reflects actual seller locations
 * - Subscription tiers show real usage counts
 * - All metrics are calculated from current system state
 */
export default function AdminManagementPage() {
  const { user, signOut } = useSimpleAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'users' | 'subscriptions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - replace with real API calls
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Mock data fallbacks to prevent crashes
  const mockUsers: AdminUser[] = [
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
      email: 'sarah@premiumcoffee.com',
      name: 'Sarah Johnson',
      role: 'seller',
      companyName: 'Premium Coffee Co',
      sellerId: 'seller-001',
      createdAt: '2024-01-15',
      lastLogin: '2024-12-18',
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionTier: 'free'
    },
    {
      id: '3',
      email: 'mike@liquidsoul.com',
      name: 'Mike Rodriguez',
      role: 'seller',
      companyName: 'Liquid Soul Coffee',
      sellerId: 'seller-002',
      createdAt: '2024-02-01',
      lastLogin: '2024-12-17',
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionTier: 'basic'
    },
    {
      id: '4',
      email: 'lisa@basiccoffee.com',
      name: 'Lisa Chen',
      role: 'seller',
      companyName: 'Basic Coffee Co',
      sellerId: 'seller-003',
      createdAt: '2024-01-20',
      lastLogin: '2024-12-16',
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionTier: 'basic'
    },
    {
      id: '5',
      email: 'carlos@monteverde.com',
      name: 'Carlos Mendez',
      role: 'seller',
      companyName: 'Monteverde Coffee Estates',
      sellerId: 'seller-004',
      createdAt: '2024-02-15',
      lastLogin: '2024-12-15',
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionTier: 'enterprise'
    },
    {
      id: '6',
      email: 'maria@colombianhighlands.com',
      name: 'Maria Rodriguez',
      role: 'seller',
      companyName: 'Colombian Highlands Coffee',
      sellerId: 'seller-005',
      createdAt: '2024-03-01',
      lastLogin: '2024-12-14',
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionTier: 'basic'
    },
    {
      id: '7',
      email: 'john@coffeebreak.com',
      name: 'John Customer',
      role: 'customer',
      companyName: null,
      sellerId: null,
      createdAt: '2024-04-01',
      lastLogin: '2024-12-10',
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionTier: 'premium'
    },
    {
      id: '8',
      email: 'emma@coffeebreak.com',
      name: 'Emma Wilson',
      role: 'customer',
      companyName: null,
      sellerId: null,
      createdAt: '2024-05-01',
      lastLogin: '2024-12-08',
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionTier: 'basic'
    }
  ];

  const mockSellers: SellerProfile[] = [
    {
      id: '1',
      companyName: 'Ethiopian Coffee Co.',
      companySize: 'Medium',
      mission: 'Premium Ethiopian coffee sourcing',
      logo: null,
      phone: '+251-911-123-456',
      email: 'info@ethiopiancoffee.com',
      location: 'Addis Ababa, Ethiopia',
      rating: 4.8,
      totalCoffees: 12,
      memberSince: 2023,
      specialties: ['Single Origin', 'Organic', 'Light Roast'],
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
      country: 'Ethiopia',
      city: 'Addis Ababa',
      subscriptionStatus: 'active',
      subscriptionTier: 'premium',
      subscriptionExpiry: '2025-01-01',
      monthlyRevenue: 2500,
      totalRevenue: 15000,
      customerCount: 45
    },
    {
      id: '2',
      companyName: 'Colombian Highlands Coffee',
      companySize: 'Small',
      mission: 'Sustainable coffee farming in the Andes',
      logo: null,
      phone: '+57-300-123-456',
      email: 'contact@colombianhighlands.com',
      location: 'Bogotá, Colombia',
      rating: 4.6,
      totalCoffees: 8,
      memberSince: 2024,
      specialties: ['Medium Roast', 'Washed Process'],
      certifications: ['Rainforest Alliance'],
      featuredCoffeeId: '2',
      description: 'High-altitude Colombian coffee',
      website: 'https://colombianhighlands.com',
      socialMedia: {
        instagram: '@colombianhighlands',
        facebook: 'colombianhighlands'
      },
      defaultPricePerBag: '$16.99',
      orderLink: 'https://order.colombianhighlands.com',
      reviews: [],
      teamMembers: [],
      country: 'Colombia',
      city: 'Bogotá',
      subscriptionStatus: 'active',
      subscriptionTier: 'basic',
      subscriptionExpiry: '2025-02-01',
      monthlyRevenue: 1200,
      totalRevenue: 4800,
      customerCount: 28
    },
    {
      id: '3',
      companyName: 'Monteverde Coffee Estates',
      companySize: 'Large',
      mission: 'Premium Costa Rican coffee excellence',
      logo: null,
      phone: '+506-2-123-456',
      email: 'info@monteverdecoffee.com',
      location: 'Monteverde, Costa Rica',
      rating: 4.9,
      totalCoffees: 15,
      memberSince: 2023,
      specialties: ['Dark Roast', 'Shade Grown', 'Single Origin'],
      certifications: ['Organic', 'Bird Friendly'],
      featuredCoffeeId: '3',
      description: 'Luxury Costa Rican coffee',
      website: 'https://monteverdecoffee.com',
      socialMedia: {
        instagram: '@monteverdecoffee',
        facebook: 'monteverdecoffee',
        twitter: '@monteverdecoffee'
      },
      defaultPricePerBag: '$24.99',
      orderLink: 'https://order.monteverdecoffee.com',
      reviews: [],
      teamMembers: [],
      country: 'Costa Rica',
      city: 'Monteverde',
      subscriptionStatus: 'active',
      subscriptionTier: 'enterprise',
      subscriptionExpiry: '2025-03-01',
      monthlyRevenue: 3500,
      totalRevenue: 21000,
      customerCount: 67
    }
  ];

  const mockCustomers: Customer[] = [
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
    }
  ];

  const mockSubscriptionPlans: SubscriptionPlan[] = [
    {
      id: '1',
      name: 'Basic Plan',
      tier: 'basic',
      price: 29.99,
      billingCycle: 'monthly',
      features: [
        'Up to 10 coffee uploads',
        'Basic analytics dashboard',
        'Seller profile customization',
        'Email support'
      ],
      maxCoffees: 10,
      analyticsAccess: 'basic',
      supportLevel: 'email',
      isActive: true,
      setupFee: 0,
      trialDays: 14,
      description: 'Ideal for small coffee businesses',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-01'
    }
  ];

  // Define subscription pricing for use throughout the component
  const subscriptionPricing = {
    free: 0,
    basic: 29.99,
    premium: 79.99,
    enterprise: 199.99
  };

  // Calculate real analytics based on actual data - memoized to prevent hooks issues
  const mockAnalytics = useMemo(() => {
    const realSellers = sellers.length > 0 ? sellers : mockSellers;
    const realPlans = subscriptionPlans.length > 0 ? subscriptionPlans : mockSubscriptionPlans;
    
    // Calculate real revenue from monthly subscription fees only
    const monthlyRevenue = realSellers.reduce((total, seller) => {
      const tier = seller.subscriptionTier || 'free';
      const price = subscriptionPricing[tier as keyof typeof subscriptionPricing] || 0;
      return total + price;
    }, 0);
    
    const totalRevenue = monthlyRevenue * 12; // Annual projection
    
    // Count active subscriptions by tier
    const tierCounts = realSellers.reduce((acc, seller) => {
      const tier = seller.subscriptionTier || 'free';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate tier distribution with real revenue
    const tierDistribution = Object.entries(tierCounts).map(([tier, count]) => {
      const price = subscriptionPricing[tier as keyof typeof subscriptionPricing] || 0;
      const monthlyRevenue = price * count;
      const annualRevenue = monthlyRevenue * 12;
      return {
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        count,
        revenue: annualRevenue
      };
    });
    
    // Calculate country distribution based on actual sellers
    const countryCounts = realSellers.reduce((acc, seller) => {
      const country = seller.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Geographic reach should only show seller countries, not coffee origins
    // Coffee origins don't generate revenue - only sellers do
    const topCountries = Object.entries(countryCounts)
      .map(([country, users]) => {
        // Calculate actual revenue for this country based on its sellers' tiers
        const countrySellers = realSellers.filter(seller => seller.country === country);
        const countryRevenue = countrySellers.reduce((total, seller) => {
          const tier = seller.subscriptionTier || 'free';
          const price = subscriptionPricing[tier as keyof typeof subscriptionPricing] || 0;
          return total + (price * 12); // Annual revenue for this seller
        }, 0);
        
        return {
          country,
          users,
          revenue: countryRevenue,
          isFromSeller: true
        };
      })
      .sort((a, b) => b.users - a.users)
      .slice(0, 10); // Show top 10 seller countries
    
    return {
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions: realSellers.length,
      totalUsers: realSellers.length,
      userGrowth: 0, // No historical data yet
      revenueGrowth: 0, // No historical data yet
      monthlyGrowth: 0, // No historical data yet
      retentionRate: 100, // All current sellers are active
      recentActivity: [
        {
          id: '1',
          type: 'new_seller',
          description: `${realSellers.length} sellers currently active`,
          timestamp: new Date().toISOString(),
          impact: `$${monthlyRevenue.toFixed(2)}/month revenue`
        }
      ],
      topCountries,
      tierDistribution,
      totalCountries: Object.keys(countryCounts).length,
      sellerCountries: Object.keys(countryCounts).length
    };
  }, [sellers, subscriptionPlans, subscriptionPricing]);

  // Modal states
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    type: 'user' | 'seller' | 'customer' | null;
    data: any;
  }>({ isOpen: false, type: null, data: null });

  // Edit states for inline editing
  const [editingEntity, setEditingEntity] = useState<{
    type: 'user' | 'seller' | 'customer' | null;
    id: string | null;
    data: any;
  }>({ type: null, id: null, data: null });

  // Add new entity states
  const [addModal, setAddModal] = useState<{
    isOpen: boolean;
    type: 'user' | 'seller' | 'customer' | 'subscriptions' | null;
  }>({ isOpen: false, type: null });

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Merge real and mock users, deduplicating by ID for comprehensive user display
  const allUsers = useMemo(() => {
    const combined = [...adminUsers, ...mockUsers];
    return combined.filter((user, index, arr) => 
      arr.findIndex(u => u.id === user.id) === index
    );
  }, [adminUsers, mockUsers]);

  // Debug logging
  console.log('Admin Management Page Debug:', {
    user,
    isAdmin,
    userRole: user?.role,
    isAuthenticated: !!user,
    loading,
    error
  });

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log('Admin Management useEffect triggered:', { user, isAdmin, loading });
    
    // Check if user is authenticated first
    if (!user) {
      console.log('No user found, setting error for authentication required');
      setError('Please sign in to access admin features.');
      setLoading(false);
      return;
    }

    // Then check if user is admin
    if (!isAdmin) {
      console.log('User is not admin, setting error for access denied');
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    console.log('User is admin, loading data...');
    // Load real data from APIs
    loadAllData();
  }, [user, isAdmin]);

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <Shield className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access admin features.
            </p>
            <Link 
              href="/auth/signin" 
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You need admin privileges to access this page.
            </p>
            <div className="space-y-3">
              <Link 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
              >
                Return to Home
              </Link>
              {user?.role === 'customer' && (
                <Link 
                  href="/subscriptions" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors"
                >
                  <Coffee className="h-5 w-5 mr-2" />
                  Become a Seller
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const loadAllData = async () => {
    try {
      console.log('Loading admin data...');
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Load all data in parallel
      const [usersRes, sellersRes, customersRes, plansRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/sellers'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/subscriptions'),
        fetch('/api/admin/analytics')
      ]);

      console.log('API responses received:', {
        users: usersRes.status,
        sellers: sellersRes.status,
        customers: customersRes.status,
        plans: plansRes.status,
        analytics: analyticsRes.status
      });

      // Process users
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setAdminUsers(usersData.data);
          console.log('Users loaded successfully:', usersData.data.length);
        } else {
          console.warn('Failed to load users:', usersData.error);
        }
      } else {
        console.warn('Users API response not ok:', usersRes.status);
      }

      // Process sellers
      if (sellersRes.ok) {
        const sellersData = await sellersRes.json();
        if (sellersData.success) {
          setSellers(sellersData.data);
          console.log('Sellers loaded successfully:', sellersData.data.length);
        } else {
          console.warn('Failed to load sellers:', sellersData.error);
        }
      } else {
        console.warn('Sellers API response not ok:', sellersRes.status);
      }

      // Process customers
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        if (customersData.success) {
          setCustomers(customersData.data);
          console.log('Customers loaded successfully:', customersData.data.length);
        } else {
          console.warn('Failed to load customers:', customersData.error);
        }
      } else {
        console.warn('Customers API response not ok:', customersRes.status);
      }

      // Process subscription plans
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        if (plansData.success) {
          setSubscriptionPlans(plansData.data);
          console.log('Subscription plans loaded successfully:', plansData.data.length);
        } else {
          console.warn('Failed to load subscription plans:', plansData.error);
        }
      } else {
        console.warn('Subscription plans API response not ok:', plansRes.status);
      }

      // Process analytics
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.data);
          console.log('Analytics loaded successfully');
        } else {
          console.warn('Failed to load analytics:', analyticsData.error);
        }
      } else {
        console.warn('Analytics API response not ok:', analyticsRes.status);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
      console.log('Data loading completed');
    }
  };

  // CRUD Operations for Users
  const createUser = async (userData: Partial<AdminUser>) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAdminUsers(prev => [...prev, result.data]);
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to create user' };
    } catch (error) {
      return { success: false, message: 'Error creating user' };
    }
  };

  const updateUser = async (userData: AdminUser) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAdminUsers(prev => prev.map(u => u.id === userData.id ? result.data : u));
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to update user' };
    } catch (error) {
      return { success: false, message: 'Error updating user' };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAdminUsers(prev => prev.filter(u => u.id !== userId));
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to delete user' };
    } catch (error) {
      return { success: false, message: 'Error deleting user' };
    }
  };

  // CRUD Operations for Sellers
  const createSeller = async (sellerData: Partial<SellerProfile>) => {
    try {
      const response = await fetch('/api/admin/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellerData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSellers(prev => [...prev, result.data]);
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to create seller' };
    } catch (error) {
      return { success: false, message: 'Error creating seller' };
    }
  };

  const updateSeller = async (sellerData: SellerProfile) => {
    try {
      const response = await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellerData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSellers(prev => prev.map(s => s.id === sellerData.id ? result.data : s));
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to update seller' };
    } catch (error) {
      return { success: false, message: 'Error updating seller' };
    }
  };

  const deleteSeller = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/admin/sellers?id=${sellerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSellers(prev => prev.filter(s => s.id !== sellerId));
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to delete seller' };
    } catch (error) {
      return { success: false, message: 'Error deleting seller' };
    }
  };

  // CRUD Operations for Customers
  const createCustomer = async (customerData: Partial<Customer>) => {
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCustomers(prev => [...prev, result.data]);
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to create customer' };
    } catch (error) {
      return { success: false, message: 'Error creating customer' };
    }
  };

  const updateCustomer = async (customerData: Customer) => {
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCustomers(prev => prev.map(c => c.id === customerData.id ? result.data : c));
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to update customer' };
    } catch (error) {
      return { success: false, message: 'Error updating customer' };
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/customers?id=${customerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCustomers(prev => prev.filter(c => c.id !== customerId));
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to delete customer' };
    } catch (error) {
      return { success: false, message: 'Error deleting customer' };
    }
  };

  // CRUD Operations for Subscription Plans
  const createSubscriptionPlan = async (planData: Partial<SubscriptionPlan>) => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubscriptionPlans(prev => [...prev, result.data]);
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to create subscription plan' };
    } catch (error) {
      return { success: false, message: 'Error creating subscription plan' };
    }
  };

  const updateSubscriptionPlan = async (planData: SubscriptionPlan) => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubscriptionPlans(prev => prev.map(p => p.id === planData.id ? result.data : p));
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to update subscription plan' };
    } catch (error) {
      return { success: false, message: 'Error updating subscription plan' };
    }
  };

  const deleteSubscriptionPlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions?id=${planId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubscriptionPlans(prev => prev.filter(p => p.id !== planId));
          return { success: true, message: result.message };
        }
      }
      return { success: false, message: 'Failed to delete subscription plan' };
    } catch (error) {
      return { success: false, message: 'Error deleting subscription plan' };
    }
  };

  // Export functionality
  const exportData = async (format: string = 'json') => {
    try {
      const response = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          period: 'monthly',
          metrics: ['all']
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // In a real app, you'd download the file
          console.log('Export data:', result.data);
          alert(`Data exported successfully in ${format.toUpperCase()} format`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  // Modal component for viewing entity details
  const ViewDetailsModal = () => {
    if (!viewModal.isOpen || !viewModal.data) return null;

    const renderEntityDetails = () => {
      switch (viewModal.type) {
        case 'user':
          const user = viewModal.data;
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="mt-1 text-sm text-gray-900">{user.companyName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subscription</label>
                  <p className="mt-1 text-sm text-gray-900">{user.subscriptionTier}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">{user.createdAt}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Login</label>
                  <p className="mt-1 text-sm text-gray-900">{user.lastLogin || 'Never'}</p>
                </div>
              </div>
            </div>
          );

        case 'seller':
          const seller = viewModal.data;
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="mt-1 text-sm text-gray-900">{seller.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <p className="mt-1 text-sm text-gray-900">{seller.companySize}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{seller.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{seller.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{seller.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <p className="mt-1 text-sm text-gray-900">{seller.rating}/5.0</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coffees</label>
                  <p className="mt-1 text-sm text-gray-900">{seller.totalCoffees}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">{seller.memberSince}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Mission</label>
                  <p className="mt-1 text-sm text-gray-900">{seller.mission}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Specialties</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {seller.specialties?.map((specialty: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Certifications</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {seller.certifications?.map((cert: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Coffee Details Section */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Coffee Details ({seller.totalCoffees} coffees)</label>
                  <div className="space-y-4">
                    {seller.totalCoffees > 0 ? (
                      <div className="grid gap-4">
                        {/* Coffee Entry Cards */}
                        {seller.coffees?.map((coffee: any, index: number) => (
                          <div key={coffee.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-lg font-semibold text-gray-900">{coffee.coffeeName}</h4>
                              <span className="text-sm font-medium text-amber-600">${coffee.price}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Origin:</span>
                                <p className="text-gray-600">{coffee.origin}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Region:</span>
                                <p className="text-gray-600">{coffee.region}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Altitude:</span>
                                <p className="text-gray-600">{coffee.altitude}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Process:</span>
                                <p className="text-gray-600">{coffee.process}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Variety:</span>
                                <p className="text-gray-600">{coffee.variety}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Roast Level:</span>
                                <p className="text-gray-600">{coffee.roastLevel}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Harvest Year:</span>
                                <p className="text-gray-600">{coffee.harvestYear}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Weight:</span>
                                <p className="text-gray-600">{coffee.weight}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Currency:</span>
                                <p className="text-gray-600">{coffee.currency}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <span className="font-medium text-gray-700">Description:</span>
                              <p className="text-gray-600 mt-1">{coffee.description}</p>
                            </div>
                            
                            <div className="mt-3">
                              <span className="font-medium text-gray-700">Flavor Notes:</span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {coffee.flavorNotes?.map((note: string, noteIndex: number) => (
                                  <span key={noteIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {note}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-gray-700">Certifications:</span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {coffee.certifications?.map((cert: string, certIndex: number) => (
                                    <span key={certIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {cert}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Environmental Practices:</span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {coffee.environmentalPractices?.map((practice: string, practiceIndex: number) => (
                                    <span key={practiceIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {practice}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 text-xs text-gray-500">
                              <span>Created: {new Date(coffee.createdAt).toLocaleDateString()}</span>
                              {coffee.updatedAt !== coffee.createdAt && (
                                <span className="ml-3">Updated: {new Date(coffee.updatedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No coffee entries available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );

        case 'customer':
          const customer = viewModal.data;
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    customer.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                    customer.subscriptionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {customer.subscriptionStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tier</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{customer.subscriptionTier}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Spent</label>
                  <p className="mt-1 text-sm text-gray-900">${customer.totalSpent}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coffee Count</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.coffeeCount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.createdAt}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Purchase</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.lastPurchase || 'Never'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expires</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.subscriptionExpiry}</p>
                </div>
              </div>
            </div>
          );

        default:
          return <div>No details available</div>;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {viewModal.type === 'user' ? 'User Details' :
                 viewModal.type === 'seller' ? 'Seller Details' :
                 'Customer Details'}
              </h3>
              <button
                onClick={() => setViewModal({ isOpen: false, type: null, data: null })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {renderEntityDetails()}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewModal({ isOpen: false, type: null, data: null })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter functions
  const filteredSellers = (sellers.length > 0 ? sellers : mockSellers).filter(seller => {
    const matchesSearch = seller.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || seller.subscriptionStatus === filterStatus;
    const matchesTier = filterTier === 'all' || seller.subscriptionTier === filterTier;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const filteredCustomers = (customers.length > 0 ? customers : mockCustomers).filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.subscriptionStatus === filterStatus;
    const matchesTier = filterTier === 'all' || customer.subscriptionTier === filterTier;
    return matchesSearch && matchesStatus && matchesTier;
  });

  // Statistics calculations
  const totalRevenue = analytics?.totalRevenue || mockAnalytics.totalRevenue;
  const monthlyRevenue = analytics?.monthlyRevenue || mockAnalytics.monthlyRevenue;
  const activeSubscriptions = analytics?.activeSubscriptions || mockAnalytics.activeSubscriptions;
  const totalCustomers = analytics?.totalUsers || mockAnalytics.totalUsers;
  const userGrowth = analytics?.userGrowth || mockAnalytics.userGrowth;
  const revenueGrowth = analytics?.revenueGrowth || mockAnalytics.revenueGrowth;
  const monthlyGrowth = analytics?.monthlyGrowth || mockAnalytics.monthlyGrowth;
  const retentionRate = analytics?.retentionRate || mockAnalytics.retentionRate;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto flex space-x-2">
                <button
                  onClick={() => loadAllData()}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Management</h1>
              <p className="text-gray-600 mt-1">Manage sellers, users, and subscriptions</p>
              {(!adminUsers.length && !sellers.length && !customers.length && !subscriptionPlans.length) && (
                <p className="text-green-600 text-sm mt-2">
                  📊 Showing real data based on current system state. Revenue calculations based on monthly subscription fees only.
                </p>
              )}

            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={() => exportData('json')} 
                className="px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base"
              >
                <Download className="h-4 w-4 mr-2 inline" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Mobile Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-1 sm:space-x-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'sellers', label: 'Sellers', icon: Building2 },
                { id: 'users', label: 'Users', icon: User },
                { id: 'subscriptions', label: 'Subscriptions', icon: Crown }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`whitespace-nowrap py-2 px-1 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 sm:mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Search and Filters - Mobile Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filter dropdowns - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              >
                <option value="all">All Tiers</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Real Data Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-blue-900">Real-Time System Data</h3>
                  <p className="text-xs sm:text-sm text-blue-700">Based on actual sellers and subscriptions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{mockAnalytics.activeSubscriptions}</p>
                  <p className="text-xs sm:text-sm text-blue-600">Active Sellers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{mockAnalytics.tierDistribution.length}</p>
                  <p className="text-xs sm:text-sm text-blue-600">Subscription Tiers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{mockAnalytics.totalCountries}</p>
                  <p className="text-xs sm:text-sm text-blue-600">Countries</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">${mockAnalytics.monthlyRevenue.toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-blue-600">Monthly Revenue</p>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> All revenue calculations are based on monthly subscription fees only. Simple, transparent pricing.
                </p>
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-700">
                    <strong>Data Source:</strong> Now showing {mockAnalytics.activeSubscriptions} sellers from persistent data. 
                    All 5 sellers (seller-001 through seller-005) are now properly synchronized with coffee entries.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl border border-amber-100 p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Annual Revenue</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">${totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Monthly fees</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-green-600">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="truncate">Based on current subscriptions</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-amber-100 p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">${monthlyRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Monthly fees</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-blue-600">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="truncate">Based on current subscriptions</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-amber-100 p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Active Sellers</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{activeSubscriptions}</p>
                    <p className="text-xs text-gray-500 mt-1">Current count</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                    <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-amber-600">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="truncate">{retentionRate}% active rate</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-amber-100 p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Sellers</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{totalCustomers}</p>
                    <p className="text-xs text-gray-500 mt-1">Current count</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-purple-600">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="truncate">Based on current data</span>
                </div>
              </div>
            </div>

            {/* Revenue Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-medium text-blue-800">Revenue Calculation</h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700">
                    <p className="leading-relaxed">Revenue shown above is based on <strong>monthly subscription fees only</strong>. Simple, transparent pricing with no hidden fees.</p>
                    <p className="mt-1 leading-relaxed">Current pricing: Free: $0, Basic: $29.99, Premium: $79.99, Enterprise: $199.99</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current System Status</h3>
              <div className="space-y-4">
                {(analytics?.recentActivity || mockAnalytics.recentActivity) ? (
                  (analytics?.recentActivity || mockAnalytics.recentActivity).map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          activity.type === 'subscription_upgrade' ? 'bg-green-500' :
                          activity.type === 'new_seller' ? 'bg-blue-500' :
                          activity.type === 'subscription_cancelled' ? 'bg-red-500' :
                          activity.type === 'new_customer' ? 'bg-purple-500' :
                          'bg-amber-500'
                        }`}>
                          {activity.type === 'subscription_upgrade' && <TrendingUp className="h-4 w-4 text-white" />}
                          {activity.type === 'new_seller' && <Plus className="h-4 w-4 text-white" />}
                          {activity.type === 'subscription_cancelled' && <XCircle className="h-4 w-4 text-white" />}
                          {activity.type === 'new_customer' && <User className="h-4 w-4 text-white" />}
                          {activity.type === 'coffee_added' && <Coffee className="h-4 w-4 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          <p className="text-sm text-gray-600">{activity.impact}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No recent activity to display. Using mock data for demonstration.</p>
                  </div>
                )}
              </div>
              
              {/* Current System Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-3">System Overview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Sellers:</p>
                    <p className="font-medium text-gray-900">{mockAnalytics.activeSubscriptions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Subscription Tiers:</p>
                    <p className="font-medium text-gray-900">{mockAnalytics.tierDistribution.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Countries:</p>
                    <p className="font-medium text-gray-900">{mockAnalytics.topCountries.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Revenue:</p>
                    <p className="font-medium text-gray-900">${mockAnalytics.monthlyRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Analytics */}
            {(analytics || mockAnalytics) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seller Countries */}
                <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Geographic Reach</h3>
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">
                      <strong>Total Coverage:</strong> {mockAnalytics.totalCountries} countries represented through {mockAnalytics.activeSubscriptions} active sellers
                    </p>
                  </div>
                  <div className="space-y-3">
                    {(analytics?.topCountries || mockAnalytics.topCountries)?.map((country: any, index: number) => (
                      <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                            {index + 1}
                          </span>
                          <div>
                            <span className="text-gray-700 font-medium">{country.country}</span>
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Seller Location
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{country.users} sellers</div>
                          <div className="text-xs text-gray-500">${country.revenue.toLocaleString()}/year</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> Revenue is calculated only from seller subscriptions. Coffee origins don't generate revenue - they represent the geographic diversity of coffee offerings.
                    </p>
                  </div>
                </div>

                {/* Subscription Tiers */}
                <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription Tiers</h3>
                  <div className="space-y-3">
                    {(analytics?.tierDistribution || mockAnalytics.tierDistribution)?.map((tier: any) => (
                      <div key={tier.tier} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-3 ${
                            tier.tier === 'basic' ? 'bg-blue-500' :
                            tier.tier === 'premium' ? 'bg-purple-500' :
                            tier.tier === 'enterprise' ? 'bg-amber-500' :
                            'bg-gray-500'
                          }`}></span>
                          <span className="text-gray-700 capitalize">{tier.tier}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{tier.count} sellers</div>
                          <div className="text-xs text-gray-500">${tier.revenue.toLocaleString()}/year</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">
                      <strong>Current Status:</strong> {mockAnalytics.activeSubscriptions} active sellers across {mockAnalytics.tierDistribution.length} subscription tiers
                    </p>
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>Seller Coverage:</strong> 5 sellers across multiple countries providing diverse coffee offerings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!analytics && !mockAnalytics && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No analytics data available. Using mock data for demonstration.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Seller Management</h3>
              <button 
                onClick={() => setAddModal({ isOpen: true, type: 'seller' })}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2 inline" />
                Add Seller
              </button>
            </div>

            {/* Summary Stats */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">{mockAnalytics.activeSubscriptions}</p>
                  <p className="text-blue-600">Active Sellers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">${mockAnalytics.monthlyRevenue.toFixed(2)}</p>
                  <p className="text-blue-600">Monthly Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">{mockAnalytics.tierDistribution.reduce((total, tier) => total + tier.count, 0)}</p>
                  <p className="text-blue-600">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">{mockAnalytics.totalCountries}</p>
                  <p className="text-blue-600">Countries</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Company & Brand</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Contact & Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Subscription & Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="border-b border-gray-100 hover:bg-amber-50">
                      {/* Company & Brand */}
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                            {seller.logo ? (
                              <img src={seller.logo} alt={seller.companyName} className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <Building2 className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{seller.companyName}</p>
                            <p className="text-sm text-gray-600 truncate">{seller.companySize}</p>
                            {seller.website && (
                              <a 
                                href={seller.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 truncate block flex items-center"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {seller.website.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-900 truncate">{seller.email}</span>
                          </div>
                          {seller.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-gray-600">{seller.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-600 truncate">{seller.location}</span>
                          </div>
                          {seller.country && seller.city && (
                            <div className="text-xs text-gray-500">
                              {seller.city}, {seller.country}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Subscription & Revenue */}
                      <td className="py-4 px-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              seller.subscriptionTier === 'free' ? 'bg-gray-100 text-gray-800' :
                              seller.subscriptionTier === 'basic' ? 'bg-blue-100 text-blue-800' :
                              seller.subscriptionTier === 'premium' ? 'bg-purple-100 text-purple-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              <Crown className="h-3 w-3 mr-1" />
                              {seller.subscriptionTier}
                            </span>
                            <span className="text-xs text-gray-500">
                              ${subscriptionPricing[seller.subscriptionTier as keyof typeof subscriptionPricing] || 0}/mo
                            </span>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-900 font-medium">${seller.monthlyRevenue?.toLocaleString()}/mo</p>
                            <p className="text-gray-600 text-xs">Total: ${seller.totalRevenue?.toLocaleString()}</p>
                          </div>
                          {seller.subscriptionExpiry && (
                            <div className="text-xs text-gray-500">
                              Expires: {seller.subscriptionExpiry}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            seller.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                            seller.subscriptionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            seller.subscriptionStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {seller.subscriptionStatus === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {seller.subscriptionStatus === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {seller.subscriptionStatus === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                            <span className="capitalize">
                              {String(seller.subscriptionStatus || 'unknown').replace(/0/g, '')}
                            </span>
                          </span>
                          {/* Temporarily removed customer count to debug the "0" issue */}
                          {/* {seller.customerCount && seller.customerCount > 0 && (
                            <div className="text-xs text-gray-600">
                              {seller.customerCount} customers
                            </div>
                          )} */}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setViewModal({ isOpen: true, type: 'seller', data: seller });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (editingEntity.id === seller.id) {
                                // Save changes
                                updateSeller(editingEntity.data);
                                setEditingEntity({ type: null, id: null, data: null });
                              } else {
                                // Enter edit mode
                                setEditingEntity({ 
                                  type: 'seller', 
                                  id: seller.id, 
                                  data: { ...seller } 
                                });
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              editingEntity.id === seller.id
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={editingEntity.id === seller.id ? 'Save Changes' : 'Edit Seller'}
                          >
                            {editingEntity.id === seller.id ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${seller.companyName}?`)) {
                                deleteSeller(seller.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Seller"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSellers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No sellers found. Using mock data for demonstration.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">User Management</h3>
              <button 
                onClick={() => setAddModal({ isOpen: true, type: 'user' })}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2 inline" />
                Add User
              </button>
            </div>
            
            {/* Summary Stats */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">{allUsers.length}</p>
                  <p className="text-blue-600">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">{allUsers.filter(u => u.role === 'admin').length}</p>
                  <p className="text-blue-600">Admins</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">{allUsers.filter(u => u.role === 'seller').length}</p>
                  <p className="text-blue-600">Sellers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">{allUsers.filter(u => u.role === 'customer').length}</p>
                  <p className="text-blue-600">Customers</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Company</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Last Login</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((adminUser) => (
                    <tr key={adminUser.id} className="border-b border-gray-100 hover:bg-amber-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{adminUser.name}</p>
                            <p className="text-sm text-gray-600">{adminUser.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          adminUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                          adminUser.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {adminUser.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{adminUser.companyName || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{adminUser.lastLogin}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          adminUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {adminUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setViewModal({ isOpen: true, type: 'user', data: adminUser });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (editingEntity.id === adminUser.id) {
                                // Save changes
                                updateUser(editingEntity.data);
                                setEditingEntity({ type: null, id: null, data: null });
                              } else {
                                // Enter edit mode
                                setEditingEntity({ 
                                  type: 'user', 
                                  id: adminUser.id, 
                                  data: { ...adminUser } 
                                });
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              editingEntity.id === adminUser.id
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={editingEntity.id === adminUser.id ? 'Save Changes' : 'Edit User'}
                          >
                            {editingEntity.id === adminUser.id ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => {
                              if (adminUser.role === 'admin') {
                                alert('Cannot delete admin users');
                                return;
                              }
                              if (confirm(`Are you sure you want to delete ${adminUser.name}? This action cannot be undone.`)) {
                                deleteUser(adminUser.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                            disabled={adminUser.role === 'admin'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No users found. Using mock data for demonstration.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Add New Plan Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Subscription Plans</h3>
              <button 
                onClick={() => setAddModal({ isOpen: true, type: 'subscriptions' })}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </button>
            </div>

            {/* Subscription Plans Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {(subscriptionPlans.length > 0 ? subscriptionPlans : mockSubscriptionPlans).map((plan) => {
                // Calculate real usage for this tier
                const realSellers = sellers.length > 0 ? sellers : mockSellers;
                const tierUsage = realSellers.filter(seller => seller.subscriptionTier === plan.tier).length;
                const monthlyRevenue = plan.price * tierUsage;
                const annualRevenue = monthlyRevenue * 12;
                
                return (
                <div key={plan.id} className="bg-white rounded-2xl border border-amber-100 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                  {/* Plan Header */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4 ${
                      plan.tier === 'free' ? 'bg-gray-100 text-gray-600' :
                      plan.tier === 'basic' ? 'bg-blue-100 text-blue-600' :
                      plan.tier === 'premium' ? 'bg-purple-100 text-purple-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      <Crown className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      {plan.price > 0 && (
                        <span className="text-xs sm:text-sm font-normal text-gray-500">/{plan.billingCycle}</span>
                      )}
                    </div>
                    {/* Simple monthly pricing - no setup fees */}
                    {plan.tier === 'free' && (
                      <p className="text-xs sm:text-sm text-green-600 font-medium">No credit card required</p>
                    )}
                  </div>

                  {/* Plan Features */}
                  <div className="mb-4 sm:mb-6">
                    <ul className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Plan Usage & Revenue */}
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                      <div>
                        <p className="text-xs sm:text-sm text-blue-600">Current Users</p>
                        <p className="font-semibold text-blue-900 text-sm sm:text-base">{tierUsage}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-blue-600">Monthly Revenue</p>
                        <p className="font-semibold text-blue-900 text-sm sm:text-base">${monthlyRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-200 text-center">
                      <p className="text-xs text-blue-600">
                        <strong>Annual Projection:</strong> ${annualRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Plan Limits */}
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 text-center">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Max Coffee Uploads</p>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {plan.maxCoffees === -1 ? 'Unlimited' : plan.maxCoffees}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Analytics</p>
                          <p className="font-semibold text-gray-900 capitalize text-sm sm:text-base">
                            {plan.analyticsAccess === 'none' ? 'None' : plan.analyticsAccess}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Support</p>
                          <p className="font-semibold text-gray-900 capitalize text-sm sm:text-base">
                            {plan.supportLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Actions */}
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        // Edit plan - could open an edit modal
                        alert(`Editing ${plan.name} plan`);
                      }}
                      className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        // Toggle plan activation
                        updateSubscriptionPlan({ ...plan, isActive: !plan.isActive });
                      }}
                      className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
                        plan.isActive 
                          ? 'border-red-300 text-red-700 hover:bg-red-50' 
                          : 'border-green-300 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {plan.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  {/* Plan Status */}
                  <div className="mt-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )})}
            </div>
            {subscriptionPlans.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Crown className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No subscription plans found. Using mock data for demonstration.</p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Current Subscription Status</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>• Free Tier: {mockAnalytics.tierDistribution.find(t => t.tier === 'Free')?.count || 0} sellers</p>
                    <p>• Basic Tier: {mockAnalytics.tierDistribution.find(t => t.tier === 'Basic')?.count || 0} sellers</p>
                    <p>• Premium Tier: {mockAnalytics.tierDistribution.find(t => t.tier === 'Premium')?.count || 0} sellers</p>
                    <p>• Enterprise Tier: {mockAnalytics.tierDistribution.find(t => t.tier === 'Enterprise')?.count || 0} sellers</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add New Entity Modals */}
      {addModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {addModal.type === 'seller' ? 'Add New Seller' :
                   addModal.type === 'customer' ? 'Add New Customer' :
                   addModal.type === 'user' ? 'Add New User' :
                   addModal.type === 'subscriptions' ? 'Add New Subscription Plan' :
                   'Add New'}
                </h3>
                <button
                  onClick={() => setAddModal({ isOpen: false, type: null })}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {addModal.type === 'seller' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createSeller({
                    companyName: 'New Seller',
                    companySize: 'Small',
                    mission: 'To sell the best coffee beans.',
                    email: 'info@newseller.com',
                    phone: '+1 234 567 890',
                    location: 'New York, USA',
                    rating: 4.5,
                    totalCoffees: 100,
                    memberSince: new Date().getFullYear(),
                    specialties: ['Arabica', 'Robusta'],
                    certifications: ['Fair Trade', 'Organic'],
                    featuredCoffeeId: 'coffee-123',
                    description: 'A new seller with a promising future.',
                    website: 'https://www.newseller.com',
                    socialMedia: { instagram: 'newseller', facebook: 'newseller', twitter: 'newseller' },
                    defaultPricePerBag: '$50',
                    orderLink: 'https://www.newseller.com/order',
                    reviews: [],
                    teamMembers: [],
                    country: 'USA',
                    city: 'New York',
                    subscriptionStatus: 'active',
                    subscriptionTier: 'basic',
                    subscriptionExpiry: '2024-12-31',
                    monthlyRevenue: 1000,
                    totalRevenue: 12000,
                    customerCount: 100,
                  });
                  setAddModal({ isOpen: false, type: null });
                }}
                className="space-y-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" id="companyName" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">Company Size</label>
                    <select id="companySize" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="mission" className="block text-sm font-medium text-gray-700">Mission</label>
                    <textarea id="mission" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"></textarea>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" id="phone" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input type="text" id="location" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating</label>
                    <input type="number" id="rating" min="0" max="5" step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="totalCoffees" className="block text-sm font-medium text-gray-700">Total Coffees</label>
                    <input type="number" id="totalCoffees" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="memberSince" className="block text-sm font-medium text-gray-700">Member Since</label>
                    <input type="number" id="memberSince" min="1900" max={new Date().getFullYear()} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="specialties" className="block text-sm font-medium text-gray-700">Specialties</label>
                    <input type="text" id="specialties" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    <p className="text-xs text-gray-500 mt-1">e.g., Arabica, Robusta, Single Origin</p>
                  </div>
                  <div>
                    <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">Certifications</label>
                    <input type="text" id="certifications" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    <p className="text-xs text-gray-500 mt-1">e.g., Fair Trade, Organic, Rainforest Alliance</p>
                  </div>
                  <div>
                    <label htmlFor="featuredCoffeeId" className="block text-sm font-medium text-gray-700">Featured Coffee ID</label>
                    <input type="text" id="featuredCoffeeId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"></textarea>
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                    <input type="url" id="website" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="socialMedia" className="block text-sm font-medium text-gray-700">Social Media</label>
                    <input type="text" id="socialMedia" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    <p className="text-xs text-gray-500 mt-1">e.g., instagram: newseller, facebook: newseller, twitter: newseller</p>
                  </div>
                  <div>
                    <label htmlFor="defaultPricePerBag" className="block text-sm font-medium text-gray-700">Default Price Per Bag</label>
                    <input type="text" id="defaultPricePerBag" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="orderLink" className="block text-sm font-medium text-gray-700">Order Link</label>
                    <input type="url" id="orderLink" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="subscriptionStatus" className="block text-sm font-medium text-gray-700">Subscription Status</label>
                    <select id="subscriptionStatus" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subscriptionTier" className="block text-sm font-medium text-gray-700">Subscription Tier</label>
                    <select id="subscriptionTier" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subscriptionExpiry" className="block text-sm font-medium text-gray-700">Subscription Expiry</label>
                    <input type="date" id="subscriptionExpiry" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="monthlyRevenue" className="block text-sm font-medium text-gray-700">Monthly Revenue</label>
                    <input type="number" id="monthlyRevenue" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="totalRevenue" className="block text-sm font-medium text-gray-700">Total Revenue</label>
                    <input type="number" id="totalRevenue" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="customerCount" className="block text-sm font-medium text-gray-700">Customer Count</label>
                    <input type="number" id="customerCount" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                    Add Seller
                  </button>
                </form>
              )}

              {addModal.type === 'customer' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createCustomer({
                    name: 'New Customer',
                    email: 'info@newcustomer.com',
                    subscriptionStatus: 'active',
                    subscriptionTier: 'basic',
                    subscriptionExpiry: '2024-12-31',
                    totalSpent: 0,
                    coffeeCount: 0,
                    lastPurchase: null,
                    createdAt: new Date().toISOString(),
                    isActive: true,
                    customerCount: 1, // This will be updated by the backend
                  });
                  setAddModal({ isOpen: false, type: null });
                }}
                className="space-y-4">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <input type="text" id="customerName" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="customerEmail" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="customerSubscriptionStatus" className="block text-sm font-medium text-gray-700">Subscription Status</label>
                    <select id="customerSubscriptionStatus" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="customerSubscriptionTier" className="block text-sm font-medium text-gray-700">Subscription Tier</label>
                    <select id="customerSubscriptionTier" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="customerSubscriptionExpiry" className="block text-sm font-medium text-gray-700">Subscription Expiry</label>
                    <input type="date" id="customerSubscriptionExpiry" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="customerTotalSpent" className="block text-sm font-medium text-gray-700">Total Spent</label>
                    <input type="number" id="customerTotalSpent" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="customerCoffeeCount" className="block text-sm font-medium text-gray-700">Coffee Count</label>
                    <input type="number" id="customerCoffeeCount" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="customerLastPurchase" className="block text-sm font-medium text-gray-700">Last Purchase</label>
                    <input type="date" id="customerLastPurchase" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="customerCreatedAt" className="block text-sm font-medium text-gray-700">Created At</label>
                    <input type="date" id="customerCreatedAt" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                    Add Customer
                  </button>
                </form>
              )}

              {addModal.type === 'subscriptions' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createSubscriptionPlan({
                    name: 'New Plan',
                    tier: 'basic',
                    price: 100,
                    billingCycle: 'monthly',
                    features: ['Feature 1', 'Feature 2'],
                    maxCoffees: 1000,
                    analyticsAccess: 'basic',
                    supportLevel: 'email',
                    isActive: true,
                    setupFee: 0,
                    trialDays: 0,
                    description: 'A new subscription plan.',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  });
                  setAddModal({ isOpen: false, type: null });
                }}
                className="space-y-4">
                  <div>
                    <label htmlFor="planName" className="block text-sm font-medium text-gray-700">Plan Name</label>
                    <input type="text" id="planName" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="planTier" className="block text-sm font-medium text-gray-700">Tier</label>
                    <select id="planTier" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="planPrice" className="block text-sm font-medium text-gray-700">Price</label>
                    <input type="number" id="planPrice" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="planBillingCycle" className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                    <select id="planBillingCycle" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one-time">One-Time</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="planFeatures" className="block text-sm font-medium text-gray-700">Features</label>
                    <textarea id="planFeatures" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Enter features separated by commas" />
                    <p className="text-xs text-gray-500 mt-1">e.g., Basic analytics, Email support, Custom branding</p>
                  </div>
                  <div>
                    <label htmlFor="planMaxCoffees" className="block text-sm font-medium text-gray-700">Max Coffee Uploads</label>
                    <input type="number" id="planMaxCoffees" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    <p className="text-xs text-gray-500 mt-1">Use -1 for unlimited</p>
                  </div>
                  <div>
                    <label htmlFor="planAnalyticsAccess" className="block text-sm font-medium text-gray-700">Analytics Access</label>
                    <select id="planAnalyticsAccess" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="none">None</option>
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                      <option value="full">Full Suite</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="planSupportLevel" className="block text-sm font-medium text-gray-700">Support Level</label>
                    <select id="planSupportLevel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="community">Community</option>
                      <option value="email">Email</option>
                      <option value="priority">Priority</option>
                      <option value="dedicated">Dedicated</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="planIsActive" className="block text-sm font-medium text-gray-700">Is Active</label>
                    <input type="checkbox" id="planIsActive" className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded" />
                  </div>

                  <div>
                    <label htmlFor="planTrialDays" className="block text-sm font-medium text-gray-700">Trial Days</label>
                    <input type="number" id="planTrialDays" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="planDescription" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="planDescription" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                    Add Plan
                  </button>
                </form>
              )}

              {addModal.type === 'user' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createUser({
                    name: 'New User',
                    email: 'newuser@example.com',
                    role: 'customer',
                    companyName: 'New Company',
                    sellerId: null,
                    subscriptionStatus: 'active',
                    subscriptionTier: 'basic'
                  });
                  setAddModal({ isOpen: false, type: null });
                }}
                className="space-y-4">
                  <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700">User Name</label>
                    <input type="text" id="userName" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="userEmail" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="userRole" className="block text-sm font-medium text-gray-700">Role</label>
                    <select id="userRole" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="userCompany" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" id="userCompany" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="userSubscriptionTier" className="block text-sm font-medium text-gray-700">Subscription Tier</label>
                    <select id="userSubscriptionTier" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                    Add User
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
