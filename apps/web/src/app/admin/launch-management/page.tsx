/**
 * Enhanced Launch Management Dashboard
 * Complete admin control over the phased launch strategy
 * No code changes required - everything controlled through admin interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Calendar, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Users,
  Coffee,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  Play,
  Pause,
  SkipForward,
  RotateCcw
} from 'lucide-react';

// Types for the launch configuration data
interface LaunchPhase {
  id: string;
  phaseNumber: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  features: {
    availableTiers: string[];
    coffeeUploadLimits: Record<string, number>;
    analyticsAccess: Record<string, string>;
    exportFormats: Record<string, string[]>;
    dataRetention: Record<string, number>;
    supportLevels: Record<string, string>;
    pricing: Record<string, number>;
    customFeatures: Record<string, string[]>;
  };
  expectedMetrics: {
    expectedUsers: string;
    expectedCoffees: string;
    monthlyCosts: string;
    conversionTargets: Record<string, number>;
  };
  createdAt: string;
  updatedAt: string;
}

interface LaunchConfiguration {
  id: string;
  autoPhaseTransition: boolean;
  phaseDuration: number;
  gracePeriodDays: number;
  dataRetentionDays: number;
  maxFailedPayments: number;
  autoArchiveAfterDays: number;
  manualPhaseOverride: number | null;
  isPaused: boolean;
  pauseReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface FeatureRollout {
  id: string;
  featureName: string;
  description: string;
  targetPhase: number;
  rolloutDate: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  aBTestVariants?: string[];
  createdAt: string;
  updatedAt: string;
}

interface LaunchProgress {
  currentPhase: number;
  totalPhases: number;
  completedPhases: number;
  progressPercentage: number;
  isPaused: boolean;
  nextPhase: number;
}

interface AdminAction {
  id: string;
  adminId: string;
  action: string;
  details: any;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export default function LaunchManagementPage() {
  const [phases, setPhases] = useState<LaunchPhase[]>([]);
  const [config, setConfig] = useState<LaunchConfiguration | null>(null);
  const [rollouts, setRollouts] = useState<FeatureRollout[]>([]);
  const [progress, setProgress] = useState<LaunchProgress>({
    currentPhase: 1,
    totalPhases: 4,
    completedPhases: 0,
    progressPercentage: 0,
    isPaused: false,
    nextPhase: 2
  });
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhase, setEditingPhase] = useState<LaunchPhase | null>(null);
  const [editingConfig, setEditingConfig] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Mock data for demonstration - replace with real API calls
  const mockPhases: LaunchPhase[] = [
    {
      id: 'phase-1',
      phaseNumber: 1,
      name: 'Foundation Launch',
      description: 'Free tier only - Basic features for everyone',
      startDate: '2024-01-01',
      endDate: '2024-04-01',
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
        customFeatures: { free: ['QR code generation'], basic: [], premium: [], enterprise: [] }
      },
      expectedMetrics: {
        expectedUsers: '100-500',
        expectedCoffees: '100-500',
        monthlyCosts: '$10-30',
        conversionTargets: { free: 0, basic: 0, premium: 0, enterprise: 0 }
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'phase-2',
      phaseNumber: 2,
      name: 'Basic Tier Introduction',
      description: 'Add Basic tier with enhanced features',
      startDate: '2024-04-01',
      endDate: '2024-07-01',
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
        customFeatures: { free: ['QR code generation'], basic: ['Basic analytics', 'JSON export'], premium: [], enterprise: [] }
      },
      expectedMetrics: {
        expectedUsers: '500-1,500',
        expectedCoffees: '1,000-5,000',
        monthlyCosts: '$30-100',
        conversionTargets: { free: 0, basic: 0, premium: 0, enterprise: 0 }
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'phase-3',
      phaseNumber: 3,
      name: 'Premium Tier Introduction',
      description: 'Add Premium tier with advanced analytics',
      startDate: '2024-07-01',
      endDate: '2024-10-01',
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
        customFeatures: { free: ['QR code generation'], basic: ['Basic analytics', 'JSON export'], premium: ['Advanced analytics', 'CSV export', 'Saved coffee analytics'], enterprise: [] }
      },
      expectedMetrics: {
        expectedUsers: '1,500-3,000',
        expectedCoffees: '5,000-15,000',
        monthlyCosts: '$100-300',
        conversionTargets: { free: 0, basic: 0, premium: 0, enterprise: 0 }
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'phase-4',
      phaseNumber: 4,
      name: 'Enterprise Tier Introduction',
      description: 'Add Enterprise tier with unlimited features',
      startDate: '2024-10-01',
      endDate: '2025-01-01',
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
        customFeatures: { free: ['QR code generation'], basic: ['Basic analytics', 'JSON export'], premium: ['Advanced analytics', 'CSV export', 'Saved coffee analytics'], enterprise: ['Full analytics suite', 'All export formats', 'KPIs & trends', 'Custom insights', 'White-label options', 'Custom integrations'] }
      },
      expectedMetrics: {
        expectedUsers: '3,000+',
        expectedCoffees: '15,000+',
        monthlyCosts: '$300+',
        conversionTargets: { free: 0, basic: 0, premium: 0, enterprise: 0 }
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  // Fetch launch configuration data
  useEffect(() => {
    // Use mock data for demonstration
    setPhases(mockPhases);
    setConfig({
      id: 'default',
      autoPhaseTransition: true,
      phaseDuration: 3,
      gracePeriodDays: 7,
      dataRetentionDays: 30,
      maxFailedPayments: 3,
      autoArchiveAfterDays: 90,
      manualPhaseOverride: null,
      isPaused: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    });
    setProgress({
      currentPhase: 1,
      totalPhases: 4,
      completedPhases: 0,
      progressPercentage: 25,
      isPaused: false,
      nextPhase: 2
    });
    setRollouts([]);
    setActions([]);
  }, []);

  const fetchLaunchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/launch-config');
      const data = await response.json();
      
      if (data.success) {
        setPhases(data.data.phases);
        setConfig(data.data.configuration);
        setRollouts(data.data.rollouts);
        setProgress(data.data.progress);
        setActions(data.data.recentActions);
      }
    } catch (error) {
      console.error('Error fetching launch config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update launch configuration
  const updateLaunchConfig = async (action: string, data: any) => {
    try {
      const response = await fetch('/api/admin/launch-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowSuccess(true);
        setSuccessMessage(result.message);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchLaunchConfig(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating launch config:', error);
    }
  };

  // Phase management
  const handlePhaseEdit = (phase: LaunchPhase) => {
    setEditingPhase({ ...phase });
  };

  const handlePhaseSave = async () => {
    if (editingPhase) {
      await updateLaunchConfig('update_phase', {
        phaseNumber: editingPhase.phaseNumber,
        updates: editingPhase
      });
      setEditingPhase(null);
    }
  };

  const handlePhaseCancel = () => {
    setEditingPhase(null);
  };

  // Configuration management
  const handleConfigEdit = () => {
    setEditingConfig(true);
  };

  const handleConfigSave = async () => {
    if (config) {
      await updateLaunchConfig('update_configuration', config);
      setEditingConfig(false);
    }
  };

  const handleConfigCancel = () => {
    setEditingConfig(false);
    fetchLaunchConfig(); // Reset to original values
  };

  // Launch control actions
  const handleManualPhaseOverride = (targetPhase: number) => {
    updateLaunchConfig('manual_phase_override', { targetPhase });
  };

  const handlePauseLaunch = () => {
    const reason = prompt('Enter reason for pausing launch:');
    if (reason) {
      updateLaunchConfig('pause_launch', { reason });
    }
  };

  const handleResumeLaunch = () => {
    updateLaunchConfig('resume_launch', {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading launch configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {successMessage}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Launch Management</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete control over your phased launch strategy. Modify phases, adjust configurations, 
            and control feature rollouts - all without touching code.
          </p>
        </div>

        {/* Launch Control Panel */}
        <div className="bg-white rounded-2xl border border-blue-200 p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Launch Control Panel</h2>
            <div className="flex space-x-3">
              <button
                onClick={handlePauseLaunch}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Launch
              </button>
              <button
                onClick={handleResumeLaunch}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume Launch
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{progress.currentPhase || 1}</div>
              <div className="text-sm text-gray-600">Current Phase</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {progress.isPaused ? '⏸️ Paused' : '🚀 Active'}
              </div>
              <div className="text-sm text-gray-600">Launch Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {progress.progressPercentage?.toFixed(0) || 0}%
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>

          {config?.pauseReason && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Pause Reason:</strong> {config.pauseReason}
              </p>
            </div>
          )}
        </div>

        {/* Manual Phase Control */}
        <div className="bg-white rounded-2xl border border-purple-200 p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Manual Phase Control</h2>
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          
          <p className="text-gray-600 mb-4">
            Override automatic phase transitions for testing or manual control.
          </p>
          
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map(phase => (
              <button
                key={phase}
                onClick={() => handleManualPhaseOverride(phase)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  config?.manualPhaseOverride === phase
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Phase {phase}
              </button>
            ))}
            <button
              onClick={() => handleManualPhaseOverride(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              Auto
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Set to "Auto" to use automatic phase detection based on dates
          </p>
        </div>

        {/* Phase Management */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Phase Management</h2>
            <Edit className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            {phases.map((phase: LaunchPhase) => (
              <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      phase.isActive ? 'bg-green-500' : 
                      phase.isCompleted ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <h3 className="font-semibold text-gray-900">
                      Phase {phase.phaseNumber}: {phase.name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      phase.isActive ? 'bg-green-100 text-green-800' :
                      phase.isCompleted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {phase.isActive ? 'Active' : phase.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handlePhaseEdit(phase)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{phase.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Start:</strong> {new Date(phase.startDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>End:</strong> {new Date(phase.endDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Available Tiers:</strong> {phase.features.availableTiers.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Management */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Launch Configuration</h2>
            <div className="flex space-x-2">
              {editingConfig ? (
                <>
                  <button
                    onClick={handleConfigSave}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-1 inline" />
                    Save
                  </button>
                  <button
                    onClick={handleConfigCancel}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4 mr-1 inline" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConfigEdit}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1 inline" />
                  Edit
                </button>
              )}
            </div>
          </div>
          
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">General Settings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto Transition:</span>
                    <span className={`font-medium ${config.autoPhaseTransition ? 'text-green-600' : 'text-red-600'}`}>
                      {config.autoPhaseTransition ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phase Duration:</span>
                    <span className="font-medium">{config.phaseDuration} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grace Period:</span>
                    <span className="font-medium">{config.gracePeriodDays} days</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Data & Security</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Retention:</span>
                    <span className="font-medium">{config.dataRetentionDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Failed Payments:</span>
                    <span className="font-medium">{config.maxFailedPayments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto Archive After:</span>
                    <span className="font-medium">{config.autoArchiveAfterDays} days</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Rollouts */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-lg">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-gray-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Feature Rollouts</h2>
          </div>
          
          <div className="space-y-4">
            {rollouts.map((rollout: FeatureRollout) => (
              <div key={rollout.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{rollout.featureName}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rollout.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {rollout.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{rollout.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Target Phase:</strong> {rollout.targetPhase}
                  </div>
                  <div>
                    <strong>Rollout Date:</strong> {new Date(rollout.rolloutDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Percentage:</strong> {rollout.rolloutPercentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admin Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Recent Admin Actions</h2>
          </div>
          
          <div className="space-y-3">
            {actions.map((action: AdminAction) => (
              <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    action.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{action.action}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(action.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  action.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {action.success ? 'Success' : 'Failed'}
                </span>
              </div>
            ))}
            
            {actions.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent actions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
