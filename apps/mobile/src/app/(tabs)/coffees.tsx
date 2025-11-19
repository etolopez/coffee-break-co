/**
 * Coffees Screen
 * Displays a list of all available coffees with filtering and search
 * Mobile-optimized coffee browsing experience
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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { coffeeService } from '../../services/api';
import { CoffeeEntry, CoffeeRating } from '../../types';

/**
 * Coffees Screen Component
 */
export default function CoffeesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [coffees, setCoffees] = useState<CoffeeEntry[]>([]);
  const [filteredCoffees, setFilteredCoffees] = useState<CoffeeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [ratings, setRatings] = useState<Record<string, CoffeeRating>>({});

  /**
   * Fetch coffees from API
   */
  const fetchCoffees = async () => {
    try {
      const data = await coffeeService.getAllCoffees();
      setCoffees(data);
      setFilteredCoffees(data);
      
      // Fetch ratings for all coffees
      const ratingsPromises = data.map(async (coffee) => {
        const rating = await coffeeService.getCoffeeRatings(coffee.id);
        return { coffeeId: coffee.id, rating };
      });
      
      const ratingsResults = await Promise.all(ratingsPromises);
      const ratingsMap: Record<string, CoffeeRating> = {};
      ratingsResults.forEach(({ coffeeId, rating }) => {
        ratingsMap[coffeeId] = rating;
      });
      setRatings(ratingsMap);
    } catch (error: any) {
      console.error('Error fetching coffees:', error);
      // Don't throw - just log and show empty state
      // This allows the UI to still render even if API is unavailable
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
    await fetchCoffees();
  };

  /**
   * Filter coffees based on search and filter
   */
  useEffect(() => {
    let filtered = coffees;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (coffee) =>
          coffee.coffeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coffee.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coffee.farm.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter((coffee) => {
        const hasCertification =
          coffee.certifications?.includes(selectedFilter);
        const hasProcess = coffee.process === selectedFilter;
        const hasVariety = coffee.variety === selectedFilter;
        const hasOrigin = coffee.origin.includes(selectedFilter);
        return hasCertification || hasProcess || hasVariety || hasOrigin;
      });
    }

    setFilteredCoffees(filtered);
  }, [searchQuery, selectedFilter, coffees]);

  /**
   * Fetch coffees on mount
   */
  useEffect(() => {
    fetchCoffees();
  }, []);

  /**
   * Get unique filter options
   */
  const getUniqueFilters = () => {
    const filters = new Set<string>();
    coffees.forEach((coffee) => {
      coffee.certifications?.forEach((cert) => filters.add(cert));
      if (coffee.process) filters.add(coffee.process);
      if (coffee.variety) filters.add(coffee.variety);
    });
    return Array.from(filters).slice(0, 5); // Limit to 5 filters for mobile
  };

  const filters = ['All', ...getUniqueFilters()];

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
      {/* Header */}
      <LinearGradient
        colors={[colors.primary[50], colors.secondary[50]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Exceptional Coffees</Text>
        <Text style={styles.headerDescription}>
          From farm to cup, every coffee tells a story
        </Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.neutral.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search coffees..."
            placeholderTextColor={colors.neutral.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Coffee List */}
      <ScrollView
        style={styles.coffeesList}
        contentContainerStyle={styles.coffeesListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
          />
        }
      >
        {filteredCoffees.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cafe" size={64} color={colors.neutral.gray400} />
            <Text style={styles.emptyStateText}>
              {coffees.length === 0 ? 'No coffees available' : 'No coffees found'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {coffees.length === 0 
                ? 'Unable to connect to the backend API. Please check your connection.'
                : 'Try adjusting your search or filters'}
            </Text>
            {coffees.length === 0 && (
              <Text style={styles.helpText}>
                The backend API should be running on Railway or locally
              </Text>
            )}
          </View>
        ) : (
          filteredCoffees.map((coffee) => {
            const rating = ratings[coffee.id];
            return (
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
                  {rating && rating.count > 0 && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color={colors.secondary[500]} />
                      <Text style={styles.ratingText}>
                        {rating.rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.coffeeDetails}>
                  <View style={styles.coffeeDetailItem}>
                    <Text style={styles.coffeeDetailLabel}>Score</Text>
                    <Text style={styles.coffeeDetailValue}>
                      {coffee.cuppingScore}
                    </Text>
                  </View>
                  <View style={styles.coffeeDetailItem}>
                    <Text style={styles.coffeeDetailLabel}>Process</Text>
                    <Text style={styles.coffeeDetailValue}>{coffee.process}</Text>
                  </View>
                </View>

                {coffee.certifications && coffee.certifications.length > 0 && (
                  <View style={styles.certificationsContainer}>
                    {coffee.certifications.slice(0, 3).map((cert, index) => (
                      <View key={index} style={styles.certificationBadge}>
                        <Text style={styles.certificationText}>{cert}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.coffeeNotes} numberOfLines={2}>
                  {coffee.notes}
                </Text>
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray900,
  },
  filtersContainer: {
    maxHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.gray100,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.gray700,
  },
  filterButtonTextActive: {
    color: colors.neutral.white,
  },
  coffeesList: {
    flex: 1,
  },
  coffeesListContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  coffeeCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
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
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  certificationBadge: {
    backgroundColor: colors.accent.emerald + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent.emerald + '40',
  },
  certificationText: {
    fontSize: typography.fontSize.xs,
    color: colors.accent.emerald,
    fontWeight: typography.fontWeight.medium,
  },
  coffeeNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    lineHeight: 20,
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
    marginTop: spacing.sm,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontFamily: 'monospace',
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
