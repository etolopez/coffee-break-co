import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  getAnalyticsAccess, 
  filterAnalyticsData, 
  validateExportFormat,
  createMockUserContext,
  UserSubscriptionContext 
} from '../../shared/subscription-middleware';

// Simple logging for admin operations
const log = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || '')
};

// Function to load real sellers data
const loadSellersFromFile = async () => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'sellers-persistent.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const sellersData = JSON.parse(data);
    return Object.values(sellersData);
  } catch (error) {
    log.warn('⚠️ Could not load sellers from file', error);
    return [];
  }
};

// Function to load countries from coffee entries
const loadCountriesFromCoffeeEntries = async () => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'coffee-entries-persistent.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const coffeeData = JSON.parse(data);
    
    // Extract unique countries from coffee entries
    const countries = new Map<string, { count: number, origins: string[] }>();
    
    Object.values(coffeeData).forEach((entry: any) => {
      if (entry.origin) {
        // Extract country from origin (e.g., "Monteverde, Costa Rica" -> "Costa Rica")
        const parts = entry.origin.split(',').map((part: string) => part.trim());
        let country: string;
        
        if (parts.length > 1) {
          country = parts[parts.length - 1]; // Last part is usually the country
        } else {
          country = parts[0]; // Single part like "Guatemala"
        }
        
        if (!countries.has(country)) {
          countries.set(country, { count: 0, origins: [] });
        }
        
        const countryData = countries.get(country)!;
        countryData.count++;
        if (!countryData.origins.includes(entry.origin)) {
          countryData.origins.push(entry.origin);
        }
      }
    });
    
    log.info(`🌍 Found ${countries.size} countries from coffee entries`);
    return countries;
  } catch (error) {
    log.warn('⚠️ Could not load coffee entries', error);
    return new Map();
  }
};

// Function to calculate real analytics
const calculateRealAnalytics = async () => {
  try {
    const sellers = await loadSellersFromFile();
    const countries = await loadCountriesFromCoffeeEntries();
    
    // Calculate revenue based on subscription tiers (excluding setup fees)
    const subscriptionTiers: Record<string, number> = {
      free: 0,
      basic: 29.99,
      premium: 79.99,
      enterprise: 199.99
    };
    
    const monthlyRevenue = sellers.reduce((total: number, seller: any) => {
      const tier = seller.subscriptionTier || 'free';
      return total + (subscriptionTiers[tier] || 0);
    }, 0);
    
    const totalRevenue = monthlyRevenue * 12; // Annual projection
    
    // Count subscriptions by tier
    const tierCounts = sellers.reduce((acc, seller: any) => {
      const tier = seller.subscriptionTier || 'free';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate tier distribution
    const tierDistribution = Object.entries(tierCounts).map(([tier, count]) => {
      const monthlyRevenue = (subscriptionTiers[tier] || 0) * (count as number);
      const annualRevenue = monthlyRevenue * 12;
      return {
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        count,
        revenue: annualRevenue
      };
    });
    
    // Convert countries to top countries format
    const topCountries = Array.from(countries.entries())
      .map(([country, data]) => ({
        country,
        users: data.count,
        revenue: (data.count as number) * 29.99 * 12, // Estimate based on basic tier
        origins: data.origins
      }))
      .sort((a, b) => (b.users as number) - (a.users as number))
      .slice(0, 10); // Show top 10 countries
    
    return {
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions: sellers.length,
      totalUsers: sellers.length,
      userGrowth: 0, // No historical data yet
      revenueGrowth: 0, // No historical data yet
      monthlyGrowth: 0, // No historical data yet
      retentionRate: 100, // All current sellers are active
      recentActivity: [
        {
          id: '1',
          type: 'new_seller',
          description: `${sellers.length} sellers currently active`,
          timestamp: new Date().toISOString(),
          impact: `$${monthlyRevenue.toFixed(2)}/month revenue`
        }
      ],
      topCountries,
      tierDistribution,
      totalCountries: countries.size,
      totalCoffees: Object.keys(countries).reduce((total, country) => {
        return total + (countries.get(country)?.count || 0);
      }, 0)
    };
  } catch (error) {
    log.error('❌ Error calculating real analytics', error);
    return null;
  }
};

/**
 * GET /api/admin/analytics
 * Retrieve comprehensive analytics data
 */
export async function GET(request: NextRequest) {
  try {
    log.info('🔍 Admin: Fetching analytics data');
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const metric = searchParams.get('metric') || 'all';
    const subscriptionTier = searchParams.get('tier') || 'basic'; // Get tier from query params
    
    // TODO: In production, get user context from authentication system
    // For now, we'll use a mock user context - replace with real user data
    const userContext: UserSubscriptionContext = createMockUserContext(subscriptionTier);
    
    // Get analytics access based on subscription tier
    const analyticsAccess = getAnalyticsAccess(userContext);
    
    if (!analyticsAccess.canAccessAnalytics) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Analytics access not available for your subscription tier',
          tier: analyticsAccess.tier,
          upgradeMessage: 'Upgrade to a higher tier to access analytics'
        },
        { status: 403 }
      );
    }
    
    // In a real application, you would:
    // 1. Query your database for real-time data
    // 2. Calculate metrics based on the requested period
    // 3. Apply filters and aggregations
    // 4. Return processed analytics data
    
    let analyticsData = { ...mockAnalytics };
    
    // Filter by specific metric if requested
    if (metric !== 'all') {
      switch (metric) {
        case 'coffees':
          analyticsData = {
            totalCoffees: mockAnalytics.totalCoffees,
            averageRating: mockAnalytics.averageRating,
            totalReviews: mockAnalytics.totalReviews,
            coffeeViews: mockAnalytics.coffeeViews,
            coffeeShares: mockAnalytics.coffeeShares,
            // Add other required properties with default values
            uniqueVisitors: 0,
            pageViews: 0,
            avgTimeOnPage: 0,
            bounceRate: 0,
            totalSavedCoffees: 0,
            savedCoffeesByCoffee: [],
            savedCoffeesByUser: [],
            savedCoffeesTrends: [],
            totalLeads: 0,
            leadConversionRate: 0,
            contactClicks: 0,
            orderLinkClicks: 0,
            websiteVisits: 0,
            topCountries: [],
            recentActivity: [],
            kpis: { mrr: 0, arr: 0, ltv: 0, cac: 0, paybackPeriod: 0, netPromoterScore: 0 },
            tierDistribution: [],
            monthlyTrends: [],
            monthlyCoffees: [],
            monthlyEngagement: [],
            monthlyLeads: [],
            monthlySavedCoffees: []
          };
          break;
        case 'engagement':
          analyticsData = {
            uniqueVisitors: mockAnalytics.uniqueVisitors,
            pageViews: mockAnalytics.pageViews,
            avgTimeOnPage: mockAnalytics.avgTimeOnPage,
            bounceRate: mockAnalytics.bounceRate,
            totalSavedCoffees: mockAnalytics.totalSavedCoffees,
            // Add other required properties with default values
            totalCoffees: 0,
            averageRating: 0,
            totalReviews: 0,
            coffeeViews: 0,
            coffeeShares: 0,
            savedCoffeesByCoffee: [],
            savedCoffeesByUser: [],
            savedCoffeesTrends: [],
            totalLeads: 0,
            leadConversionRate: 0,
            contactClicks: 0,
            orderLinkClicks: 0,
            websiteVisits: 0,
            topCountries: [],
            recentActivity: [],
            kpis: { mrr: 0, arr: 0, ltv: 0, cac: 0, paybackPeriod: 0, netPromoterScore: 0 },
            tierDistribution: [],
            monthlyTrends: [],
            monthlyCoffees: [],
            monthlyEngagement: [],
            monthlyLeads: [],
            monthlySavedCoffees: []
          };
          break;
        case 'leads':
          analyticsData = {
            totalLeads: mockAnalytics.totalLeads,
            leadConversionRate: mockAnalytics.leadConversionRate,
            contactClicks: mockAnalytics.contactClicks,
            orderLinkClicks: mockAnalytics.orderLinkClicks,
            websiteVisits: mockAnalytics.websiteVisits,
            // Add other required properties with default values
            totalCoffees: 0,
            averageRating: 0,
            totalReviews: 0,
            coffeeViews: 0,
            coffeeShares: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            avgTimeOnPage: 0,
            bounceRate: 0,
            totalSavedCoffees: 0,
            savedCoffeesByCoffee: [],
            savedCoffeesByUser: [],
            savedCoffeesTrends: [],
            topCountries: [],
            recentActivity: [],
            kpis: { mrr: 0, arr: 0, ltv: 0, cac: 0, paybackPeriod: 0, netPromoterScore: 0 },
            tierDistribution: [],
            monthlyTrends: [],
            monthlyCoffees: [],
            monthlyEngagement: [],
            monthlyLeads: [],
            monthlySavedCoffees: []
          };
          break;
        case 'geography':
          analyticsData = {
            topCountries: mockAnalytics.topCountries,
            // Add other required properties with default values
            totalCoffees: 0,
            averageRating: 0,
            totalReviews: 0,
            coffeeViews: 0,
            coffeeShares: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            avgTimeOnPage: 0,
            bounceRate: 0,
            totalSavedCoffees: 0,
            savedCoffeesByCoffee: [],
            savedCoffeesByUser: [],
            savedCoffeesTrends: [],
            totalLeads: 0,
            leadConversionRate: 0,
            contactClicks: 0,
            orderLinkClicks: 0,
            websiteVisits: 0,
            recentActivity: [],
            kpis: { mrr: 0, arr: 0, ltv: 0, cac: 0, paybackPeriod: 0, netPromoterScore: 0 },
            tierDistribution: [],
            monthlyTrends: [],
            monthlyCoffees: [],
            monthlyEngagement: [],
            monthlyLeads: [],
            monthlySavedCoffees: []
          };
          break;
        case 'activity':
          analyticsData = {
            recentActivity: mockAnalytics.recentActivity,
            // Add other required properties with default values
            totalCoffees: 0,
            averageRating: 0,
            totalReviews: 0,
            coffeeViews: 0,
            coffeeShares: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            avgTimeOnPage: 0,
            bounceRate: 0,
            totalSavedCoffees: 0,
            savedCoffeesByCoffee: [],
            savedCoffeesByUser: [],
            savedCoffeesTrends: [],
            totalLeads: 0,
            leadConversionRate: 0,
            contactClicks: 0,
            orderLinkClicks: 0,
            websiteVisits: 0,
            topCountries: [],
            kpis: { mrr: 0, arr: 0, ltv: 0, cac: 0, paybackPeriod: 0, netPromoterScore: 0 },
            tierDistribution: [],
            monthlyTrends: [],
            monthlyCoffees: [],
            monthlyEngagement: [],
            monthlyLeads: [],
            monthlySavedCoffees: []
          };
          break;
        case 'performance':
          analyticsData = {
            leadConversionRate: mockAnalytics.leadConversionRate,
            avgTimeOnPage: mockAnalytics.avgTimeOnPage,
            bounceRate: mockAnalytics.bounceRate,
            // Add other required properties with default values
            totalCoffees: 0,
            averageRating: 0,
            totalReviews: 0,
            coffeeViews: 0,
            coffeeShares: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            totalSavedCoffees: 0,
            savedCoffeesByCoffee: [],
            savedCoffeesByUser: [],
            savedCoffeesTrends: [],
            totalLeads: 0,
            contactClicks: 0,
            orderLinkClicks: 0,
            websiteVisits: 0,
            topCountries: [],
            recentActivity: [],
            kpis: { mrr: 0, arr: 0, ltv: 0, cac: 0, paybackPeriod: 0, netPromoterScore: 0 },
            tierDistribution: [],
            monthlyTrends: [],
            monthlyCoffees: [],
            monthlyEngagement: [],
            monthlyLeads: [],
            monthlySavedCoffees: []
          };
          break;
        
        case 'savedCoffees':
          analyticsData = {
            totalSavedCoffees: mockAnalytics.totalSavedCoffees,
            savedCoffeesByCoffee: mockAnalytics.savedCoffeesByCoffee,
            savedCoffeesByUser: mockAnalytics.savedCoffeesByUser,
            savedCoffeesTrends: mockAnalytics.savedCoffeesTrends,
            // Add other required properties with default values
            totalCoffees: 0,
            averageRating: 0,
            totalReviews: 0,
            coffeeViews: 0,
            coffeeShares: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            avgTimeOnPage: 0,
            bounceRate: 0,
            totalLeads: 0,
            leadConversionRate: 0,
            contactClicks: 0,
            orderLinkClicks: 0,
            websiteVisits: 0,
            topCountries: [],
            recentActivity: [],
            kpis: { mrr: 0, arr: 0, ltv: 0, cac: 0, paybackPeriod: 0, netPromoterScore: 0 },
            tierDistribution: [],
            monthlyTrends: [],
            monthlyCoffees: [],
            monthlyEngagement: [],
            monthlyLeads: [],
            monthlySavedCoffees: []
          };
          break;
        case 'kpis':
          analyticsData = {
            kpis: mockAnalytics.kpis,
            // Add other required properties with default values
            totalCoffees: 0,
            averageRating: 0,
            totalReviews: 0,
            coffeeViews: 0,
            coffeeShares: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            avgTimeOnPage: 0,
            bounceRate: 0,
            totalSavedCoffees: 0,
            savedCoffeesByCoffee: [],
            savedCoffeesByUser: [],
            savedCoffeesTrends: [],
            totalLeads: 0,
            leadConversionRate: 0,
            contactClicks: 0,
            orderLinkClicks: 0,
            websiteVisits: 0,
            topCountries: [],
            recentActivity: [],
            tierDistribution: [],
            monthlyTrends: [],
            monthlyCoffees: [],
            monthlyEngagement: [],
            monthlyLeads: [],
            monthlySavedCoffees: []
          };
          break;
      }
    }
    
    // Apply tier-based filtering to the analytics data
    analyticsData = filterAnalyticsData(analyticsData, analyticsAccess);
    
    // Add tier information to the response
    (analyticsData as any).tier = analyticsAccess.tier;
    (analyticsData as any).dataRetentionMonths = analyticsAccess.dataRetentionMonths;
    (analyticsData as any).exportFormats = analyticsAccess.exportFormats;
    
    log.info('✅ Admin: Analytics data retrieved and filtered successfully', { 
      tier: analyticsAccess.tier,
      allowedMetrics: analyticsAccess.allowedMetrics 
    });
    
    return NextResponse.json({
      success: true,
      data: analyticsData,
      period,
      metric,
      tier: analyticsAccess.tier,
      dataRetentionMonths: analyticsAccess.dataRetentionMonths,
      exportFormats: analyticsAccess.exportFormats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    log.error('❌ Admin: Error fetching analytics', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/analytics/export
 * Export analytics data in various formats
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format = 'json', period = 'monthly', metrics = ['all'], tier = 'basic' } = body;
    
    log.info('🔍 Admin: Exporting analytics data', { format, period, metrics, tier });
    
    // TODO: In production, get user context from authentication system
    // For now, we'll use a mock user context - replace with real user data
    const userContext: UserSubscriptionContext = createMockUserContext(tier);
    
    // Get analytics access based on subscription tier
    const analyticsAccess = getAnalyticsAccess(userContext);
    
    if (!analyticsAccess.canAccessAnalytics) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Analytics access not available for your subscription tier',
          tier: analyticsAccess.tier,
          upgradeMessage: 'Upgrade to a higher tier to access analytics'
        },
        { status: 403 }
      );
    }
    
    // Validate export format based on subscription tier
    if (!validateExportFormat(format, analyticsAccess)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Upgrade to access ${format.toUpperCase()} export format`,
          tier: analyticsAccess.tier,
          allowedFormats: analyticsAccess.exportFormats,
          upgradeMessage: 'Upgrade to a higher tier to access more export formats'
        },
        { status: 403 }
      );
    }
    
    // In a real application, you would:
    // 1. Generate the requested format (CSV, Excel, PDF, etc.)
    // 2. Apply the requested filters and time periods
    // 3. Return the file or data in the requested format
    
    let exportData = mockAnalytics;
    
    // Filter by period
    if (period === 'yearly') {
      exportData = {
        ...mockAnalytics,
        monthlyTrends: mockAnalytics.monthlyTrends
      };
    } else if (period === 'quarterly') {
      exportData = {
        ...mockAnalytics,
        monthlyTrends: mockAnalytics.monthlyTrends.slice(-3)
      };
    }
    
    // Filter by specific metrics
    if (!metrics.includes('all')) {
      const filteredData: any = {};
      metrics.forEach((metric: string) => {
        if (mockAnalytics[metric as keyof typeof mockAnalytics]) {
          filteredData[metric] = mockAnalytics[metric as keyof typeof mockAnalytics];
        }
      });
      exportData = filteredData;
    }
    
    log.info('✅ Admin: Analytics data exported successfully', { 
      tier: analyticsAccess.tier,
      format: format 
    });
    
    return NextResponse.json({
      success: true,
      data: exportData,
      format,
      period,
      metrics,
      tier: analyticsAccess.tier,
      allowedFormats: analyticsAccess.exportFormats,
      exportTimestamp: new Date().toISOString(),
      message: `Analytics data exported successfully in ${format.toUpperCase()} format for ${analyticsAccess.tier} tier`
    });
    
  } catch (error) {
    log.error('❌ Admin: Error exporting analytics', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}
