/**
 * Simplified Launch Configuration Database
 * For testing module resolution
 */

export interface LaunchPhase {
  id: string;
  phaseNumber: number;
  name: string;
}

export class LaunchConfigDatabase {
  private phases: LaunchPhase[] = [];

  constructor() {
    this.phases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        name: 'Foundation Launch - Free Tier Only'
      }
    ];
  }

  async getPhases(): Promise<LaunchPhase[]> {
    return this.phases;
  }

  async getCurrentPhase(): Promise<LaunchPhase | null> {
    return this.phases[0] || null;
  }

  async getAvailableTiers(): Promise<string[]> {
    return ['free']; // Phase 1: Free only
  }

  async isTierAvailable(tier: string): Promise<boolean> {
    return tier === 'free'; // Only free tier available in Phase 1
  }

  async getTierConfig(tier: string): Promise<any> {
    if (tier === 'free') {
      return {
        tier,
        coffeeLimit: 1,
        analyticsAccess: 'none',
        exportFormats: [],
        dataRetention: 0,
        supportLevel: 'community',
        price: 0,
        available: true,
        customFeatures: ['Basic profile (no custom images)', 'QR code generation']
      };
    }
    
    // Other tiers not available in Phase 1
    return {
      tier,
      coffeeLimit: 0,
      analyticsAccess: 'none',
      exportFormats: [],
      dataRetention: 0,
      supportLevel: 'community',
      price: 0,
      available: false,
      customFeatures: []
    };
  }

  async getConfiguration(): Promise<any> {
    return {
      autoPhaseTransition: true,
      phaseDuration: 3,
      isPaused: false
    };
  }

  async getRollouts(): Promise<any[]> {
    return [];
  }

  async getLaunchProgress(): Promise<any> {
    return {
      currentPhase: 1,
      totalPhases: 4,
      progressPercentage: 25
    };
  }

  async getAdminActions(): Promise<any[]> {
    return [];
  }
}

export const launchConfigDB = new LaunchConfigDatabase();
