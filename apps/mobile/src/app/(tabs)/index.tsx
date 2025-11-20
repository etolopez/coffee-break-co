/**
 * Home Screen
 * Main landing screen for the Coffee Break mobile app
 * Features hero section, featured coffees, and quick navigation
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Home Screen Component
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Auth */}
      <View style={styles.header}>
        {isAuthenticated && user ? (
          <View style={styles.headerRight}>
            {/* Role-based buttons */}
            {(user.role === 'seller' || user.role === 'admin') && (
              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => router.push('/seller-dashboard')}
                activeOpacity={0.8}
              >
                <Ionicons name="storefront" size={20} color={colors.primary[600]} />
                <Text style={styles.roleButtonText}>Dashboard</Text>
              </TouchableOpacity>
            )}
            {user.role === 'admin' && (
              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => router.push('/admin')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield" size={20} color={colors.primary[600]} />
                <Text style={styles.roleButtonText}>Admin</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
            >
              <Ionicons name="person-circle" size={32} color={colors.primary[600]} />
              <Text style={styles.profileText}>{user.name || user.email}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.authButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authButton, styles.authButtonPrimary]}
              onPress={() => router.push('/signup')}
              activeOpacity={0.8}
            >
              <Text style={[styles.authButtonText, styles.authButtonTextPrimary]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Hero Section */}
      <LinearGradient
        colors={[colors.primary[50], colors.secondary[50], colors.primary[100]]}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.badgeContainer}>
            <Ionicons name="trophy" size={20} color={colors.primary[600]} />
            <Text style={styles.badgeText}>Trusted by coffee producers worldwide</Text>
          </View>

          <Text style={styles.heroTitle}>
            From Bean{'\n'}
            <Text style={styles.heroTitleAccent}>to Cup Journey</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Create digital passports for your coffee
          </Text>
          <Text style={styles.heroDescription}>
            Connect consumers with farmers and build trust through complete
            blockchain-verified traceability from farm to cup
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/sellers')}
              activeOpacity={0.8}
            >
              <Ionicons name="cafe" size={20} color={colors.neutral.white} />
              <Text style={styles.primaryButtonText}>Start Your Journey</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.neutral.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)/scanner')}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={20} color={colors.primary[700]} />
              <Text style={styles.secondaryButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Everything You Need</Text>
        <Text style={styles.sectionSubtitle}>Coffee Excellence</Text>

        <View style={styles.featuresGrid}>
          {/* Feature 1: Coffee Logging */}
          <View style={styles.featureCard}>
            <LinearGradient
              colors={[colors.primary[500], colors.secondary[500]]}
              style={styles.featureIconContainer}
            >
              <Ionicons name="cafe" size={32} color={colors.neutral.white} />
            </LinearGradient>
            <Text style={styles.featureTitle}>Professional Logging</Text>
            <Text style={styles.featureDescription}>
              Log comprehensive information about your coffee beans with our intuitive interface
            </Text>
          </View>

          {/* Feature 2: QR Generation */}
          <View style={styles.featureCard}>
            <LinearGradient
              colors={[colors.accent.emerald, colors.accent.green]}
              style={styles.featureIconContainer}
            >
              <Ionicons name="qr-code" size={32} color={colors.neutral.white} />
            </LinearGradient>
            <Text style={styles.featureTitle}>Smart QR Codes</Text>
            <Text style={styles.featureDescription}>
              Generate unique, blockchain-verified QR codes for each coffee lot
            </Text>
          </View>

          {/* Feature 3: Farmer Stories */}
          <View style={styles.featureCard}>
            <LinearGradient
              colors={[colors.accent.blue, colors.accent.purple]}
              style={styles.featureIconContainer}
            >
              <Ionicons name="location" size={32} color={colors.neutral.white} />
            </LinearGradient>
            <Text style={styles.featureTitle}>Rich Stories</Text>
            <Text style={styles.featureDescription}>
              Share compelling stories behind your coffee with multimedia content
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/coffees')}
            activeOpacity={0.8}
          >
            <Ionicons name="cafe" size={24} color={colors.primary[600]} />
            <Text style={styles.quickActionText}>Explore Coffees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/sellers')}
            activeOpacity={0.8}
          >
            <Ionicons name="trophy" size={24} color={colors.primary[600]} />
            <Text style={styles.quickActionText}>Our Sellers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/scanner')}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code" size={24} color={colors.primary[600]} />
            <Text style={styles.quickActionText}>Scan QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={[colors.primary[50], colors.secondary[50]]}
          style={styles.ctaCard}
        >
          <Text style={styles.ctaTitle}>Ready to Showcase Your Coffee?</Text>
          <Text style={styles.ctaDescription}>
            Join our platform and create beautiful digital passports for your coffee.
            Connect with consumers worldwide.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/sellers')}
            activeOpacity={0.8}
          >
            <Ionicons name="cafe" size={20} color={colors.neutral.white} />
            <Text style={styles.ctaButtonText}>Become a Seller</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  contentContainer: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  roleButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.gray50,
  },
  profileText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.gray900,
  },
  authButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  authButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  authButtonPrimary: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  authButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  authButtonTextPrimary: {
    color: colors.neutral.white,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
    minHeight: 400,
  },
  heroContent: {
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  badgeText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
  },
  heroTitle: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 56,
  },
  heroTitleAccent: {
    color: colors.primary[600],
  },
  heroSubtitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.normal,
    color: colors.neutral.gray700,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroDescription: {
    fontSize: typography.fontSize.lg,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  heroButtons: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...shadows.lg,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary[200],
    gap: spacing.sm,
    ...shadows.md,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  featuresSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.neutral.white,
  },
  sectionTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.primary[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  featuresGrid: {
    gap: spacing.lg,
  },
  featureCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[100],
    ...shadows.md,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginBottom: spacing.sm,
  },
  featureDescription: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
    lineHeight: 22,
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.neutral.gray50,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary[100],
    ...shadows.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
    textAlign: 'center',
  },
  ctaSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  ctaCard: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary[200],
    alignItems: 'center',
    ...shadows.lg,
  },
  ctaTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ctaDescription: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...shadows.md,
  },
  ctaButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
});
