/**
 * Database-Driven Launch Configuration System
 * Allows admins to control all aspects of the phased launch through admin interface
 * No code changes required - everything controlled through database
 */

export interface LaunchPhase {
  id: string;
  phaseNumber: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCompleted: boolean;
  features: PhaseFeatures;
  expectedMetrics: ExpectedMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhaseFeatures {
  availableTiers: string[];
  coffeeUploadLimits: Record<string, number>;
  analyticsAccess: Record<string, 'none' | 'basic' | 'advanced' | 'full'>;
  exportFormats: Record<string, string[]>;
  dataRetention: Record<string, number>; // months
  supportLevels: Record<string, 'community' | 'email' | 'priority' | 'dedicated'>;
  pricing: Record<string, number>; // monthly price in USD
  customFeatures: Record<string, string[]>; // additional features per tier
}

export interface ExpectedMetrics {
  expectedUsers: string;
  expectedCoffees: string;
  monthlyCosts: string;
  conversionTargets: Record<string, number>; // conversion rates per tier
}

export interface LaunchConfiguration {
  id: string;
  autoPhaseTransition: boolean;
  phaseDuration: number; // months
  gracePeriodDays: number;
  dataRetentionDays: number;
  maxFailedPayments: number;
  autoArchiveAfterDays: number;
  manualPhaseOverride: number | null;
  isPaused: boolean;
  pauseReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureRollout {
  id: string;
  featureName: string;
  description: string;
  targetPhase: number;
  rolloutDate: Date;
  isEnabled: boolean;
  rolloutPercentage: number; // 0-100 for gradual rollouts
  aBTestVariants?: string[]; // for A/B testing
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAction {
  id: string;
  adminId: string;
  action: 'phase_change' | 'tier_modification' | 'feature_rollout' | 'config_update';
  details: any;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

// Mock database for development (replace with real database in production)
class LaunchConfigDatabase {
  private phases: LaunchPhase[] = [];
  private config: LaunchConfiguration;
  private rollouts: FeatureRollout[] = [];
  private actions: AdminAction[] = [];

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default launch configuration
    this.config = {
      id: 'default',
      autoPhaseTransition: true,
      phaseDuration: 3,
      gracePeriodDays: 7,
      dataRetentionDays: 30,
      maxFailedPayments: 3,
      autoArchiveAfterDays: 90,
      manualPhaseOverride: null,
      isPaused: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Default phases with new phased approach
    const now = new Date();
    this.phases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        name: 'Foundation Launch',
        description: 'Free tier only - Basic features for everyone',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 3, 0),
        isActive: true,
        isCompleted: false,
        features: {
          availableTiers: ['free'],
          coffeeUploadLimits: { free: 1, basic: 0, premium: 0, enterprise: 0 },
          analyticsAccess: { free: 'none', basic: 'none', premium: 'none', enterprise: 'none' },
          exportFormats: { free: [], basic: [], premium: [], enterprise: [] },
          dataRetention: { free: 0, basic: 0, premium: 0, enterprise: 0 },
          supportLevels: { free: 'community', basic: 'community', premium: 'community', enterprise: 'community' },
          pricing: { free: 0, basic: 0, premium: 0, enterprise: 0 },
          customFeatures: { free: ['Basic profile (no custom images)', 'QR code generation'], basic: [], premium: [], enterprise: [] }
        },
        expectedMetrics: {
          expectedUsers: '100-500',
          expectedCoffees: '100-500',
          monthlyCosts: '$10-30',
          conversionTargets: { free: 0, basic: 0, premium: 0, enterprise: 0 }
        },
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'phase-2',
        phaseNumber: 2,
        name: 'Basic Tier Introduction',
        description: 'Add Basic tier with enhanced features',
        startDate: new Date(now.getFullYear(), now.getMonth() + 3, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 6, 0),
        isActive: false,
        isCompleted: false,
        features: {
          availableTiers: ['free', 'basic'],
          coffeeUploadLimits: { free: 1, basic: 5, premium: 0, enterprise: 0 },
          analyticsAccess: { free: 'none', basic: 'basic', premium: 'none', enterprise: 'none' },
          exportFormats: { free: [], basic: ['json'], premium: [], enterprise: [] },
          dataRetention: { free: 0, basic: 3, premium: 0, enterprise: 0 },
          supportLevels: { free: 'community', basic: 'email', premium: 'community', enterprise: 'community' },
          pricing: { free: 0, basic: 30, premium: 0, enterprise: 0 },
          customFeatures: { free: ['Basic profile (no custom images)', 'QR code generation'], basic: ['Basic analytics', 'Full profile customization', 'Custom logo & images', 'JSON export'], premium: [], enterprise: [] }
        },
        expectedMetrics: {
          expectedUsers: '500-1,500',
          expectedCoffees: '1,000-5,000',
          monthlyCosts: '$30-100',
          conversionTargets: { free: 0, basic: 0, premium: 0, enterprise: 0 }
        },
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'phase-3',
        phaseNumber: 3,
        name: 'Premium Tier Introduction',
        description: 'Add Premium tier with advanced analytics',
        startDate: new Date(now.getFullYear(), now.getMonth() + 6, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 9, 0),
        isActive: false,
        isCompleted: false,
        features: {
          availableTiers: ['free', 'basic', 'premium'],
          coffeeUploadLimits: { free: 1, basic: 5, premium: 15, enterprise: 0 },
          analyticsAccess: { free: 'none', basic: 'basic', premium: 'advanced', enterprise: 'none' },
          exportFormats: { free: [], basic: ['json'], premium: ['json', 'csv'], enterprise: [] },
          dataRetention: { free: 0, basic: 3, premium: 12, enterprise: 0 },
          supportLevels: { free: 'community', basic: 'email', premium: 'priority', enterprise: 'community' },
          pricing: { free: 0, basic: 30, premium: 80, enterprise: 0 },
          customFeatures: { free: ['Basic profile (no custom images)', 'QR code generation'], basic: ['Basic analytics', 'Full profile customization', 'Custom logo & images', 'JSON export'], premium: ['Advanced analytics', 'Full profile customization', 'Custom logo & images', 'CSV export', 'Saved coffee analytics'], enterprise: [] }
        },
        expectedMetrics: {
          expectedUsers: '1,500-3,000',
          expectedCoffees: '5,000-15,000',
          monthlyCosts: '$100-300',
          conversionTargets: { free: 0, basic: 0, premium: 0, enterprise: 0 }
        },
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'phase-4',
        phaseNumber: 4,
        name: 'Enterprise Tier Introduction',
        description: 'Add Enterprise tier with unlimited features',
        startDate: new Date(now.getFullYear(), now.getMonth() + 9, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 12, 0),
        isActive: false,
        isCompleted: false,
        features: {
          availableTiers: ['free', 'basic', 'premium', 'enterprise'],
          coffeeUploadLimits: { free: 1, basic: 5, premium: 15, enterprise: -1 },
          analyticsAccess: { free: 'none', basic: 'basic', premium: 'advanced', enterprise: 'full' },
          exportFormats: { free: [], basic: ['json'], premium: ['json', 'csv'], enterprise: ['json', 'csv', 'excel', 'pdf'] },
          dataRetention: { free: 0, basic: 3, premium: 12, enterprise: -1 },
          supportLevels: { free: 'community', basic: 'email', premium: 'priority', enterprise: 'dedicated' },
          pricing: { free: 0, basic: 30, premium: 80, enterprise: 200 },
          customFeatures: { free: ['Basic profile (no custom images)', 'QR code generation'], basic: ['Basic analytics', 'Full profile customization', 'Custom logo & images', 'JSON export'], premium: ['Advanced analytics', 'Full profile customization', 'Custom logo & images', 'CSV export', 'Saved coffee analytics'], enterprise: ['Full analytics suite', 'Full profile customization', 'Custom logo & images', 'All export formats', 'KPIs & trends', 'Custom insights', 'White-label options', 'Custom integrations'] }
        },
        expectedMetrics: {
          expectedUsers: '3,000+',
          expectedCoffees: '15,000+',
          monthlyCosts: '$300+',
          conversionTargets: { free: 0, basic: 0, premium: 0, enterprise: 0 }
        },
        createdAt: now,
        updatedAt: now
      }
    ];

    // Default feature rollouts
    this.rollouts = [
      {
        id: 'rollout-1',
        featureName: 'Saved Coffee Analytics',
        description: 'Detailed analytics for saved coffees',
        targetPhase: 2,
        rolloutDate: new Date(now.getFullYear(), now.getMonth() + 3, 1),
        isEnabled: false,
        rolloutPercentage: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'rollout-2',
        featureName: 'Advanced KPIs',
        description: 'Key Performance Indicators and trends',
        targetPhase: 3,
        rolloutDate: new Date(now.getFullYear(), now.getMonth() + 6, 1),
        isEnabled: false,
        rolloutPercentage: 100,
        createdAt: now,
        updatedAt: now
      }
    ];
  }

  // Phase management
  async getPhases(): Promise<LaunchPhase[]> {
    return this.phases.sort((a, b) => a.phaseNumber - b.phaseNumber);
  }

  async getPhase(phaseNumber: number): Promise<LaunchPhase | null> {
    return this.phases.find(p => p.phaseNumber === phaseNumber) || null;
  }

  async getCurrentPhase(): Promise<LaunchPhase | null> {
    if (this.config.manualPhaseOverride) {
      return this.getPhase(this.config.manualPhaseOverride);
    }

    const now = new Date();
    return this.phases.find(p => 
      p.startDate <= now && p.endDate >= now && p.isActive
    ) || null;
  }

  async updatePhase(phaseNumber: number, updates: Partial<LaunchPhase>): Promise<LaunchPhase> {
    const phaseIndex = this.phases.findIndex(p => p.phaseNumber === phaseNumber);
    if (phaseIndex === -1) {
      throw new Error(`Phase ${phaseNumber} not found`);
    }

    this.phases[phaseIndex] = {
      ...this.phases[phaseIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.logAdminAction('phase_change', { phaseNumber, updates });
    return this.phases[phaseIndex];
  }

  // Configuration management
  async getConfiguration(): Promise<LaunchConfiguration> {
    return this.config;
  }

  async updateConfiguration(updates: Partial<LaunchConfiguration>): Promise<LaunchConfiguration> {
    this.config = {
      ...this.config,
      ...updates,
      updatedAt: new Date()
    };

    this.logAdminAction('config_update', { updates });
    return this.config;
  }

  // Feature rollout management
  async getRollouts(): Promise<FeatureRollout[]> {
    return this.rollouts;
  }

  async updateRollout(rolloutId: string, updates: Partial<FeatureRollout>): Promise<FeatureRollout> {
    const rolloutIndex = this.rollouts.findIndex(r => r.id === rolloutId);
    if (rolloutIndex === -1) {
      throw new Error(`Rollout ${rolloutId} not found`);
    }

    this.rollouts[rolloutIndex] = {
      ...this.rollouts[rolloutIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.logAdminAction('feature_rollout', { rolloutId, updates });
    return this.rollouts[rolloutIndex];
  }

  // Tier availability
  async getAvailableTiers(): Promise<string[]> {
    const currentPhase = await this.getCurrentPhase();
    if (!currentPhase) return ['free', 'basic'];

    return currentPhase.features.availableTiers;
  }

  async isTierAvailable(tier: string): Promise<boolean> {
    const availableTiers = await this.getAvailableTiers();
    return availableTiers.includes(tier);
  }

  // Tier configuration
  async getTierConfig(tier: string): Promise<any> {
    const currentPhase = await this.getCurrentPhase();
    if (!currentPhase) return null;

    return {
      tier,
      coffeeLimit: currentPhase.features.coffeeUploadLimits[tier] || 0,
      analyticsAccess: currentPhase.features.analyticsAccess[tier] || 'none',
      exportFormats: currentPhase.features.exportFormats[tier] || [],
      dataRetention: currentPhase.features.dataRetention[tier] || 0,
      supportLevel: currentPhase.features.supportLevels[tier] || 'community',
      price: currentPhase.features.pricing[tier] || 0,
      customFeatures: currentPhase.features.customFeatures[tier] || []
    };
  }

  // Admin actions logging
  private logAdminAction(action: string, details: any): void {
    this.actions.push({
      id: `action-${Date.now()}`,
      adminId: 'admin', // In production, get from auth context
      action: action as any,
      details,
      timestamp: new Date(),
      success: true
    });
  }

  async getAdminActions(): Promise<AdminAction[]> {
    return this.actions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Utility methods
  async getLaunchProgress(): Promise<any> {
    const currentPhase = await this.getCurrentPhase();
    const totalPhases = this.phases.length;
    const completedPhases = this.phases.filter(p => p.isCompleted).length;
    
    return {
      currentPhase: currentPhase?.phaseNumber || 1,
      totalPhases,
      completedPhases,
      progressPercentage: (completedPhases / totalPhases) * 100,
      isPaused: this.config.isPaused,
      nextPhase: currentPhase ? currentPhase.phaseNumber + 1 : 1
    };
  }

  async getDaysUntilNextPhase(): Promise<number> {
    const currentPhase = await this.getCurrentPhase();
    if (!currentPhase || currentPhase.phaseNumber >= this.phases.length) return 0;

    const nextPhase = this.phases.find(p => p.phaseNumber === currentPhase.phaseNumber + 1);
    if (!nextPhase) return 0;

    const now = new Date();
    const daysUntil = Math.ceil((nextPhase.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysUntil);
  }
}

// Export singleton instance
export const launchConfigDB = new LaunchConfigDatabase();
