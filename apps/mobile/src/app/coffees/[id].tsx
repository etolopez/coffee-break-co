/**
 * Coffee Detail Screen
 * Shows detailed information about a specific coffee
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { coffeeService, favoritesService } from '../../services/api';
import { CoffeeEntry } from '../../types';
import { logger } from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext';
import { TouchableOpacity } from 'react-native';

export default function CoffeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [coffee, setCoffee] = useState<CoffeeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchCoffee = async () => {
      try {
        // Determine if the parameter is likely an ID or slug
        // CUIDs typically start with 'c' and are 25 characters long
        // Slugs are typically shorter, contain hyphens, and don't start with 'c'
        const looksLikeId = id && id.length > 20 && id.startsWith('c');
        const looksLikeSlug = id && (id.includes('-') || id.length < 20);
        
        let data: CoffeeEntry | null = null;
        
        // Try the appropriate method first based on what it looks like
        if (looksLikeId) {
          // Looks like an ID, try ID first
          try {
            data = await coffeeService.getCoffeeById(id);
          } catch (idError) {
            // If ID fails, try slug as fallback
            logger.debug('ID lookup failed, trying slug', { id });
            try {
              data = await coffeeService.getCoffeeBySlug(id);
            } catch (slugError) {
              logger.error('Error fetching coffee by both ID and slug', { id, idError, slugError });
              throw slugError;
            }
          }
        } else if (looksLikeSlug) {
          // Looks like a slug, try slug first
          try {
            data = await coffeeService.getCoffeeBySlug(id);
          } catch (slugError) {
            // If slug fails, try ID as fallback
            logger.debug('Slug lookup failed, trying ID', { id });
            try {
              data = await coffeeService.getCoffeeById(id);
            } catch (idError) {
              logger.error('Error fetching coffee by both slug and ID', { id, slugError, idError });
              throw idError;
            }
          }
        } else {
          // Unknown format, try both
          try {
            data = await coffeeService.getCoffeeById(id);
          } catch (idError) {
            try {
              data = await coffeeService.getCoffeeBySlug(id);
            } catch (slugError) {
              logger.error('Error fetching coffee - tried both ID and slug', { id, idError, slugError });
              throw slugError;
            }
          }
        }
        
        // Check if we got an error response object
        if (data && 'error' in data) {
          logger.error('API returned error object', data);
          setCoffee(null);
        } else {
          setCoffee(data);
        }
      } catch (error) {
        logger.error('Error fetching coffee', error);
        setCoffee(null);
      } finally {
        setLoading(false);
      }
    };

    const checkFavorite = async () => {
      if (id && isAuthenticated) {
        try {
          const favorited = await favoritesService.isFavorited(id);
          setIsFavorited(favorited);
        } catch (error) {
          logger.error('Error checking favorite status', error);
        }
      }
    };

    if (id) {
      fetchCoffee();
      checkFavorite();
    }
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Loading coffee details...</Text>
      </View>
    );
  }

  if (!coffee) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="cafe" size={64} color={colors.neutral.gray400} />
        <Text style={styles.errorText}>Coffee not found</Text>
      </View>
    );
  }

  /**
   * Toggle favorite status
   */
  const toggleFavorite = async () => {
    if (!isAuthenticated || !coffee) return;

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await favoritesService.removeFavorite(coffee.id);
        setIsFavorited(false);
        logger.info('Coffee removed from favorites');
      } else {
        await favoritesService.addFavorite(coffee.id);
        setIsFavorited(true);
        logger.info('Coffee added to favorites');
      }
    } catch (error) {
      logger.error('Error toggling favorite', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[colors.primary[50], colors.secondary[50]]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.coffeeName}>{coffee.coffeeName}</Text>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={toggleFavorite}
              disabled={favoriteLoading}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorited ? colors.status.error : colors.neutral.gray600}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={colors.primary[600]} />
          <Text style={styles.origin}>{coffee.origin}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Cupping Score</Text>
            <Text style={styles.detailValue}>{coffee.cuppingScore}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Process</Text>
            <Text style={styles.detailValue}>{coffee.process}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Altitude</Text>
            <Text style={styles.detailValue}>{coffee.altitude}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Variety</Text>
            <Text style={styles.detailValue}>{coffee.variety}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{coffee.notes}</Text>
        </View>

        {coffee.certifications && coffee.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.certificationsContainer}>
              {coffee.certifications.map((cert, index) => (
                <View key={index} style={styles.certificationBadge}>
                  <Text style={styles.certificationText}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(coffee.farm || coffee.farmer) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Information</Text>
            {coffee.farm && (
              <Text style={styles.infoText}>Farm: {coffee.farm}</Text>
            )}
            {coffee.farmer && (
              <Text style={styles.infoText}>Farmer: {coffee.farmer}</Text>
            )}
          </View>
        )}

        {coffee.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.notes}>{coffee.description}</Text>
          </View>
        )}

        {coffee.flavorNotes && coffee.flavorNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flavor Notes</Text>
            <View style={styles.certificationsContainer}>
              {coffee.flavorNotes.map((note, index) => (
                <View key={index} style={styles.certificationBadge}>
                  <Text style={styles.certificationText}>{note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
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
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.neutral.gray600,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  coffeeName: {
    flex: 1,
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginRight: spacing.md,
  },
  favoriteButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.white,
    ...shadows.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  origin: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    padding: spacing.lg,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.neutral.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
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
  notes: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray700,
    lineHeight: 24,
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  certificationBadge: {
    backgroundColor: colors.accent.emerald + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent.emerald + '40',
  },
  certificationText: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.emerald,
    fontWeight: typography.fontWeight.medium,
  },
  infoText: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
});
