/**
 * Launch Configuration
 * Centralized configuration for the phased launch strategy
 * Easy to modify launch dates and phase transitions
 */

/**
 * Launch configuration interface
 * Defines when each phase starts and what features are available
 */
export interface LaunchConfig {
  /** The date when Phase 1 officially started */
  phase1StartDate: Date;
  /** Duration of each phase in months */
  phaseDuration: number;
  /** Whether to enable phase transitions automatically based on time */
  autoPhaseTransition: boolean;
  /** Manual override for current phase (set to 0 to use automatic) */
  manualPhaseOverride: number;
}

/**
 * Default launch configuration
 * Modify these values to adjust your launch timeline
 */
export const LAUNCH_CONFIG: LaunchConfig = {
  // Set this to your actual launch date
  phase1StartDate: new Date('2024-01-01'),
  
  // Each phase lasts 3 months
  phaseDuration: 3,
  
  // Automatically transition phases based on time
  autoPhaseTransition: true,
  
  // Set to 1, 2, 3, or 4 to manually override current phase
  // Set to 0 to use automatic phase detection
  manualPhaseOverride: 0
};

/**
 * Phase definitions with feature availability
 */
export const PHASE_FEATURES = {
  1: {
    name: 'Foundation Launch',
    description: 'Free tier only - Basic features for everyone',
    availableTiers: ['free'],
    features: {
      free: ['Basic profile (no custom images)', '1 coffee upload', 'Community support', 'QR code generation'],
      basic: ['Coming in Phase 2', 'Coming in Phase 2', 'Coming in Phase 2'],
      premium: ['Coming in Phase 3', 'Coming in Phase 3', 'Coming in Phase 3'],
      enterprise: ['Coming in Phase 4', 'Coming in Phase 4', 'Coming in Phase 4']
    },
    expectedUsers: '100-500',
    expectedCoffees: '100-500',
    monthlyCosts: '$10-30'
  },
  2: {
    name: 'Basic Tier Introduction',
    description: 'Add Basic tier with enhanced features',
    availableTiers: ['free', 'basic'],
    features: {
      free: ['Basic profile (no custom images)', '1 coffee upload', 'Community support', 'QR code generation'],
      basic: ['5 coffee uploads', 'Basic analytics', 'Full profile customization', 'Custom logo & images', 'Email support', 'JSON export', '3 months data retention'],
      premium: ['Coming in Phase 3', 'Coming in Phase 3', 'Coming in Phase 3'],
      enterprise: ['Coming in Phase 4', 'Coming in Phase 4', 'Coming in Phase 4']
    },
    expectedUsers: '500-1,500',
    expectedCoffees: '1,000-5,000',
    monthlyCosts: '$30-100'
  },
  3: {
    name: 'Premium Tier Introduction',
    description: 'Add Premium tier with advanced analytics',
    availableTiers: ['free', 'basic', 'premium'],
    features: {
      free: ['Basic profile (no custom images)', '1 coffee upload', 'Community support', 'QR code generation'],
      basic: ['5 coffee uploads', 'Basic analytics', 'Full profile customization', 'Custom logo & images', 'Email support', 'JSON export', '3 months data retention'],
      premium: ['15 coffee uploads', 'Advanced analytics', 'Full profile customization', 'Custom logo & images', 'Priority support', 'CSV export', '12 months data retention', 'Saved coffee analytics'],
      enterprise: ['Coming in Phase 4', 'Coming in Phase 4', 'Coming in Phase 4']
    },
    expectedUsers: '1,500-3,000',
    expectedCoffees: '5,000-15,000',
    monthlyCosts: '$100-300'
  },
  4: {
    name: 'Enterprise Tier Introduction',
    description: 'Add Enterprise tier with unlimited features',
    availableTiers: ['free', 'basic', 'premium', 'enterprise'],
    features: {
      free: ['Basic profile (no custom images)', '1 coffee upload', 'Community support', 'QR code generation'],
      basic: ['5 coffee uploads', 'Basic analytics', 'Full profile customization', 'Custom logo & images', 'Email support', 'JSON export', '3 months data retention'],
      premium: ['15 coffee uploads', 'Advanced analytics', 'Full profile customization', 'Custom logo & images', 'Priority support', 'CSV export', '12 months data retention', 'Saved coffee analytics'],
      enterprise: ['Unlimited uploads', 'Full analytics suite', 'Full profile customization', 'Custom logo & images', 'Dedicated support', 'All export formats', 'Unlimited data retention', 'KPIs & trends', 'Custom insights', 'White-label options', 'Custom integrations']
    },
    expectedUsers: '3,000+',
    expectedCoffees: '15,000+',
    monthlyCosts: '$300+'
  }
};

/**
 * Gets the current launch phase based on configuration
 * @returns Current phase number (1-4)
 */
export function getCurrentPhase(): number {
  // Manual override takes precedence
  if (LAUNCH_CONFIG.manualPhaseOverride > 0) {
    return LAUNCH_CONFIG.manualPhaseOverride;
  }
  
  // Automatic phase detection based on time
  if (LAUNCH_CONFIG.autoPhaseTransition) {
    const now = new Date();
    const monthsSinceLaunch = Math.floor(
      (now.getTime() - LAUNCH_CONFIG.phase1StartDate.getTime()) / 
      (1000 * 60 * 60 * 24 * 30)
    );
    
    const phase = Math.floor(monthsSinceLaunch / LAUNCH_CONFIG.phaseDuration) + 1;
    return Math.min(Math.max(phase, 1), 4); // Ensure phase is between 1-4
  }
  
  // Default to Phase 1 if auto-transition is disabled
  return 1;
}

/**
 * Gets information about the current phase
 * @returns Phase information object
 */
export function getCurrentPhaseInfo() {
  const currentPhase = getCurrentPhase();
  return PHASE_FEATURES[currentPhase as keyof typeof PHASE_FEATURES];
}

/**
 * Gets available tiers for the current phase
 * @returns Array of available tier names
 */
export function getAvailableTiers(): string[] {
  const currentPhase = getCurrentPhase();
  return PHASE_FEATURES[currentPhase as keyof typeof PHASE_FEATURES]?.availableTiers || ['free', 'basic'];
}

/**
 * Checks if a specific tier is available in the current phase
 * @param tier - Tier to check
 * @returns Whether the tier is available
 */
export function isTierAvailable(tier: string): boolean {
  return getAvailableTiers().includes(tier);
}

/**
 * Gets the next phase information
 * @returns Information about the next phase, or null if at max phase
 */
export function getNextPhaseInfo() {
  const currentPhase = getCurrentPhase();
  if (currentPhase >= 4) return null;
  
  return PHASE_FEATURES[(currentPhase + 1) as keyof typeof PHASE_FEATURES];
}

/**
 * Gets days until next phase transition
 * @returns Number of days until next phase, or 0 if at max phase
 */
export function getDaysUntilNextPhase(): number {
  const currentPhase = getCurrentPhase();
  if (currentPhase >= 4) return 0;
  
  const now = new Date();
  const nextPhaseStart = new Date(LAUNCH_CONFIG.phase1StartDate);
  nextPhaseStart.setMonth(nextPhaseStart.getMonth() + (currentPhase * LAUNCH_CONFIG.phaseDuration));
  
  const daysUntil = Math.ceil((nextPhaseStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysUntil);
}

/**
 * Gets launch progress information
 * @returns Object with launch progress details
 */
export function getLaunchProgress() {
  const currentPhase = getCurrentPhase();
  const daysUntilNext = getDaysUntilNextPhase();
  const nextPhase = currentPhase < 4 ? currentPhase + 1 : null;
  
  return {
    currentPhase,
    nextPhase,
    daysUntilNext,
    isLastPhase: currentPhase === 4,
    progressPercentage: (currentPhase / 4) * 100
  };
}

/**
 * Utility function to format launch dates
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatLaunchDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Gets a human-readable description of the current phase
 * @returns Phase description string
 */
export function getPhaseDescription(): string {
  const currentPhase = getCurrentPhase();
  const phaseDescriptions = {
    1: "Currently launching with Free tier only - Basic features for everyone. Premium and Enterprise coming soon!",
    2: "Basic tier now available! Enterprise tier coming in Phase 3.",
    3: "Premium tier now available! Full feature set unlocked.",
    4: "All tiers and features are now available!"
  };
  
  return phaseDescriptions[currentPhase as keyof typeof phaseDescriptions] || phaseDescriptions[4];
}
