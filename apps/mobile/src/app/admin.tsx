/**
 * Admin Dashboard Screen
 * Displays admin statistics and management options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/api';
import { logger } from '../utils/logger';

interface DashboardStats {
  stats: {
    totalUsers: number;
    totalSellers: number;
    totalCoffees: number;
    totalFavorites: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  recentUsers: Array<{ id: string; email: string; name: string | null; role: string; createdAt: string }>;
  recentCoffees: Array<{ id: string; coffeeName: string; origin: string; createdAt: string }>;
}

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, token, isAuthenticated } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load dashboard stats
   */
  useEffect(() => {
    if (isAuthenticated && token && user?.role === 'admin') {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token, user]);

  /**
   * Load dashboard statistics
   */
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
      logger.info('Admin dashboard stats loaded successfully');
    } catch (error: any) {
      logger.error('Error loading admin stats', error);
      // Check if it's an authorization error
      if (error.response?.status === 403 || error.response?.status === 401) {
        logger.warn('User is not authorized to access admin dashboard');
      }
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle pull to refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="shield-outline" size={64} color={colors.neutral.gray400} />
        <Text style={styles.errorText}>Please sign in to access admin dashboard</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (user.role !== 'admin') {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="lock-closed" size={64} color={colors.status.error} />
        <Text style={styles.errorText}>Access Denied</Text>
        <Text style={styles.errorSubtext}>You need admin privileges to access this page</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.neutral.gray400} />
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadStats}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[colors.primary[50], colors.secondary[50]]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral.gray900} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Platform Overview</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.statCardGradient}
            >
              <Ionicons name="people" size={32} color={colors.neutral.white} />
              <Text style={styles.statValue}>{stats.stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[colors.accent.emerald, colors.accent.green]}
              style={styles.statCardGradient}
            >
              <Ionicons name="storefront" size={32} color={colors.neutral.white} />
              <Text style={styles.statValue}>{stats.stats.totalSellers}</Text>
              <Text style={styles.statLabel}>Sellers</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[colors.accent.blue, colors.accent.purple]}
              style={styles.statCardGradient}
            >
              <Ionicons name="cafe" size={32} color={colors.neutral.white} />
              <Text style={styles.statValue}>{stats.stats.totalCoffees}</Text>
              <Text style={styles.statLabel}>Coffees</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[colors.status.error, colors.accent.red]}
              style={styles.statCardGradient}
            >
              <Ionicons name="heart" size={32} color={colors.neutral.white} />
              <Text style={styles.statValue}>{stats.stats.totalFavorites}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Users by Role */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users by Role</Text>
          <View style={styles.roleList}>
            {stats.usersByRole.map((item) => (
              <View key={item.role} style={styles.roleItem}>
                <Text style={styles.roleName}>
                  {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                </Text>
                <Text style={styles.roleCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Users</Text>
          {stats.recentUsers.length === 0 ? (
            <Text style={styles.emptyText}>No users yet</Text>
          ) : (
            stats.recentUsers.map((user) => (
              <View key={user.id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name="person-circle" size={32} color={colors.primary[600]} />
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle}>{user.name || user.email}</Text>
                    <Text style={styles.listItemSubtitle}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Coffees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Coffees</Text>
          {stats.recentCoffees.length === 0 ? (
            <Text style={styles.emptyText}>No coffees yet</Text>
          ) : (
            stats.recentCoffees.map((coffee) => (
              <View key={coffee.id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name="cafe" size={32} color={colors.primary[600]} />
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle}>{coffee.coffeeName}</Text>
                    <Text style={styles.listItemSubtitle}>{coffee.origin}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => router.push(`/coffees/${coffee.id}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray400} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loginButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  loginButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  backButton: {
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.gray700,
  },
  retryButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  backButtonHeader: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '47%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  statCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.white,
    opacity: 0.9,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginBottom: spacing.md,
  },
  roleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  roleName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.gray700,
  },
  roleCount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  listItemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
  },
  roleBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray500,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

