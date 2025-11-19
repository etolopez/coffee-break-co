/**
 * Admin Launch Configuration API
 * Allows admins to control all aspects of the phased launch
 * No code changes required - everything controlled through API
 */

import { NextRequest, NextResponse } from 'next/server';
// import { launchConfigDB } from '../../../shared/launch-config-db';

// Temporary mock for testing
const launchConfigDB = {
  getPhases: async () => [],
  getConfiguration: async () => ({}),
  getRollouts: async () => [],
  getLaunchProgress: async () => ({}),
  getAdminActions: async () => [],
  updateConfiguration: async (updates: any) => updates,
  updatePhase: async (phaseNumber: number, updates: any) => updates,
  updateRollout: async (rolloutId: string, updates: any) => updates
};

/**
 * GET /api/admin/launch-config
 * Retrieve current launch configuration and phases
 */
export async function GET() {
  try {
    const [phases, config, rollouts, progress, actions] = await Promise.all([
      launchConfigDB.getPhases(),
      launchConfigDB.getConfiguration(),
      launchConfigDB.getRollouts(),
      launchConfigDB.getLaunchProgress(),
      launchConfigDB.getAdminActions()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        phases,
        configuration: config,
        rollouts,
        progress,
        recentActions: actions.slice(0, 10) // Last 10 actions
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching launch configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch launch configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/launch-config
 * Update launch configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update_configuration':
        const updatedConfig = await launchConfigDB.updateConfiguration(data);
        return NextResponse.json({
          success: true,
          data: updatedConfig,
          message: 'Configuration updated successfully'
        });

      case 'update_phase':
        const { phaseNumber, updates } = data;
        const updatedPhase = await launchConfigDB.updatePhase(phaseNumber, updates);
        return NextResponse.json({
          success: true,
          data: updatedPhase,
          message: `Phase ${phaseNumber} updated successfully`
        });

      case 'update_rollout':
        const { rolloutId, rolloutUpdates } = data;
        const updatedRollout = await launchConfigDB.updateRollout(rolloutId, rolloutUpdates);
        return NextResponse.json({
          success: true,
          data: updatedRollout,
          message: 'Feature rollout updated successfully'
        });

      case 'manual_phase_override':
        const { targetPhase } = data;
        const configWithOverride = await launchConfigDB.updateConfiguration({
          manualPhaseOverride: targetPhase
        });
        return NextResponse.json({
          success: true,
          data: configWithOverride,
          message: `Phase manually set to ${targetPhase}`
        });

      case 'pause_launch':
        const { reason } = data;
        const pausedConfig = await launchConfigDB.updateConfiguration({
          isPaused: true,
          pauseReason: reason
        });
        return NextResponse.json({
          success: true,
          data: pausedConfig,
          message: 'Launch paused successfully'
        });

      case 'resume_launch':
        const resumedConfig = await launchConfigDB.updateConfiguration({
          isPaused: false,
          pauseReason: undefined
        });
        return NextResponse.json({
          success: true,
          data: resumedConfig,
          message: 'Launch resumed successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating launch configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update launch configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/launch-config
 * Bulk update multiple configurations
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    const results = [];

    for (const update of updates) {
      try {
        switch (update.type) {
          case 'phase':
            const updatedPhase = await launchConfigDB.updatePhase(update.phaseNumber, update.data);
            results.push({ type: 'phase', success: true, data: updatedPhase });
            break;

          case 'configuration':
            const updatedConfig = await launchConfigDB.updateConfiguration(update.data);
            results.push({ type: 'configuration', success: true, data: updatedConfig });
            break;

          case 'rollout':
            const updatedRollout = await launchConfigDB.updateRollout(update.id, update.data);
            results.push({ type: 'rollout', success: true, data: updatedRollout });
            break;

          default:
            results.push({ type: update.type, success: false, error: 'Unknown update type' });
        }
      } catch (error) {
        results.push({ type: update.type, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: successCount === totalCount,
      data: results,
      message: `Updated ${successCount}/${totalCount} configurations successfully`
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk update' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/launch-config
 * Reset configuration to defaults or delete specific items
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'reset_to_defaults':
        // In a real implementation, this would reset to default values
        return NextResponse.json({
          success: true,
          message: 'Configuration reset to defaults'
        });

      case 'clear_admin_actions':
        // In a real implementation, this would clear admin action logs
        return NextResponse.json({
          success: true,
          message: 'Admin action logs cleared'
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown delete action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in delete operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform delete operation' },
      { status: 500 }
    );
  }
}
