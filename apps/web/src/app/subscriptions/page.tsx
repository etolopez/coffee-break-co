'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  Award, 
  ArrowRight, 
  MapPin, 
  Leaf, 
  Shield, 
  QrCode, 
  Users, 
  BarChart3,
  CheckCircle,
  Star,
  TrendingUp,
  Zap,
  Crown,
  Globe,
  Lock,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  CreditCard,
  Headphones,
  MessageCircle,
  Settings,
  Zap as Lightning,
  Target,
  PieChart,
  LineChart,
  Activity,
  Database,
  FileText,
  Image,
  Video,
  Music,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Server,
  Cloud,
  Shield as Security,
  Globe as World,
  Users as Team,
  Building,
  Home,
  Store,
  ShoppingCart,
  DollarSign,
  Percent,
  Clock,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Rocket,
  User,
  X,
  Plus,
  Edit,
  Save,
  Eye as View,
  Download as Export,
  Settings as Config,
  Target as Goals,
  TrendingUp as Growth,
  Activity as Metrics,
  Database as Storage,
  FileText as Reports,
  Image as Media,
  Video as VideoContent,
  Music as Audio,
  Smartphone as Mobile,
  Monitor as Desktop,
  Tablet as TabletDevice,
  Laptop as LaptopDevice,
  Server as Backend,
  Cloud as CloudStorage,
  Shield as SecurityIcon,
  Globe as WorldIcon,
  Users as TeamIcon,
  Building as Company,
  Home as HomeIcon,
  Store as Shop,
  ShoppingCart as Cart,
  DollarSign as Money,
  Percent as Percentage,
  Clock as Time,
  Play as PlayIcon,
  Pause as PauseIcon,
  SkipForward as Skip,
  RotateCcw as Reset
} from 'lucide-react';
import { useSimpleAuth } from '../../hooks/useSimpleAuth';
import Header from '../../components/Header';

// Subscription tier data - only features we've actually built
const subscriptionTiers = [
  {
    id: 'free',
    name: 'Free Plan',
    tier: 'free',
    price: 0,
    billingCycle: 'monthly',
    features: [
      'Basic profile (no custom images)',
      '1 coffee upload per month',
      'QR code generation',
      'Basic coffee passport',
      'Community support',
      'View all coffees'
    ],
    maxCoffees: 1,
    analyticsAccess: 'none',
    supportLevel: 'community',
    isActive: true,
    description: 'Perfect for coffee enthusiasts starting their selling journey',
    setupFee: 0,
    trialDays: 0,
    popular: false,
    comingSoon: false
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    tier: 'basic',
    price: 29.99,
    billingCycle: 'monthly',
    features: [
      'Up to 5 coffee uploads',
      '1 month of analytics',
      'Full profile customization',
      'Custom logo & images',
      'Email support',
      'QR code generation',
      'Total saved coffees tracking',
      'Coffee management dashboard'
    ],
    maxCoffees: 5,
    analyticsAccess: 'basic',
    supportLevel: 'email',
    isActive: true,
    description: 'Ideal for small coffee businesses and individual roasters',
    setupFee: 0,
    trialDays: 14,
    popular: true,
    comingSoon: true // Coming in Phase 2
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    tier: 'premium',
    price: 79.99,
    billingCycle: 'monthly',
    features: [
      'Up to 20 coffee uploads',
      '3 months of analytics',
      'Full profile customization',
      'Custom logo & images',
      'Email support',
      'QR code generation',
      'Total saved coffees tracking',
      'Coffee management dashboard'
    ],
    maxCoffees: 20,
    analyticsAccess: 'advanced',
    supportLevel: 'email',
    isActive: true,
    description: 'For growing coffee businesses with multiple offerings',
    setupFee: 99,
    trialDays: 30,
    popular: false,
    comingSoon: true // Coming in Phase 3
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    tier: 'enterprise',
    price: 199.99,
    billingCycle: 'monthly',
    features: [
      'Unlimited coffee uploads',
      '1 year of analytics',
      'Full profile customization',
      'Custom logo & images',
      'Email support',
      'QR code generation',
      'Specific saved coffees tracking',
      'Coffee management dashboard'
    ],
    maxCoffees: -1,
    analyticsAccess: 'full',
    supportLevel: 'email',
    isActive: true,
    description: 'For large coffee businesses requiring enterprise-level features',
    setupFee: 299,
    trialDays: 45,
    popular: false,
    comingSoon: true // Coming in Phase 4
  }
];

// Analytics examples for each tier - based on what we've actually built
interface AnalyticsMockData {
  totalViews: number;
  avgRating: number;
  totalReviews: number;
  monthlyGrowth: string;
  analyticsPeriod?: string;
  savedCoffees?: number;
}

const analyticsExamples: Record<string, {
  title: string;
  description: string;
  features: string[];
  mockData: AnalyticsMockData;
}> = {
  basic: {
    title: 'Basic Analytics Dashboard',
    description: 'Essential metrics to understand your coffee performance',
    features: [
      'Total coffee views',
      'Basic engagement metrics',
      '1 month of analytics data',
      'Total saved coffees tracking'
    ],
    mockData: {
      totalViews: 1250,
      avgRating: 4.2,
      totalReviews: 15,
      monthlyGrowth: '+12%',
      analyticsPeriod: '1 month',
      savedCoffees: 8
    }
  },
  premium: {
    title: 'Premium Analytics Suite',
    description: 'Advanced insights to grow your coffee business',
    features: [
      'Total coffee views',
      'Engagement metrics',
      '3 months of analytics data',
      'Total saved coffees tracking',
      'Extended reporting period'
    ],
    mockData: {
      totalViews: 3420,
      avgRating: 4.6,
      totalReviews: 28,
      monthlyGrowth: '+18%',
      analyticsPeriod: '3 months',
      savedCoffees: 15
    }
  },
  enterprise: {
    title: 'Enterprise Analytics Platform',
    description: 'Complete business intelligence for coffee enterprises',
    features: [
      'Total coffee views',
      'Engagement metrics',
      '1 year of analytics data',
      'Specific saved coffees tracking',
      'Long-term trend analysis'
    ],
    mockData: {
      totalViews: 8750,
      avgRating: 4.8,
      totalReviews: 67,
      monthlyGrowth: '+25%',
      analyticsPeriod: '1 year',
      savedCoffees: 42
    }
  }
};

// Seller dashboard preview data for each tier
const dashboardPreviews = {
  free: {
    title: 'Free Plan Dashboard',
    description: 'Basic coffee management with placeholder images and limited customization',
    features: [
      'Basic profile (no custom images)',
      '1 coffee entry',
      'QR code generation',
      'Community support'
    ],
    mockStats: {
      coffeeCount: 1,
      totalViews: 150,
      avgRating: 4.0,
      reviews: 3
    }
  },
  basic: {
    title: 'Basic Plan Dashboard',
    description: 'Professional coffee business management with full customization',
    features: [
      'Up to 5 coffee entries',
      '1 month of analytics',
      'Full profile customization',
      'Custom logo & images',
      'Email support',
      'Total saved coffees tracking'
    ],
    mockStats: {
      coffeeCount: 5,
      totalViews: 1250,
      avgRating: 4.2,
      reviews: 15
    }
  },
  premium: {
    title: 'Premium Plan Dashboard',
    description: 'Advanced business intelligence and growth tools with full customization',
    features: [
      'Up to 20 coffee entries',
      '3 months of analytics',
      'Full profile customization',
      'Custom logo & images',
      'Email support',
      'Total saved coffees tracking'
    ],
    mockStats: {
      coffeeCount: 20,
      totalViews: 3420,
      avgRating: 4.6,
      reviews: 28
    }
  },
  enterprise: {
    title: 'Enterprise Plan Dashboard',
    description: 'Complete enterprise coffee business platform with full customization',
    features: [
      'Unlimited coffee entries',
      '1 year of analytics',
      'Full profile customization',
      'Custom logo & images',
      'Email support',
      'Specific saved coffees tracking'
    ],
    mockStats: {
      coffeeCount: 156,
      totalViews: 8750,
      avgRating: 4.8,
      reviews: 67
    }
  }
};

export default function SubscriptionsPage() {
  const { user, isAuthenticated } = useSimpleAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showDashboardPreview, setShowDashboardPreview] = useState(false);
  const [previewTier, setPreviewTier] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState(1);

  // Check if user is a seller and get their current tier
  const isSeller = user?.role === 'seller';
  const currentTier = user?.subscriptionTier || 'free';

  useEffect(() => {
    // Fetch current launch phase
    fetchCurrentPhase();
  }, []);

  const fetchCurrentPhase = async () => {
    try {
      const response = await fetch('/api/admin/launch-config');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.progress?.currentPhase) {
          setCurrentPhase(data.data.progress.currentPhase);
        }
      }
    } catch (error) {
      console.log('Could not fetch launch phase, using default');
    }
  };

  // Filter available tiers based on current launch phase
  const getAvailableTiers = () => {
    if (currentPhase >= 4) return subscriptionTiers; // All tiers available
    if (currentPhase >= 3) return subscriptionTiers.filter(t => t.tier !== 'enterprise'); // Free, Basic, Premium
    if (currentPhase >= 2) return subscriptionTiers.filter(t => ['free', 'basic'].includes(t.tier)); // Free, Basic only
    return subscriptionTiers.filter(t => t.tier === 'free'); // Free only
  };

  // Get all tiers with "coming soon" status for unavailable ones
  const getAllTiersWithStatus = () => {
    const availableTiers = getAvailableTiers();
    return subscriptionTiers.map(tier => ({
      ...tier,
      comingSoon: !availableTiers.find(at => at.id === tier.id)
    }));
  };

  const availableTiers = getAvailableTiers();
  const allTiersWithStatus = getAllTiersWithStatus();

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    setShowComparison(true);
  };

  const handleViewDetails = (tierId: string) => {
    setPreviewTier(tierId);
    setShowDashboardPreview(true);
  };

  const handleUpgrade = (tierId: string) => {
    // In a real app, this would redirect to payment processing
    alert(`Redirecting to payment for ${tierId} plan...`);
  };

  const handleDowngrade = (tierId: string) => {
    // In a real app, this would handle subscription changes
    alert(`Processing downgrade to ${tierId} plan...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-amber-700 text-sm font-semibold rounded-full mb-8 border border-amber-200/50 shadow-lg">
              <Crown className="h-5 w-5 mr-2 text-amber-500" />
              {isSeller ? 'Upgrade Your Coffee Business' : 'Start Your Coffee Journey'}
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="block text-gray-900">
                {isSeller ? 'Scale Your' : 'Choose Your'}
              </span>
              <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {isSeller ? 'Coffee Empire' : 'Coffee Plan'}
              </span>
            </h1>
            
            <p className="text-2xl lg:text-3xl font-light text-gray-700/80 mb-6 leading-relaxed">
              {isSeller 
                ? 'Upgrade to unlock powerful analytics, unlimited uploads, and premium features'
                : 'Select the perfect plan to showcase your coffee and grow your business'
              }
            </p>
            <p className="text-xl text-gray-600/70 mb-12 max-w-4xl mx-auto leading-relaxed">
              From basic profiles to enterprise analytics, we have the tools you need to succeed in the coffee industry
            </p>

            {/* Current User Status */}
            {isAuthenticated && (
              <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 shadow-lg">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-gray-900">
                      Welcome back, {user?.name}!
                    </p>
                    <p className="text-gray-600">
                      Current Plan: <span className="font-semibold capitalize">{currentTier}</span>
                      {isSeller && (
                        <span className="ml-2 text-amber-600">
                          • Ready to upgrade?
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Launch Phase Notice */}
      {currentPhase < 4 && (
        <section className="py-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full mb-4">
              <Rocket className="h-5 w-5 mr-2" />
              Launch Phase {currentPhase} of 4
            </div>
            <p className="text-lg text-blue-700 max-w-3xl mx-auto">
              We're currently in Phase {currentPhase} of our launch strategy. 
              {currentPhase === 1 && ' Basic plans will be available in Phase 2, Premium in Phase 3, and Enterprise in Phase 4.'}
              {currentPhase === 2 && ' Premium plans will be available in Phase 3, and Enterprise in Phase 4.'}
              {currentPhase === 3 && ' Enterprise plans will be available in Phase 4.'}
            </p>
          </div>
        </section>
      )}

      {/* Pricing Tiers */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with our free plan and upgrade as you grow. All plans include our core coffee passport features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {allTiersWithStatus.map((tier) => (
              <div key={tier.id} className={`relative rounded-2xl border-2 p-8 transition-all duration-300 ${
                tier.comingSoon 
                  ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60' // Disabled state
                  : tier.popular 
                    ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl hover:shadow-2xl hover:-translate-y-2' 
                    : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-2xl hover:-translate-y-2'
              }`}>
                
                {/* Popular Badge */}
                {tier.popular && !tier.comingSoon && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Coming Soon Badge */}
                {tier.comingSoon && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Coming Soon
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                    tier.tier === 'free' ? 'bg-gray-100 text-gray-600' :
                    tier.tier === 'basic' ? 'bg-blue-100 text-blue-600' :
                    tier.tier === 'premium' ? 'bg-purple-100 text-purple-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {tier.tier === 'free' && <Coffee className="h-8 w-8" />}
                    {tier.tier === 'basic' && <BarChart3 className="h-8 w-8" />}
                    {tier.tier === 'premium' && <TrendingUp className="h-8 w-8" />}
                    {tier.tier === 'enterprise' && <Crown className="h-8 w-8" />}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    {tier.price > 0 && (
                      <span className="text-lg font-normal text-gray-500">/{tier.billingCycle}</span>
                    )}
                  </div>
                  {tier.setupFee > 0 && (
                    <p className="text-sm text-gray-500">+${tier.setupFee} setup fee</p>
                  )}
                  {tier.trialDays > 0 && (
                    <p className="text-sm text-green-600 font-medium">{tier.trialDays}-day free trial</p>
                  )}
                  <p className="text-gray-600 mt-3">{tier.description}</p>
                </div>

                {/* Plan Features */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Limits */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Max Coffee Uploads</p>
                      <p className="font-semibold text-gray-900">
                        {tier.maxCoffees === -1 ? 'Unlimited' : tier.maxCoffees}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Analytics</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {tier.analyticsAccess === 'none' ? 'None' : tier.analyticsAccess}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Support</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {tier.supportLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {tier.comingSoon ? (
                    // Disabled state for coming soon tiers
                    <div className="text-center">
                      <span className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed">
                        <Clock className="h-4 w-4 mr-2" />
                        Coming Soon
                      </span>
                    </div>
                  ) : isSeller && user?.subscriptionTier === tier.tier ? (
                    <div className="text-center">
                      <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Current Plan
                      </span>
                    </div>
                  ) : isSeller && user?.subscriptionTier && ['premium', 'enterprise'].includes(user.subscriptionTier) && ['free', 'basic'].includes(tier.tier) ? (
                    <button
                      onClick={() => handleDowngrade(tier.tier)}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Downgrade to {tier.name}
                    </button>
                  ) : isSeller ? (
                    <button
                      onClick={() => handleUpgrade(tier.tier)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Upgrade to {tier.name}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTierSelect(tier.id)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {tier.price === 0 ? 'Get Started Free' : `Start ${tier.name}`}
                    </button>
                  )}
                  
                  {!tier.comingSoon && (
                    <button
                      onClick={() => handleViewDetails(tier.id)}
                      className="w-full px-4 py-2 text-amber-600 hover:text-amber-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Examples */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              See Analytics in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how our analytics can transform your coffee business with actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Object.entries(analyticsExamples).map(([tier, example]) => (
              <div key={tier} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                    tier === 'basic' ? 'bg-blue-100 text-blue-600' :
                    tier === 'premium' ? 'bg-purple-100 text-purple-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{example.title}</h3>
                  <p className="text-gray-600">{example.description}</p>
                </div>

                {/* Mock Analytics Dashboard */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{example.mockData.totalViews.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Total Views</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{example.mockData.avgRating}</div>
                        <div className="text-xs text-gray-600">Avg Rating</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">{example.mockData.totalReviews}</div>
                        <div className="text-xs text-gray-600">Reviews</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">{example.mockData.monthlyGrowth}</div>
                        <div className="text-xs text-gray-600">Growth</div>
                      </div>
                    </div>
                    <div className="mt-4 bg-white rounded-lg p-3">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Analytics Period</div>
                      <div className="text-2xl font-bold text-blue-600">{example.mockData.analyticsPeriod}</div>
                    </div>
                    <div className="mt-4 bg-white rounded-lg p-3">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Saved Coffees</div>
                      <div className="text-2xl font-bold text-green-600">{example.mockData.savedCoffees}</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {example.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => handleViewDetails(tier)}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    View {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Modal */}
      {showDashboardPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{dashboardPreviews[previewTier]?.title}</h3>
                <button
                  onClick={() => setShowDashboardPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">{dashboardPreviews[previewTier]?.description}</p>
              </div>

              {/* Mock Dashboard Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboardPreviews[previewTier]?.mockStats.coffeeCount}</div>
                  <div className="text-sm text-blue-700">Coffee Entries</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{dashboardPreviews[previewTier]?.mockStats.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-green-700">Total Views</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{dashboardPreviews[previewTier]?.mockStats.avgRating}</div>
                  <div className="text-sm text-yellow-700">Avg Rating</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{dashboardPreviews[previewTier]?.mockStats.reviews}</div>
                  <div className="text-sm text-purple-700">Reviews</div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Plan Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboardPreviews[previewTier]?.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Dashboard Interface */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Preview</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-gray-900">Coffee Management</h5>
                    <button className="px-3 py-1 bg-amber-600 text-white text-sm rounded-lg">
                      <Plus className="h-4 w-4 mr-1 inline" />
                      Add Coffee
                    </button>
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: Math.min(3, dashboardPreviews[previewTier]?.mockStats.coffeeCount || 1) }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Coffee className="h-5 w-5 text-amber-600" />
                          <div>
                            <div className="font-medium text-gray-900">Coffee {index + 1}</div>
                            <div className="text-sm text-gray-600">Origin • Rating: {dashboardPreviews[previewTier]?.mockStats.avgRating}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <View className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-amber-600 hover:bg-amber-100 rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setShowDashboardPreview(false);
                    handleTierSelect(previewTier);
                  }}
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Choose {dashboardPreviews[previewTier]?.title.replace(' Plan Dashboard', '')} Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Comparison */}
      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Plan Comparison</h3>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                      {availableTiers.map((tier) => (
                        <th key={tier.id} className="text-center py-3 px-4 font-semibold text-gray-900">
                          {tier.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">Monthly Price</td>
                      {availableTiers.map((tier) => (
                        <td key={tier.id} className="text-center py-4 px-4">
                          {tier.price === 0 ? 'Free' : `$${tier.price}`}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">Coffee Uploads</td>
                      {availableTiers.map((tier) => (
                        <td key={tier.id} className="text-center py-4 px-4">
                          {tier.maxCoffees === -1 ? 'Unlimited' : tier.maxCoffees}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">Analytics Access</td>
                      {availableTiers.map((tier) => (
                        <td key={tier.id} className="text-center py-4 px-4">
                          <span className={`capitalize px-2 py-1 rounded text-xs font-medium ${
                            tier.analyticsAccess === 'none' ? 'bg-gray-100 text-gray-800' :
                            tier.analyticsAccess === 'basic' ? 'bg-blue-100 text-blue-800' :
                            tier.analyticsAccess === 'advanced' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {tier.analyticsAccess === 'none' ? 'None' : tier.analyticsAccess}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">Support Level</td>
                      {availableTiers.map((tier) => (
                        <td key={tier.id} className="text-center py-4 px-4">
                          <span className="capitalize px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tier.supportLevel}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">Setup Fee</td>
                      {availableTiers.map((tier) => (
                        <td key={tier.id} className="text-center py-4 px-4">
                          {tier.setupFee === 0 ? 'Free' : `$${tier.setupFee}`}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">Trial Period</td>
                      {availableTiers.map((tier) => (
                        <td key={tier.id} className="text-center py-4 px-4">
                          {tier.trialDays === 0 ? 'No trial' : `${tier.trialDays} days`}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-center space-x-4">
                {availableTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => {
                      if (isSeller) {
                        handleUpgrade(tier.tier);
                      } else {
                        handleTierSelect(tier.id);
                      }
                    }}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  >
                    {isSeller ? `Upgrade to ${tier.name}` : `Choose ${tier.name}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Coffee Business?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-3xl mx-auto">
            Join thousands of coffee producers who trust our platform to showcase their products and grow their business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-amber-700 text-lg font-semibold rounded-xl hover:bg-amber-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Coffee className="h-5 w-5 mr-2" />
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-amber-700 transition-all duration-200"
            >
              <Eye className="h-5 w-5 mr-2" />
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
              Coffee Break Co
            </span>
          </div>
          <p className="text-gray-300 mb-8">Digital Coffee Passport Platform</p>
          <div className="flex justify-center space-x-8 mb-8">
            <Link href="/coffees" className="text-gray-300 hover:text-amber-200 transition-colors">Explore Coffees</Link>
            <Link href="/sellers" className="text-gray-300 hover:text-amber-200 transition-colors">Our Sellers</Link>
            <Link href="/admin" className="text-gray-300 hover:text-amber-200 transition-colors">Seller Login</Link>
          </div>
          <p className="text-gray-400">&copy; 2024 Coffee Break Co. Built with ❤️ for coffee excellence.</p>
        </div>
      </footer>
    </div>
  );
}
