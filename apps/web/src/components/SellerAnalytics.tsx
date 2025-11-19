/**
 * Seller Analytics Component
 * Displays real analytics data based on seller's actual coffee entries and reviews
 * Integrates with existing seller dashboard data instead of using mock data
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Star, 
  MessageCircle, 
  Eye, 
  TrendingUp,
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  Bookmark,
  Phone,
  CheckCircle,
  Lock,
  Crown
} from 'lucide-react';

/**
 * Coffee entry interface matching the seller dashboard
 */
interface CoffeeEntry {
  id: string;
  coffeeName: string;
  country: string;
  specificLocation: string;
  origin: string;
  farm: string;
  farmer: string;
  altitude: string;
  variety: string;
  process: string;
  harvestDate: string;
  processingDate: string;
  cuppingScore: string;
  notes: string;
  qrCode?: string;
  slug?: string;
  farmSize: string;
  workerCount: string;
  certifications: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  farmImage?: string;
  farmerImage?: string;
  producerName?: string;
  producerPortrait?: string;
  producerBio?: string;
  roastedBy?: string;
  fermentationTime: string;
  dryingTime: string;
  moistureContent: string;
  screenSize: string;
  beanDensity?: string;
  aroma: string;
  flavor: string;
  acidity: string;
  body: string;
  primaryNotes: string;
  secondaryNotes: string;
  finish: string;
  roastRecommendation: string;
  roastDevelopmentCurve?: string;
  environmentalPractices: string[];
  fairTradePremium: string;
  communityProjects: string;
  womenWorkerPercentage: string;
  pricePerBag?: string;
  available?: boolean;
  orderLink?: string;
  sellerId?: string;
}

/**
 * Props for the SellerAnalytics component
 */
interface SellerAnalyticsProps {
  entries: CoffeeEntry[];
  commentsData: {[key: string]: any[]};
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'expired';
}

/**
 * Main analytics component that uses real seller data
 */
export default function SellerAnalytics({ 
  entries, 
  commentsData, 
  subscriptionTier = 'free', 
  subscriptionStatus = 'active'
}: SellerAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('all');

  /**
   * Calculate real analytics data from seller's entries and comments
   */
  const calculateAnalytics = () => {
    // If no coffees, return empty data
    if (entries.length === 0) {
      return {
        totalCoffees: 0,
        averageRating: 0,
        totalReviews: 0,
        coffeeViews: 0,
        coffeeShares: 0,
        totalSavedCoffees: 0,
        totalLeads: 0,
        leadConversionRate: 0,
        topCountries: [],
        monthlyTrends: [],
        coffeeRatings: {},
        hasData: false
      };
    }

    // Calculate overall ratings and reviews
    let totalRating = 0;
    let totalReviews = 0;
    const coffeeRatings: {[key: string]: {rating: number, count: number}} = {};
    
    Object.entries(commentsData).forEach(([coffeeId, comments]) => {
      let coffeeRating = 0;
      let coffeeReviews = 0;
      
      comments.forEach(comment => {
        if (comment.rating) {
          coffeeRating += comment.rating;
          coffeeReviews++;
          totalRating += comment.rating;
          totalReviews++;
        }
      });
      
      if (coffeeReviews > 0) {
        coffeeRatings[coffeeId] = {
          rating: coffeeRating / coffeeReviews,
          count: coffeeReviews
        };
      }
    });
    
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    // Calculate geographic distribution
    const countryCounts: {[key: string]: number} = {};
    entries.forEach(entry => {
      if (entry.country) {
        countryCounts[entry.country] = (countryCounts[entry.country] || 0) + 1;
      }
    });
    
    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // TODO: Replace with real data from analytics API
    // These would come from actual user interactions tracked in the database
    const totalSavedCoffees = 0; // Count of times users saved any of seller's coffees
    const totalLeads = 0; // Count of "get a bag" button clicks across all seller pages
    const totalPageVisits = 0; // Count of seller page visits (seller profile, coffee pages, etc.)
    const leadConversionRate = totalPageVisits > 0 ? (totalLeads / totalPageVisits) * 100 : 0;
    
    // Note: In a real implementation, these metrics would be tracked by:
    // 1. Saved coffees: Database table tracking user saves of seller's coffees
    // 2. Leads: Analytics tracking "get a bag" button clicks on seller pages
    // 3. Page visits: Analytics tracking visits to seller profile and coffee pages
    // 4. Conversion rate: (leads / page visits) * 100
    
    // Only show monthly trends if there's enough data
    const monthlyTrends = entries.length > 0 ? Array.from({ length: 6 }, (_, i) => {
      const month = new Date(2024, new Date().getMonth() - 5 + i, 1).toLocaleDateString('en-US', { month: 'short' });
      return {
        month,
        newCoffees: 0, // Would be real data from analytics API
        totalViews: 0, // Would be real data from analytics API
        avgRating: averageRating
      };
    }) : [];
    
    return {
      totalCoffees: entries.length,
      averageRating,
      totalReviews,
      coffeeViews: 0, // Would be real data from analytics API
      coffeeShares: 0, // Would be real data from analytics API
      totalSavedCoffees,
      totalLeads,
      leadConversionRate,
      topCountries,
      monthlyTrends,
      coffeeRatings,
      hasData: entries.length > 0
    };
  };

  const analyticsData = calculateAnalytics();

  /**
   * Get tier-specific configuration
   */
  const getTierConfig = () => {
    const configs = {
      free: {
        name: 'Free',
        color: 'gray',
        analyticsAccess: 'none',
        features: ['No analytics access'],
        upgradeMessage: 'Upgrade to Basic to access analytics',
        upgradeTier: 'basic'
      },
      basic: {
        name: 'Basic',
        color: 'blue',
        analyticsAccess: 'basic',
        features: ['Basic metrics', '3 months data', 'JSON export'],
        upgradeMessage: 'Upgrade to Premium for advanced analytics',
        upgradeTier: 'premium'
      },
      premium: {
        name: 'Premium',
        color: 'purple',
        analyticsAccess: 'advanced',
        features: ['Advanced metrics', '12 months data', 'CSV export', 'Trends'],
        upgradeMessage: 'Upgrade to Enterprise for unlimited analytics',
        upgradeTier: 'enterprise'
      },
      enterprise: {
        name: 'Enterprise',
        color: 'amber',
        analyticsAccess: 'full',
        features: ['Full analytics suite', 'Unlimited data', 'All export formats', 'Custom insights'],
        upgradeMessage: 'You have access to all analytics features!',
        upgradeTier: null
      }
    };
    
    return configs[subscriptionTier] || configs.free;
  };

  const currentTier = getTierConfig();

  /**
   * Render metric card with icon and value
   */
  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string, subtitle?: string) => (
    <div className={`bg-${color}-50 rounded-xl p-6 border border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  /**
   * Render trend chart for monthly data
   */
  const renderTrendChart = (data: any[], title: string, metric: string) => {
    if (!data || data.length === 0) return null;
    
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          {/* Simple bar chart visualization */}
          <div className="flex items-end space-x-2 h-48">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-blue-500 rounded-t"
                  style={{ height: `${(item[metric] / Math.max(...data.map(d => d[metric]))) * 100}%` }}
                />
                <span className="text-xs text-gray-500 mt-1">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render top performing coffees
   */
  const renderTopCoffees = () => {
    const topCoffees = Object.entries(analyticsData.coffeeRatings)
      .map(([coffeeId, data]) => {
        const coffee = entries.find(e => e.id === coffeeId);
        return {
          id: coffeeId,
          name: coffee?.coffeeName || 'Unknown Coffee',
          rating: data.rating,
          reviews: data.count
        };
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
    
    if (topCoffees.length === 0) return null;
    
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Coffees</h3>
        <div className="space-y-3">
          {topCoffees.map((coffee, index) => (
            <div key={coffee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                <span className="font-medium text-gray-900">{coffee.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{coffee.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-600">({coffee.reviews} reviews)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render geographic distribution
   */
  const renderGeographicData = () => {
    if (!analyticsData.topCountries || analyticsData.topCountries.length === 0) return null;
    
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Coffee Origins by Country</h3>
        <div className="space-y-3">
          {analyticsData.topCountries.map((country, index) => (
            <div key={country.country} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">{country.country}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{country.count} coffees</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Show upgrade prompt for free tier
  if (subscriptionTier === 'free') {
    return (
      <div className="text-center py-12">
        <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Locked</h3>
        <p className="text-gray-600 mb-6">{currentTier.upgradeMessage}</p>
        <button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
          Upgrade to {currentTier.upgradeTier?.charAt(0).toUpperCase() + currentTier.upgradeTier?.slice(1)}
        </button>
      </div>
    );
  }

  // Show analytics dashboard for paid tiers
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Metrics:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Metrics</option>
              <option value="coffees">Coffee Performance</option>
              <option value="engagement">Engagement</option>
              <option value="leads">Lead Generation</option>
            </select>
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {!analyticsData.hasData && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mb-6">
          <Coffee className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">No Analytics Data Yet</h3>
          <p className="text-blue-700 mb-4">
            Start by adding your first coffee entry to see analytics and insights.
          </p>
          <p className="text-sm text-blue-600">
            Once you have coffees and customer interactions, you'll see detailed metrics here.
          </p>
        </div>
      )}

      {/* Key Metrics Grid - Always show structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Core metrics - always visible */}
        {renderMetricCard('Total Coffees', analyticsData.totalCoffees, <Coffee className="h-6 w-6" />, 'blue')}
        
        {/* Rating metrics - show when available */}
        {analyticsData.averageRating > 0 ? (
          renderMetricCard('Average Rating', analyticsData.averageRating.toFixed(1), <Star className="h-6 w-6" />, 'amber', 'out of 5')
        ) : (
          renderMetricCard('Average Rating', 'N/A', <Star className="h-6 w-6" />, 'gray', 'No reviews yet')
        )}
        
        {analyticsData.totalReviews > 0 ? (
          renderMetricCard('Total Reviews', analyticsData.totalReviews, <MessageCircle className="h-6 w-6" />, 'green')
        ) : (
          renderMetricCard('Total Reviews', '0', <MessageCircle className="h-6 w-6" />, 'gray', 'No reviews yet')
        )}
        
        {/* Engagement metrics - show placeholders when no data */}
        {analyticsData.coffeeViews > 0 ? (
          renderMetricCard('Total Views', analyticsData.coffeeViews.toLocaleString(), <Eye className="h-6 w-6" />, 'purple')
        ) : (
          renderMetricCard('Total Views', '0', <Eye className="h-6 w-6" />, 'gray', 'No views yet')
        )}
        
        {analyticsData.totalSavedCoffees > 0 ? (
          renderMetricCard('Saved Coffees', analyticsData.totalSavedCoffees, <Bookmark className="h-6 w-6" />, 'indigo')
        ) : (
          renderMetricCard('Saved Coffees', '0', <Bookmark className="h-6 w-6" />, 'gray', 'No saves yet')
        )}
        
        {analyticsData.totalLeads > 0 ? (
          renderMetricCard('Total Leads', analyticsData.totalLeads, <Users className="h-6 w-6" />, 'emerald')
        ) : (
          renderMetricCard('Total Leads', '0', <Users className="h-6 w-6" />, 'gray', 'No leads yet')
        )}
        
        {analyticsData.leadConversionRate > 0 ? (
          renderMetricCard('Conversion Rate', `${analyticsData.leadConversionRate.toFixed(1)}%`, <TrendingUp className="h-6 w-6" />, 'rose')
        ) : (
          renderMetricCard('Conversion Rate', '0%', <TrendingUp className="h-6 w-6" />, 'gray', 'No conversions yet')
        )}
      </div>

      {/* Charts and Detailed Analytics - Always show structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        {analyticsData.hasData && analyticsData.monthlyTrends && analyticsData.monthlyTrends.length > 0 ? (
          renderTrendChart(analyticsData.monthlyTrends, 'Monthly Coffee Performance', 'newCoffees')
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Coffee Performance</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>No data yet</p>
                <p className="text-sm">Add coffees to see monthly trends</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Coffee Performance */}
        {analyticsData.hasData && analyticsData.monthlyTrends && analyticsData.monthlyTrends.length > 0 ? (
          renderTrendChart(analyticsData.monthlyTrends, 'Monthly Views', 'totalViews')
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Views</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-2" />
                <p>No data yet</p>
                <p className="text-sm">Add coffees to see view analytics</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Breakdowns - Always show structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Coffees */}
        {analyticsData.hasData && Object.keys(analyticsData.coffeeRatings).length > 0 ? (
          renderTopCoffees()
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Coffees</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-2" />
                <p>No ratings yet</p>
                <p className="text-sm">Add coffees and get reviews to see top performers</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Geographic Distribution */}
        {analyticsData.hasData && analyticsData.topCountries && analyticsData.topCountries.length > 0 ? (
          renderGeographicData()
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Coffee Origins by Country</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p>No geographic data yet</p>
                <p className="text-sm">Add coffees from different countries to see origins</p>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Current Plan Features */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your {currentTier.name} Plan Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTier.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
        
        {subscriptionTier !== 'enterprise' && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">{currentTier.upgradeMessage}</p>
            <button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
              Upgrade to {currentTier.upgradeTier?.charAt(0).toUpperCase() + currentTier.upgradeTier?.slice(1)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
