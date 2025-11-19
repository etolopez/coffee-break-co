/**
 * Subscription Security & Management System
 * Handles expired/cancelled subscriptions, data access control, and security measures
 * Implements graceful degradation and data privacy compliance
 */

import { UserSubscriptionContext } from './subscription-middleware';

export interface SubscriptionSecurityConfig {
  gracePeriodDays: number;
  dataRetentionDays: number;
  maxFailedPayments: number;
  autoArchiveAfterDays: number;
}

export interface SecurityCheckResult {
  isAccessible: boolean;
  reason?: string;
  gracePeriodRemaining?: number;
  requiresUpgrade: boolean;
  dataAccess: 'full' | 'readonly' | 'none';
  actions: string[];
}

export interface DataPrivacyConfig {
  anonymizeAfterDays: number;
  deleteAfterDays: number;
  exportDataRetention: number;
  auditLogRetention: number;
}

/**
 * Default security configuration
 * Adjust these values based on your business requirements
 */
export const DEFAULT_SECURITY_CONFIG: SubscriptionSecurityConfig = {
  gracePeriodDays: 7,           // 7 days grace period after payment failure
  dataRetentionDays: 30,        // Keep data for 30 days after cancellation
  maxFailedPayments: 3,         // Block access after 3 failed payments
  autoArchiveAfterDays: 90      // Archive data after 90 days of inactivity
};

/**
 * Default data privacy configuration
 * Compliant with GDPR and other privacy regulations
 */
export const DEFAULT_PRIVACY_CONFIG: DataPrivacyConfig = {
  anonymizeAfterDays: 30,       // Anonymize personal data after 30 days
  deleteAfterDays: 90,          // Delete data after 90 days
  exportDataRetention: 7,       // Keep export data for 7 days
  auditLogRetention: 365        // Keep audit logs for 1 year
};

/**
 * Subscription status security levels
 * Defines what access is allowed at each subscription state
 */
export const SUBSCRIPTION_SECURITY_LEVELS = {
  active: {
    analytics: 'full',
    coffeeUploads: 'full',
    dataExport: 'full',
    apiAccess: 'full',
    gracePeriod: false
  },
  pending: {
    analytics: 'readonly',
    coffeeUploads: 'blocked',
    dataExport: 'blocked',
    apiAccess: 'limited',
    gracePeriod: false
  },
  grace_period: {
    analytics: 'readonly',
    coffeeUploads: 'blocked',
    dataExport: 'blocked',
    apiAccess: 'limited',
    gracePeriod: true
  },
  expired: {
    analytics: 'none',
    coffeeUploads: 'blocked',
    dataExport: 'blocked',
    apiAccess: 'none',
    gracePeriod: false
  },
  cancelled: {
    analytics: 'none',
    coffeeUploads: 'blocked',
    dataExport: 'blocked',
    apiAccess: 'none',
    gracePeriod: false
  },
  suspended: {
    analytics: 'none',
    coffeeUploads: 'blocked',
    dataExport: 'blocked',
    apiAccess: 'none',
    gracePeriod: false
  }
};

/**
 * Check if a user has access to specific features based on subscription status
 * @param userContext - User's subscription context
 * @param feature - Feature to check access for
 * @param config - Security configuration
 * @returns Security check result with access details
 */
export function checkFeatureAccess(
  userContext: UserSubscriptionContext,
  feature: 'analytics' | 'coffeeUploads' | 'dataExport' | 'apiAccess',
  config: SubscriptionSecurityConfig = DEFAULT_SECURITY_CONFIG
): SecurityCheckResult {
  const now = new Date();
  const subscriptionExpiry = userContext.subscriptionExpiry ? new Date(userContext.subscriptionExpiry) : null;
  
  // Check if subscription is expired
  if (subscriptionExpiry && now > subscriptionExpiry) {
    const daysExpired = Math.floor((now.getTime() - subscriptionExpiry.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check grace period
    if (daysExpired <= config.gracePeriodDays) {
      return {
        isAccessible: false,
        reason: `Subscription expired ${daysExpired} days ago. Grace period ends in ${config.gracePeriodDays - daysExpired} days.`,
        gracePeriodRemaining: config.gracePeriodDays - daysExpired,
        requiresUpgrade: true,
        dataAccess: 'readonly',
        actions: ['Upgrade subscription', 'Contact support']
      };
    }
    
    // Grace period expired
    return {
      isAccessible: false,
      reason: `Subscription expired ${daysExpired} days ago. Grace period has ended.`,
      requiresUpgrade: true,
      dataAccess: 'none',
      actions: ['Upgrade subscription', 'Contact support', 'Data will be archived soon']
    };
  }
  
  // Check subscription status
  switch (userContext.subscriptionStatus) {
    case 'active':
      return {
        isAccessible: true,
        requiresUpgrade: false,
        dataAccess: 'full',
        actions: []
      };
      
    case 'pending':
      return {
        isAccessible: false,
        reason: 'Payment is pending. Please complete payment to restore access.',
        requiresUpgrade: false,
        dataAccess: 'readonly',
        actions: ['Complete payment', 'Contact support']
      };
      
    case 'cancelled':
      return {
        isAccessible: false,
        reason: 'Subscription has been cancelled. Upgrade to restore access.',
        requiresUpgrade: true,
        dataAccess: 'none',
        actions: ['Upgrade subscription', 'Contact support']
      };
      
    case 'suspended':
      return {
        isAccessible: false,
        reason: 'Account has been suspended due to policy violations.',
        requiresUpgrade: false,
        dataAccess: 'none',
        actions: ['Contact support', 'Review account status']
      };
      
    default:
      return {
        isAccessible: false,
        reason: 'Unknown subscription status. Please contact support.',
        requiresUpgrade: false,
        dataAccess: 'none',
        actions: ['Contact support']
      };
  }
}

/**
 * Handle subscription expiration and implement graceful degradation
 * @param userContext - User's subscription context
 * @param config - Security configuration
 * @returns Actions to take for the user
 */
export function handleSubscriptionExpiration(
  userContext: UserSubscriptionContext,
  config: SubscriptionSecurityConfig = DEFAULT_SECURITY_CONFIG
): {
  immediateActions: string[];
  gracePeriodActions: string[];
  longTermActions: string[];
  dataHandling: string[];
} {
  const now = new Date();
  const subscriptionExpiry = userContext.subscriptionExpiry ? new Date(userContext.subscriptionExpiry) : null;
  
  if (!subscriptionExpiry || now <= subscriptionExpiry) {
    return {
      immediateActions: [],
      gracePeriodActions: [],
      longTermActions: [],
      dataHandling: []
    };
  }
  
  const daysExpired = Math.floor((now.getTime() - subscriptionExpiry.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    immediateActions: [
      'Block new coffee uploads',
      'Restrict analytics access',
      'Disable data exports',
      'Send expiration notification'
    ],
    
    gracePeriodActions: daysExpired <= config.gracePeriodDays ? [
      'Allow read-only access to existing data',
      'Show grace period countdown',
      'Send payment reminders',
      'Offer upgrade incentives'
    ] : [],
    
    longTermActions: daysExpired > config.gracePeriodDays ? [
      'Archive user data',
      'Remove API access',
      'Send final upgrade offer',
      'Schedule data deletion'
    ] : [],
    
    dataHandling: [
      `Data will be archived after ${config.gracePeriodDays} days`,
      `Data will be deleted after ${config.dataRetentionDays} days`,
      'User can export their data during grace period',
      'Analytics data will be anonymized'
    ]
  };
}

/**
 * Implement data privacy measures for expired subscriptions
 * @param userContext - User's subscription context
 * @param config - Privacy configuration
 * @returns Data privacy actions
 */
export function implementDataPrivacy(
  userContext: UserSubscriptionContext,
  config: DataPrivacyConfig = DEFAULT_PRIVACY_CONFIG
): {
  anonymizeData: boolean;
  deleteData: boolean;
  exportData: boolean;
  retentionPeriod: number;
  actions: string[];
} {
  const now = new Date();
  const subscriptionExpiry = userContext.subscriptionExpiry ? new Date(userContext.subscriptionExpiry) : null;
  
  if (!subscriptionExpiry) {
    return {
      anonymizeData: false,
      deleteData: false,
      exportData: true,
      retentionPeriod: 0,
      actions: []
    };
  }
  
  const daysExpired = Math.floor((now.getTime() - subscriptionExpiry.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    anonymizeData: daysExpired >= config.anonymizeAfterDays,
    deleteData: daysExpired >= config.deleteAfterDays,
    exportData: daysExpired <= config.exportDataRetention,
    retentionPeriod: Math.max(0, config.deleteAfterDays - daysExpired),
    actions: daysExpired >= config.deleteAfterDays ? [
      'Schedule immediate data deletion',
      'Remove all personal identifiers',
      'Archive aggregated analytics only',
      'Send final deletion notification'
    ] : daysExpired >= config.anonymizeAfterDays ? [
      'Anonymize personal data',
      'Remove email addresses',
      'Remove names and identifiers',
      'Keep aggregated analytics'
    ] : [
      'Allow data export',
      'Maintain data integrity',
      'Send privacy reminders',
      'Offer data recovery options'
    ]
  };
}

/**
 * Generate security audit log entry
 * @param userContext - User's subscription context
 * @param action - Action performed
 * @param result - Result of the action
 * @returns Audit log entry
 */
export function generateAuditLog(
  userContext: UserSubscriptionContext,
  action: string,
  result: 'success' | 'denied' | 'error'
): {
  timestamp: string;
  userId: string;
  action: string;
  result: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  ipAddress?: string;
  userAgent?: string;
} {
  return {
    timestamp: new Date().toISOString(),
    userId: userContext.userId,
    action,
    result,
    subscriptionStatus: userContext.subscriptionStatus,
    subscriptionTier: userContext.subscriptionTier,
    // Note: ipAddress and userAgent should be passed from the request context
  };
}

/**
 * Check if user should be rate limited based on subscription tier
 * @param userContext - User's subscription context
 * @param currentUsage - Current API usage count
 * @returns Rate limiting configuration
 */
export function getRateLimitConfig(userContext: UserSubscriptionContext): {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
} {
  const tierLimits = {
    free: { requestsPerMinute: 10, requestsPerHour: 100, requestsPerDay: 1000, burstLimit: 5 },
    basic: { requestsPerMinute: 30, requestsPerHour: 300, requestsPerDay: 3000, burstLimit: 15 },
    premium: { requestsPerMinute: 100, requestsPerHour: 1000, requestsPerDay: 10000, burstLimit: 50 },
    enterprise: { requestsPerMinute: 500, requestsPerHour: 5000, requestsPerDay: 50000, burstLimit: 250 }
  };
  
  return tierLimits[userContext.subscriptionTier as keyof typeof tierLimits] || tierLimits.free;
}

/**
 * Emergency security measures for compromised accounts
 * @param userContext - User's subscription context
 * @param securityLevel - Security threat level
 * @returns Emergency actions to take
 */
export function emergencySecurityMeasures(
  userContext: UserSubscriptionContext,
  securityLevel: 'low' | 'medium' | 'high' | 'critical'
): {
  immediateActions: string[];
  accountStatus: string;
  dataProtection: string[];
  recoverySteps: string[];
} {
  const measures = {
    low: {
      immediateActions: ['Log suspicious activity', 'Send security alert'],
      accountStatus: 'Active with monitoring',
      dataProtection: ['Enhanced logging', 'Activity monitoring'],
      recoverySteps: ['Review recent activity', 'Change password if needed']
    },
    medium: {
      immediateActions: ['Temporarily restrict access', 'Require 2FA verification'],
      accountStatus: 'Restricted access',
      dataProtection: ['Enhanced logging', 'IP restrictions', 'Session invalidation'],
      recoverySteps: ['Verify identity', 'Review recent activity', 'Enable 2FA']
    },
    high: {
      immediateActions: ['Suspend account', 'Freeze all operations', 'Alert security team'],
      accountStatus: 'Suspended',
      dataProtection: ['Complete access block', 'Data encryption', 'Audit trail'],
      recoverySteps: ['Contact support immediately', 'Provide identity verification', 'Security review']
    },
    critical: {
      immediateActions: ['Immediate account suspension', 'Data backup', 'Legal notification'],
      accountStatus: 'Suspended - Critical',
      dataProtection: ['Complete isolation', 'Data backup', 'Legal compliance'],
      recoverySteps: ['Contact legal team', 'Provide full documentation', 'Security investigation']
    }
  };
  
  return measures[securityLevel];
}
