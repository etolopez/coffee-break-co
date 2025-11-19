/**
 * Sellers Screen
 * Displays a list of all coffee sellers
 * Mobile-optimized seller browsing experience
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sellerService } from '../../services/api';
import { Seller } from '../../types';

/**
 * Sellers Screen Component
 */
export default function SellersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch sellers from API
   */
  const fetchSellers = async () => {
    try {
      const data = await sellerService.getAllSellers();
      setSellers(data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSellers();
  };

  /**
   * Fetch sellers on mount
   */
  useEffect(() => {
    fetchSellers();
  }, []);

  /**
   * Get placeholder colors for seller logos
   */
  const getPlaceholderColors = (sellerId: string) => {
    const colorSchemes = [
      [colors.primary[400], colors.secondary[500]],
      [colors.accent.emerald, colors.accent.green],
      [colors.accent.blue, colors.accent.purple],
      [colors.secondary[400], colors.primary[500]],
      [colors.accent.purple, colors.accent.pink],
    ];
    const index = parseInt(sellerId.replace(/\D/g, '')) % colorSchemes.length;
    return colorSchemes[index] || colorSchemes[0];
  };

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
      {/* Header */}
      <LinearGradient
        colors={[colors.primary[50], colors.secondary[50]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Discover Amazing</Text>
        <Text style={styles.headerSubtitle}>Coffee Stories</Text>
        <Text style={styles.headerDescription}>
          From family farms to premium estates
        </Text>
      </LinearGradient>

      {/* Sellers List */}
      <ScrollView
        style={styles.sellersList}
        contentContainerStyle={styles.sellersListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
          />
        }
      >
        {sellers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cafe" size={64} color={colors.neutral.gray400} />
            <Text style={styles.emptyStateText}>No sellers found</Text>
          </View>
        ) : (
          sellers.map((seller) => {
            const gradientColors = getPlaceholderColors(seller.id);
            return (
              <TouchableOpacity
                key={seller.id}
                style={styles.sellerCard}
                onPress={() => router.push(`/sellers/${seller.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.sellerCardHeader}>
                  <View style={styles.sellerCardHeaderLeft}>
                    <Text style={styles.sellerName}>{seller.name}</Text>
                    <View style={styles.sellerLocation}>
                      <Ionicons name="location" size={14} color={colors.neutral.gray500} />
                      <Text style={styles.sellerLocationText}>
                        {seller.location || 'Location TBD'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Seller Logo/Placeholder */}
                  <View style={styles.logoContainer}>
                    {seller.logo ? (
                      <Image
                        source={{ uri: seller.logo }}
                        style={styles.logoImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <LinearGradient
                        colors={gradientColors}
                        style={styles.logoPlaceholder}
                      >
                        <Ionicons name="cafe" size={28} color={colors.neutral.white} />
                      </LinearGradient>
                    )}
                  </View>
                </View>

                {/* Rating and Coffee Count */}
                <View style={styles.sellerStats}>
                  {seller.rating > 0 ? (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color={colors.secondary[500]} />
                      <Text style={styles.ratingText}>
                        {seller.rating.toFixed(1)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  )}
                  <Text style={styles.coffeeCount}>
                    {seller.coffeeCount || 0} coffee{(seller.coffeeCount || 0) !== 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Description */}
                <Text style={styles.sellerDescription} numberOfLines={3}>
                  {seller.description || 'Premium coffee seller with exceptional quality and sustainable practices.'}
                </Text>

                {/* Certifications */}
                {seller.certifications && seller.certifications.length > 0 && (
                  <View style={styles.certificationsContainer}>
                    {seller.certifications.slice(0, 4).map((cert, index) => (
                      <View key={index} style={styles.certificationBadge}>
                        {cert === 'Organic' && <Ionicons name="trophy" size={12} color={colors.accent.green} />}
                        <Text style={styles.certificationText}>{cert}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Featured Coffee */}
                {seller.coffeeCount > 0 && seller.featuredCoffee && (
                  <View style={styles.featuredCoffeeContainer}>
                    <Text style={styles.featuredCoffeeLabel}>Featured Coffee</Text>
                    <Text style={styles.featuredCoffeeName}>
                      {seller.featuredCoffee}
                    </Text>
                    <Text style={styles.featuredCoffeeRegion}>
                      {seller.region || 'Multiple Origins'}
                    </Text>
                  </View>
                )}

                {/* View Button */}
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => router.push(`/sellers/${seller.id}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="people" size={16} color={colors.neutral.white} />
                  <Text style={styles.viewButtonText}>View Profile</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
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
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.primary[600],
    marginBottom: spacing.sm,
  },
  headerDescription: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  sellersList: {
    flex: 1,
  },
  sellersListContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  sellerCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    ...shadows.md,
  },
  sellerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sellerCardHeaderLeft: {
    flex: 1,
  },
  sellerName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  sellerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sellerLocationText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginLeft: spacing.md,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.secondary[700],
  },
  newBadge: {
    backgroundColor: colors.neutral.gray200,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  newBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.gray600,
  },
  coffeeCount: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
  },
  sellerDescription: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray700,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  certificationText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray700,
    fontWeight: typography.fontWeight.medium,
  },
  featuredCoffeeContainer: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  featuredCoffeeLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  featuredCoffeeName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  featuredCoffeeRegion: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  viewButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginTop: spacing.md,
  },
});
