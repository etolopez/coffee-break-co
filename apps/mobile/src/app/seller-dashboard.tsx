/**
 * Seller Dashboard Screen
 * Allows sellers to manage their coffees (create, edit, delete)
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { sellerCoffeeService } from '../services/api';
import { CoffeeEntry } from '../types';
import { logger } from '../utils/logger';

export default function SellerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();

  const [coffees, setCoffees] = useState<CoffeeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load seller's coffees
   */
  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      loadCoffees();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Load coffees
   */
  const loadCoffees = async () => {
    try {
      setLoading(true);
      const data = await sellerCoffeeService.getMyCoffees();
      setCoffees(data);
    } catch (error: any) {
      logger.error('Error loading seller coffees', error);
      Alert.alert('Error', 'Failed to load coffees. Please try again.');
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
    loadCoffees();
  };

  /**
   * Handle delete coffee
   */
  const handleDelete = (coffee: CoffeeEntry) => {
    Alert.alert(
      'Delete Coffee',
      `Are you sure you want to delete "${coffee.coffeeName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await sellerCoffeeService.deleteCoffee(coffee.id);
              loadCoffees();
            } catch (error: any) {
              logger.error('Error deleting coffee', error);
              Alert.alert('Error', 'Failed to delete coffee. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="storefront-outline" size={64} color={colors.neutral.gray400} />
        <Text style={styles.errorText}>Please sign in to access seller dashboard</Text>
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

  if (user.role !== 'seller' && user.role !== 'admin') {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="lock-closed" size={64} color={colors.status.error} />
        <Text style={styles.errorText}>Access Denied</Text>
        <Text style={styles.errorSubtext}>You need seller privileges to access this page</Text>
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
        <Text style={styles.loadingText}>Loading coffees...</Text>
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
        <Text style={styles.title}>My Coffees</Text>
        <Text style={styles.subtitle}>Manage your coffee listings</Text>
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/seller/coffees/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={24} color={colors.neutral.white} />
          <Text style={styles.addButtonText}>Add New Coffee</Text>
        </TouchableOpacity>

        {coffees.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cafe-outline" size={64} color={colors.neutral.gray400} />
            <Text style={styles.emptyText}>No coffees yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add New Coffee" to get started</Text>
          </View>
        ) : (
          coffees.map((coffee) => (
            <View key={coffee.id} style={styles.coffeeCard}>
              <View style={styles.coffeeCardContent}>
                <Text style={styles.coffeeName}>{coffee.coffeeName}</Text>
                <Text style={styles.coffeeOrigin}>{coffee.origin}</Text>
                {coffee.cuppingScore && (
                  <Text style={styles.coffeeScore}>Score: {coffee.cuppingScore}</Text>
                )}
                <View style={styles.coffeeStatus}>
                  <View
                    style={[
                      styles.statusBadge,
                      coffee.available
                        ? styles.statusAvailable
                        : styles.statusUnavailable,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {coffee.available ? 'Available' : 'Unavailable'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.coffeeActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/seller/coffees/${coffee.id}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pencil" size={20} color={colors.primary[600]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(coffee)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash" size={20} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    ...shadows.md,
  },
  addButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.gray700,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  coffeeCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  coffeeCardContent: {
    flex: 1,
  },
  coffeeName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  coffeeOrigin: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  coffeeScore: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.sm,
  },
  coffeeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusAvailable: {
    backgroundColor: colors.accent.emerald + '20',
  },
  statusUnavailable: {
    backgroundColor: colors.neutral.gray200,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.gray700,
  },
  coffeeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
  },
  deleteButton: {
    backgroundColor: colors.status.error + '10',
  },
});

