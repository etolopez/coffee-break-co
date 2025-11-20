/**
 * Admin Sellers Management Screen
 * Allows admins to view, edit, and delete sellers
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
import { adminSellerService } from '../services/api';
import { Seller } from '../types';
import { logger } from '../utils/logger';

export default function AdminSellersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load sellers
   */
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadSellers();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Load sellers
   */
  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await adminSellerService.getAllSellers();
      setSellers(data);
      logger.info('Admin sellers loaded successfully');
    } catch (error: any) {
      logger.error('Error loading sellers', error);
      Alert.alert('Error', 'Failed to load sellers. Please try again.');
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
    loadSellers();
  };

  /**
   * Handle delete seller
   */
  const handleDelete = (seller: Seller) => {
    Alert.alert(
      'Delete Seller',
      `Are you sure you want to delete "${seller.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminSellerService.deleteSeller(seller.id);
              logger.info(`Seller deleted: ${seller.id}`);
              loadSellers();
            } catch (error: any) {
              logger.error('Error deleting seller', error);
              Alert.alert('Error', 'Failed to delete seller. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="shield-outline" size={64} color={colors.neutral.gray400} />
        <Text style={styles.errorText}>Please sign in to access admin panel</Text>
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
        <Text style={styles.loadingText}>Loading sellers...</Text>
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
        <Text style={styles.title}>Manage Sellers</Text>
        <Text style={styles.subtitle}>View, edit, and delete sellers</Text>
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
        {sellers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color={colors.neutral.gray400} />
            <Text style={styles.emptyText}>No sellers yet</Text>
          </View>
        ) : (
          sellers.map((seller) => (
            <View key={seller.id} style={styles.sellerCard}>
              <View style={styles.sellerCardContent}>
                <Text style={styles.sellerName}>{seller.name}</Text>
                <Text style={styles.sellerLocation}>{seller.location}</Text>
                {seller.description && (
                  <Text style={styles.sellerDescription} numberOfLines={2}>
                    {seller.description}
                  </Text>
                )}
                <View style={styles.sellerStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="cafe" size={16} color={colors.primary[600]} />
                    <Text style={styles.statText}>{seller.coffeeCount} coffees</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color={colors.accent.amber} />
                    <Text style={styles.statText}>{seller.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sellerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/admin/seller/${seller.id}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pencil" size={20} color={colors.primary[600]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(seller)}
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
  },
  sellerCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sellerCardContent: {
    flex: 1,
  },
  sellerName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  sellerLocation: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  sellerDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.sm,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
    fontWeight: typography.fontWeight.medium,
  },
  sellerActions: {
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

