/**
 * Subscription Tier Middleware
 * Handles tier-based access control and data filtering for analytics endpoints
 * Implements coffee upload limits and analytics access restrictions per subscription tier
 * 
 * PHASED LAUNCH STRATEGY:
 * Phase 1 (Months 1-3): Free tier only
 * Phase 2 (Months 4-6): Add Basic tier
 * Phase 3 (Months 7-9): Add Premium tier
 * Phase 4 (Months 10+): Add Enterprise tier
 */

// Import database-driven launch configuration
import { launchConfigDB } from './launch-config-db';

export interface SubscriptionTier {
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  coffeeLimit: number;
  analyticsAccess: 'none' | 'basic' | 'advanced' | 'full';
  exportFormats: string[];
  dataRetention: number; // months
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  price: number; // monthly price in USD
  available: boolean; // whether tier is available in current phase
}

/**
 * Get available tiers from database
 * Dynamically determined based on current phase
 */
export const getAvailableTiers = async (): Promise<string[]> => {
  try {
    return await launchConfigDB.getAvailableTiers();
  } catch (error) {
    console.error('Error getting available tiers:', error);
    return ['free']; // Fallback to Phase 1
  }
};

/**
 * Get subscription tier configuration from database
 * Dynamically determined based on current phase
 */
export const getSubscriptionTiers = async (): Promise<Record<string, SubscriptionTier>> => {
  try {
    const availableTiers = await getAvailableTiers();
    const tiers: Record<string, SubscriptionTier> = {};

    for (const tier of ['free', 'basic', 'premium', 'enterprise']) {
      const tierConfig = await launchConfigDB.getTierConfig(tier);
      if (tierConfig) {
        tiers[tier] = {
          tier: tier as any,
          coffeeLimit: tierConfig.coffeeLimit,
          analyticsAccess: tierConfig.analyticsAccess,
          exportFormats: tierConfig.exportFormats,
          dataRetention: tierConfig.dataRetention,
          supportLevel: tierConfig.supportLevel,
          price: tierConfig.price,
          available: availableTiers.includes(tier)
        };
      }
    }

    return tiers;
  } catch (error) {
    console.error('Error getting subscription tiers:', error);
    // Fallback to basic configuration with phase-based availability
    const currentPhase = 1; // Default to Phase 1
    
    return {
      free: {
        tier: 'free',
        coffeeLimit: 1,
        analyticsAccess: 'none',
        exportFormats: [],
        dataRetention: 0,
        supportLevel: 'community',
        price: 0,
        available: true // Always available
      },
      basic: {
        tier: 'basic',
        coffeeLimit: 5,
        analyticsAccess: 'basic',
        exportFormats: ['json'],
        dataRetention: 3,
        supportLevel: 'email',
        price: 30,
        available: currentPhase >= 2 // Available from Phase 2
      },
      premium: {
        tier: 'premium',
        coffeeLimit: 15,
        analyticsAccess: 'advanced',
        exportFormats: ['json', 'csv'],
        dataRetention: 12,
        supportLevel: 'priority',
        price: 80,
        available: currentPhase >= 3 // Available from Phase 3
      },
      enterprise: {
        tier: 'enterprise',
        coffeeLimit: -1,
        analyticsAccess: 'full',
        exportFormats: ['json', 'csv', 'excel', 'pdf'],
        dataRetention: -1,
        supportLevel: 'dedicated',
        price: 200,
        available: currentPhase >= 4 // Available from Phase 4
      }
    };
  }
};

/**
 * Phase detection based on database
 * Automatically determines current launch phase
 * @returns Current launch phase number (1-4)
 */
export const getCurrentPhase = async (): Promise<number> => {
  try {
    const progress = await launchConfigDB.getLaunchProgress();
    return progress?.currentPhase || 1;
  } catch (error) {
    console.error('Error getting current phase:', error);
    return 1; // Fallback to Phase 1
  }
};

/**
 * Validates tier availability based on current launch phase
 * @param tier - Tier to check availability for
 * @returns Whether the tier is available in current phase
 */
export const isTierAvailable = async (tier: string): Promise<boolean> => {
  try {
    return await launchConfigDB.isTierAvailable(tier);
  } catch (error) {
    console.error('Error checking tier availability:', error);
    return ['free', 'basic'].includes(tier); // Fallback to Phase 1
  }
};

/**
 * Gets phase information for display purposes
 * @returns Object with current phase and description
 */
export const getPhaseInfo = async () => {
  try {
    const currentPhase = await getCurrentPhase();
    const availableTiers = await getAvailableTiers();
    
    const phaseDescriptions = {
      1: "Currently launching with Free tier only. Basic, Premium, and Enterprise coming soon!",
      2: "Basic tier now available! Premium and Enterprise coming in Phase 3.",
      3: "Premium tier now available! Enterprise tier coming in Phase 4.",
      4: "All tiers and features are now available!"
    };
    
    return {
      currentPhase,
      description: phaseDescriptions[currentPhase as keyof typeof phaseDescriptions] || phaseDescriptions[4],
      availableTiers
    };
  } catch (error) {
    console.error('Error getting phase info:', error);
    return {
      currentPhase: 1,
      description: "Currently launching with Free tier only. Basic, Premium, and Enterprise coming soon!",
      availableTiers: ['free']
    };
  }
};

/**
 * User subscription context interface
 * Contains user information and subscription details
 */
export interface UserSubscriptionContext {
  userId: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: 'active' | 'inactive' | 'pending' | 'cancelled' | 'suspended';
  subscriptionExpiry?: string;
  coffeeCount: number;
  isActive: boolean;
}

/**
 * Analytics access control interface
 * Defines what analytics data a user can access
 */
export interface AnalyticsAccess {
  canAccessAnalytics: boolean;
  dataRetentionMonths: number;
  allowedMetrics: string[];
  exportFormats: string[];
  tier: string;
}

/**
 * Coffee upload validation result
 * Indicates whether a user can upload more coffees
 */
export interface CoffeeUploadValidation {
  canUpload: boolean;
  currentCount: number;
  limit: number;
  remaining: number;
  tier: string;
}

/**
 * Validates if a user can upload a new coffee based on their subscription tier
 * @param userContext - User's subscription context
 * @returns Validation result with upload permissions
 */
export function validateCoffeeUpload(userContext: UserSubscriptionContext): CoffeeUploadValidation {
  // For now, use fallback configuration until we implement async support
  const fallbackTiers = {
    free: { coffeeLimit: 1 },
    basic: { coffeeLimit: 5 },
    premium: { coffeeLimit: 15 },
    enterprise: { coffeeLimit: -1 }
  };
  
  const tier = fallbackTiers[userContext.subscriptionTier as keyof typeof fallbackTiers] || fallbackTiers.free;
  
  // Check if subscription is active
  if (userContext.subscriptionStatus !== 'active') {
    return {
      canUpload: false,
      currentCount: userContext.coffeeCount,
      limit: tier.coffeeLimit,
      remaining: 0,
      tier: userContext.subscriptionTier
    };
  }

  // Check coffee upload limits
  if (tier.coffeeLimit === -1) {
    // Unlimited tier
    return {
      canUpload: true,
      currentCount: userContext.coffeeCount,
      limit: -1,
      remaining: -1,
      tier: userContext.subscriptionTier
    };
  }

  const remaining = Math.max(0, tier.coffeeLimit - userContext.coffeeCount);
  const canUpload = remaining > 0;

  return {
    canUpload,
    currentCount: userContext.coffeeCount,
    limit: tier.coffeeLimit,
    remaining,
    tier: userContext.subscriptionTier
  };
}

/**
 * Determines analytics access level based on subscription tier
 * @param userContext - User's subscription context
 * @returns Analytics access permissions
 */
export function getAnalyticsAccess(userContext: UserSubscriptionContext): AnalyticsAccess {
  // For now, use fallback configuration until we implement async support
  const fallbackTiers = {
    free: { analyticsAccess: 'none', dataRetention: 0, exportFormats: [] },
    basic: { analyticsAccess: 'basic', dataRetention: 3, exportFormats: ['json'] },
    premium: { analyticsAccess: 'advanced', dataRetention: 12, exportFormats: ['json', 'csv'] },
    enterprise: { analyticsAccess: 'full', dataRetention: -1, exportFormats: ['json', 'csv', 'excel', 'pdf'] }
  };
  
  const tier = fallbackTiers[userContext.subscriptionTier as keyof typeof fallbackTiers] || fallbackTiers.free;
  
  // Check if subscription is active
  if (userContext.subscriptionStatus !== 'active') {
    return {
      canAccessAnalytics: false,
      dataRetentionMonths: 0,
      allowedMetrics: [],
      exportFormats: [],
      tier: userContext.subscriptionTier
    };
  }

  // Define allowed metrics based on tier
  let allowedMetrics: string[] = [];
  switch (tier.analyticsAccess) {
    case 'none':
      allowedMetrics = [];
      break;
    case 'basic':
      allowedMetrics = ['coffees', 'engagement', 'leads'];
      break;
    case 'advanced':
      allowedMetrics = ['coffees', 'engagement', 'leads', 'geography', 'activity', 'performance', 'savedCoffees'];
      break;
    case 'full':
      allowedMetrics = ['coffees', 'engagement', 'leads', 'geography', 'activity', 'performance', 'savedCoffees', 'kpis', 'trends', 'insights'];
      break;
  }

  return {
    canAccessAnalytics: tier.analyticsAccess !== 'none',
    dataRetentionMonths: tier.dataRetention,
    allowedMetrics,
    exportFormats: tier.exportFormats,
    tier: userContext.subscriptionTier
  };
}

/**
 * Filters analytics data based on user's subscription tier
 * @param data - Raw analytics data
 * @param access - User's analytics access permissions
 * @returns Filtered analytics data
 */
export function filterAnalyticsData(data: any, access: AnalyticsAccess): any {
  if (!access.canAccessAnalytics) {
    return { error: 'Upgrade to access analytics' };
  }

  const filteredData: any = {};

  // Filter by allowed metrics
  if (access.allowedMetrics.includes('coffees')) {
    filteredData.totalCoffees = data.totalCoffees;
    filteredData.averageRating = data.averageRating;
    filteredData.totalReviews = data.totalReviews;
    filteredData.coffeeViews = data.coffeeViews;
    filteredData.coffeeShares = data.coffeeShares;
  }

  if (access.allowedMetrics.includes('engagement')) {
    filteredData.uniqueVisitors = data.uniqueVisitors;
    filteredData.pageViews = data.pageViews;
    filteredData.avgTimeOnPage = data.avgTimeOnPage;
    filteredData.bounceRate = data.bounceRate;
  }

  if (access.allowedMetrics.includes('savedCoffees')) {
    // Premium and Enterprise get detailed saved coffee analytics
    filteredData.totalSavedCoffees = data.totalSavedCoffees;
    filteredData.savedCoffeesByCoffee = data.savedCoffeesByCoffee;
    filteredData.savedCoffeesByUser = data.savedCoffeesByUser;
    filteredData.savedCoffeesTrends = data.savedCoffeesTrends;
  } else if (access.allowedMetrics.includes('engagement')) {
    // Basic tier only gets total count
    filteredData.totalSavedCoffees = data.totalSavedCoffees;
  }

  if (access.allowedMetrics.includes('leads')) {
    filteredData.totalLeads = data.totalLeads;
    filteredData.leadConversionRate = data.leadConversionRate;
    filteredData.contactClicks = data.contactClicks;
    filteredData.orderLinkClicks = data.orderLinkClicks;
    filteredData.websiteVisits = data.websiteVisits;
  }

  if (access.allowedMetrics.includes('subscriptions')) {
    filteredData.totalSubscriptions = data.totalSubscriptions;
    filteredData.activeSubscriptions = data.activeSubscriptions;
    filteredData.retentionRate = data.retentionRate;
    filteredData.churnRate = data.churnRate;
    filteredData.tierDistribution = data.tierDistribution;
  }

  if (access.allowedMetrics.includes('geography')) {
    filteredData.topCountries = data.topCountries;
  }

  if (access.allowedMetrics.includes('activity')) {
    filteredData.recentActivity = data.recentActivity;
  }

  if (access.allowedMetrics.includes('kpis')) {
    filteredData.kpis = data.kpis;
  }

  if (access.allowedMetrics.includes('trends')) {
    // Filter monthly trends based on data retention
    if (data.monthlyTrends && access.dataRetentionMonths > 0) {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - access.dataRetentionMonths);
      
      filteredData.monthlyTrends = data.monthlyTrends.filter((trend: any) => {
        const trendDate = new Date(trend.month + ' 1, ' + new Date().getFullYear());
        return trendDate >= cutoffDate;
      });
    } else {
      filteredData.monthlyTrends = data.monthlyTrends;
    }
  }

  // Add monthly breakdowns for each metric based on tier access
  if (access.allowedMetrics.includes('monthlyBreakdowns')) {
    filteredData.monthlyBreakdowns = {
      coffees: data.monthlyCoffees || [],
      engagement: data.monthlyEngagement || [],
      leads: data.monthlyLeads || [],
      savedCoffees: data.monthlySavedCoffees || []
    };
  }

  // Add tier information
  filteredData.tier = access.tier;
  filteredData.dataRetentionMonths = access.dataRetentionMonths;
  filteredData.exportFormats = access.exportFormats;

  return filteredData;
}

/**
 * Validates export format based on user's subscription tier
 * @param format - Requested export format
 * @param access - User's analytics access permissions
 * @returns Whether the export format is allowed
 */
export function validateExportFormat(format: string, access: AnalyticsAccess): boolean {
  return access.exportFormats.includes(format.toLowerCase());
}

/**
 * Creates a mock user context for testing purposes
 * In production, this would come from your authentication system
 * @param tier - Subscription tier to mock
 * @returns Mock user subscription context
 */
export function createMockUserContext(tier: string = 'basic'): UserSubscriptionContext {
  return {
    userId: 'mock-user-123',
    email: 'user@example.com',
    subscriptionTier: tier,
    subscriptionStatus: 'active',
    subscriptionExpiry: '2025-12-31',
    coffeeCount: 2,
    isActive: true
  };
}
