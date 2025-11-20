/**
 * Favorites Screen
 * Displays user's favorite/saved coffees
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
import { CoffeeEntry } from '../types';
import { buildApiUrl } from '../config/api';
import { logger } from '../utils/logger';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, token, isAuthenticated } = useAuth();

  const [favorites, setFavorites] = useState<CoffeeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load favorites
   */
  useEffect(() => {
    if (isAuthenticated && token) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  /**
   * Load favorites from API
   */
  const loadFavorites = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/users/favorites'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      logger.error('Error loading favorites', error);
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
    loadFavorites();
  };

  /**
   * Remove from favorites
   */
  const removeFavorite = async (coffeeId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/users/favorites/${coffeeId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav.id !== coffeeId));
      }
    } catch (error) {
      logger.error('Error removing favorite', error);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="heart-outline" size={64} color={colors.neutral.gray400} />
        <Text style={styles.errorText}>Please sign in to view your favorites</Text>
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Loading favorites...</Text>
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
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral.gray900} />
        </TouchableOpacity>
        <Text style={styles.title}>My Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} saved coffees</Text>
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
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={colors.neutral.gray400} />
            <Text style={styles.emptyStateText}>No favorites yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start exploring coffees and save your favorites!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/coffees')}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreButtonText}>Explore Coffees</Text>
            </TouchableOpacity>
          </View>
        ) : (
          favorites.map((coffee) => (
            <TouchableOpacity
              key={coffee.id}
              style={styles.coffeeCard}
              onPress={() => router.push(`/coffees/${coffee.slug || coffee.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.coffeeCardHeader}>
                <View style={styles.coffeeCardHeaderLeft}>
                  <Text style={styles.coffeeName}>{coffee.coffeeName}</Text>
                  <View style={styles.coffeeLocation}>
                    <Ionicons name="location" size={14} color={colors.primary[600]} />
                    <Text style={styles.coffeeOrigin}>{coffee.origin}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    removeFavorite(coffee.id);
                  }}
                  style={styles.favoriteButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="heart" size={24} color={colors.status.error} />
                </TouchableOpacity>
              </View>

              {coffee.cuppingScore && (
                <View style={styles.coffeeDetails}>
                  <View style={styles.coffeeDetailItem}>
                    <Text style={styles.coffeeDetailLabel}>Score</Text>
                    <Text style={styles.coffeeDetailValue}>{coffee.cuppingScore}</Text>
                  </View>
                  {coffee.process && (
                    <View style={styles.coffeeDetailItem}>
                      <Text style={styles.coffeeDetailLabel}>Process</Text>
                      <Text style={styles.coffeeDetailValue}>{coffee.process}</Text>
                    </View>
                  )}
                </View>
              )}

              {coffee.notes && (
                <Text style={styles.coffeeNotes} numberOfLines={2}>
                  {coffee.notes}
                </Text>
              )}
            </TouchableOpacity>
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
    fontSize: typography.fontSize.lg,
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  backButton: {
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
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  exploreButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  exploreButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  coffeeCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    ...shadows.md,
  },
  coffeeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  coffeeCardHeaderLeft: {
    flex: 1,
  },
  coffeeName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  coffeeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  coffeeOrigin: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  coffeeDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  coffeeDetailItem: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  coffeeDetailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  coffeeDetailValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
  },
  coffeeNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    lineHeight: 20,
  },
});

