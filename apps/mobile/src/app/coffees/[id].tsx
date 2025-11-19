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
import { colors, typography, spacing, borderRadius } from '../../config/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { coffeeService } from '../../services/api';
import { CoffeeEntry } from '../../types';

export default function CoffeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [coffee, setCoffee] = useState<CoffeeEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoffee = async () => {
      try {
        const data = await coffeeService.getCoffeeById(id);
        setCoffee(data);
      } catch (error) {
        console.error('Error fetching coffee:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoffee();
    }
  }, [id]);

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

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[colors.primary[50], colors.secondary[50]]}
        style={styles.header}
      >
        <Text style={styles.coffeeName}>{coffee.coffeeName}</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Information</Text>
          <Text style={styles.infoText}>Farm: {coffee.farm}</Text>
          <Text style={styles.infoText}>Farmer: {coffee.farmer}</Text>
        </View>
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
  coffeeName: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginBottom: spacing.sm,
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
