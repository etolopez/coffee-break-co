/**
 * Tier-Based Analytics Dashboard Component
 * Displays comprehensive analytics data filtered by subscription tier
 * Shows real business insights that coffee sellers care about
 * Integrates with phased launch strategy and subscription system
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Coffee, 
  Users, 
  DollarSign,
  CheckCircle,
  X,
  AlertTriangle,
  ArrowUpRight,
  Lock,
  Rocket,
  Crown,
  Eye,
  Star,
  MessageCircle,
  Share2,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  BarChart,
  PieChart,
  Activity,
  Bookmark,
  Phone
} from 'lucide-react';

// Import the subscription middleware functions
import { 
  getPhaseInfo, 
  getAvailableTiers, 
  isTierAvailable 
} from '../app/api/shared/subscription-middleware';

/**
 * Analytics data interface matching the API response
 */
interface AnalyticsData {
  // Coffee performance metrics
  totalCoffees?: number;
  averageRating?: number;
  totalReviews?: number;
  coffeeViews?: number;
  coffeeShares?: number;
  
  // Engagement metrics
  uniqueVisitors?: number;
  pageViews?: number;
  avgTimeOnPage?: number;
  bounceRate?: number;
  
  // Saved coffee analytics
  totalSavedCoffees?: number;
  savedCoffeesByCoffee?: Array<{
    coffeeId: string;
    coffeeName: string;
    savedCount: number;
  }>;
  savedCoffeesByUser?: Array<{
    userId: string;
    savedCount: number;
    lastSaved: string;
  }>;
  savedCoffeesTrends?: Array<{
    month: string;
    savedCount: number;
  }>;
  
  // Lead generation metrics
  totalLeads?: number;
  leadConversionRate?: number;
  contactClicks?: number;
  orderLinkClicks?: number;
  websiteVisits?: number;
  
  // Geographic data
  topCountries?: Array<{
    country: string;
    users: number;
    revenue: number;
  }>;
  
  // Monthly trends and breakdowns
  monthlyTrends?: Array<{
    month: string;
    savedCoffees: number;
    leads: number;
    engagement: number;
  }>;
  monthlyCoffees?: Array<{
    month: string;
    newCoffees: number;
    totalViews: number;
    avgRating: number;
  }>;
  monthlyEngagement?: Array<{
    month: string;
    pageViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
  }>;
  monthlyLeads?: Array<{
    month: string;
    contactClicks: number;
    orderLinkClicks: number;
    websiteVisits: number;
  }>;
  
  // Performance indicators
  kpis?: {
    mrr: number;
    arr: number;
    ltv: number;
    cac: number;
    paybackPeriod: number;
    netPromoterScore: number;
  };
  
  // Tier information
  tier?: string;
  dataRetentionMonths?: number;
  exportFormats?: string[];
}

/**
 * Props for the TierBasedAnalytics component
 */
interface TierBasedAnalyticsProps {
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'expired';
  sellerId?: string;
}

/**
 * Chart data interface for visualization components
 */
interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }>;
}

/**
 * Main analytics dashboard component
 */
export default function TierBasedAnalytics({ 
  subscriptionTier = 'free', 
  subscriptionStatus = 'active',
  sellerId
}: TierBasedAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('all');

  /**
   * Fetch analytics data from the API based on tier and filters
   */
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        tier: subscriptionTier,
        period: selectedPeriod,
        metric: selectedMetric
      });
      
      if (sellerId) {
        params.append('sellerId', sellerId);
      }
      
      const response = await fetch(`/api/admin/analytics?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to connect to analytics service');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh analytics data
   */
  const refreshData = () => {
    fetchAnalyticsData();
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    if (subscriptionStatus === 'active') {
      fetchAnalyticsData();
    }
  }, [subscriptionTier, selectedPeriod, selectedMetric, subscriptionStatus]);

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
    
    const chartData: ChartData = {
      labels: data.map(item => item.month),
      datasets: [{
        label: metric,
        data: data.map(item => item[metric] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }]
    };
    
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          {/* Simple bar chart visualization */}
          <div className="flex items-end space-x-2 h-48">
            {chartData.datasets[0].data.map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-blue-500 rounded-t"
                  style={{ height: `${(value / Math.max(...chartData.datasets[0].data)) * 100}%` }}
                />
                <span className="text-xs text-gray-500 mt-1">{chartData.labels[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render saved coffees breakdown
   */
  const renderSavedCoffeesBreakdown = () => {
    if (!analyticsData?.savedCoffeesByCoffee) return null;
    
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Saved Coffees</h3>
        <div className="space-y-3">
          {analyticsData.savedCoffeesByCoffee
            .sort((a, b) => b.savedCount - a.savedCount)
            .slice(0, 5)
            .map((coffee, index) => (
              <div key={coffee.coffeeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                  <span className="font-medium text-gray-900">{coffee.coffeeName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{coffee.savedCount} saves</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
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
    if (!analyticsData?.topCountries) return null;
    
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
        <div className="space-y-3">
          {analyticsData.topCountries.slice(0, 5).map((country, index) => (
            <div key={country.country} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">{country.country}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{country.users} users</div>
                <div className="text-xs text-gray-500">${country.revenue.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render export options based on tier
   */
  const renderExportOptions = () => {
    if (!analyticsData?.exportFormats || analyticsData.exportFormats.length === 0) return null;
    
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Analytics</h3>
        <div className="flex flex-wrap gap-3">
          {analyticsData.exportFormats.map(format => (
            <button
              key={format}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">{format.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Data retention: {analyticsData.dataRetentionMonths === -1 ? 'Unlimited' : `${analyticsData.dataRetentionMonths} months`}
        </p>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show upgrade prompt for free tier
  if (subscriptionTier === 'free') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Locked</h2>
          <p className="text-gray-600 mb-6">{currentTier.upgradeMessage}</p>
          <button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
            Upgrade to {currentTier.upgradeTier?.charAt(0).toUpperCase() + currentTier.upgradeTier?.slice(1)}
          </button>
        </div>
      </div>
    );
  }

  // Show analytics dashboard for paid tiers
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              subscriptionTier === 'basic' ? 'bg-blue-100 text-blue-600' :
              subscriptionTier === 'premium' ? 'bg-purple-100 text-purple-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              {subscriptionTier === 'basic' && <BarChart3 className="h-6 w-6" />}
              {subscriptionTier === 'premium' && <TrendingUp className="h-6 w-6" />}
              {subscriptionTier === 'enterprise' && <Crown className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">
                {currentTier.name} Plan • {subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            
            {subscriptionTier !== 'enterprise' && (
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                Upgrade to {currentTier.upgradeTier?.charAt(0).toUpperCase() + currentTier.upgradeTier?.slice(1)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
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
              <option value="geography">Geographic</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsData?.totalCoffees !== undefined && 
            renderMetricCard('Total Coffees', analyticsData.totalCoffees, <Coffee className="h-6 w-6" />, 'blue')}
          
          {analyticsData?.averageRating !== undefined && 
            renderMetricCard('Average Rating', analyticsData.averageRating.toFixed(1), <Star className="h-6 w-6" />, 'amber', 'out of 5')}
          
          {analyticsData?.totalReviews !== undefined && 
            renderMetricCard('Total Reviews', analyticsData.totalReviews, <MessageCircle className="h-6 w-6" />, 'green')}
          
          {analyticsData?.coffeeViews !== undefined && 
            renderMetricCard('Total Views', analyticsData.coffeeViews.toLocaleString(), <Eye className="h-6 w-6" />, 'purple')}
          
          {analyticsData?.totalSavedCoffees !== undefined && 
            renderMetricCard('Saved Coffees', analyticsData.totalSavedCoffees, <Bookmark className="h-6 w-6" />, 'indigo')}
          
          {analyticsData?.totalLeads !== undefined && 
            renderMetricCard('Total Leads', analyticsData.totalLeads, <Users className="h-6 w-6" />, 'emerald')}
          
          {analyticsData?.leadConversionRate !== undefined && 
            renderMetricCard('Conversion Rate', `${analyticsData.leadConversionRate}%`, <TrendingUp className="h-6 w-6" />, 'rose')}
          
          {analyticsData?.contactClicks !== undefined && 
            renderMetricCard('Contact Clicks', analyticsData.contactClicks, <Phone className="h-6 w-6" />, 'cyan')}
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          {analyticsData?.monthlyTrends && 
            renderTrendChart(analyticsData.monthlyTrends, 'Monthly Trends', 'engagement')}
          
          {/* Coffee Performance */}
          {analyticsData?.monthlyCoffees && 
            renderTrendChart(analyticsData.monthlyCoffees, 'Coffee Performance', 'totalViews')}
          
          {/* Engagement Metrics */}
          {analyticsData?.monthlyEngagement && 
            renderTrendChart(analyticsData.monthlyEngagement, 'Engagement Metrics', 'pageViews')}
          
          {/* Lead Generation */}
          {analyticsData?.monthlyLeads && 
            renderTrendChart(analyticsData.monthlyLeads, 'Lead Generation', 'contactClicks')}
        </div>

        {/* Detailed Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Saved Coffees Breakdown */}
          {renderSavedCoffeesBreakdown()}
          
          {/* Geographic Distribution */}
          {renderGeographicData()}
        </div>

        {/* Export Options */}
        {renderExportOptions()}

        {/* Current Plan Features */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your {currentTier.name} Plan Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTier.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
