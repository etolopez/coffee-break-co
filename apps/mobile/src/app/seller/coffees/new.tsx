/**
 * Create Coffee Screen
 * Form for sellers to create a new coffee entry
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { sellerCoffeeService } from '../../../services/api';
import { logger } from '../../../utils/logger';

export default function CreateCoffeeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    coffeeName: '',
    origin: '',
    description: '',
    farm: '',
    farmer: '',
    altitude: '',
    variety: '',
    process: '',
    cuppingScore: '',
    notes: '',
    price: '',
    weight: '',
    region: '',
  });

  /**
   * Handle form field change
   */
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.coffeeName || !formData.origin) {
      Alert.alert('Validation Error', 'Coffee name and origin are required');
      return;
    }

    setLoading(true);
    try {
      await sellerCoffeeService.createCoffee({
        ...formData,
        available: true,
        certifications: [],
        environmentalPractices: [],
        flavorNotes: [],
      });
      
      Alert.alert('Success', 'Coffee created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      logger.error('Error creating coffee', error);
      Alert.alert('Error', error.message || 'Failed to create coffee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin')) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="lock-closed" size={64} color={colors.status.error} />
        <Text style={styles.errorText}>Access Denied</Text>
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
        <Text style={styles.title}>Create Coffee</Text>
        <Text style={styles.subtitle}>Add a new coffee to your listings</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Coffee Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.coffeeName}
              onChangeText={(value) => handleChange('coffeeName', value)}
              placeholder="e.g., Ethiopian Yirgacheffe"
              placeholderTextColor={colors.neutral.gray400}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Origin *</Text>
            <TextInput
              style={styles.input}
              value={formData.origin}
              onChangeText={(value) => handleChange('origin', value)}
              placeholder="e.g., Ethiopia, Yirgacheffe"
              placeholderTextColor={colors.neutral.gray400}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleChange('description', value)}
              placeholder="Describe your coffee..."
              placeholderTextColor={colors.neutral.gray400}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Farm</Text>
              <TextInput
                style={styles.input}
                value={formData.farm}
                onChangeText={(value) => handleChange('farm', value)}
                placeholder="Farm name"
                placeholderTextColor={colors.neutral.gray400}
              />
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Farmer</Text>
              <TextInput
                style={styles.input}
                value={formData.farmer}
                onChangeText={(value) => handleChange('farmer', value)}
                placeholder="Farmer name"
                placeholderTextColor={colors.neutral.gray400}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Altitude</Text>
              <TextInput
                style={styles.input}
                value={formData.altitude}
                onChangeText={(value) => handleChange('altitude', value)}
                placeholder="e.g., 1700-2200m"
                placeholderTextColor={colors.neutral.gray400}
              />
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Variety</Text>
              <TextInput
                style={styles.input}
                value={formData.variety}
                onChangeText={(value) => handleChange('variety', value)}
                placeholder="e.g., Heirloom"
                placeholderTextColor={colors.neutral.gray400}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Process</Text>
              <TextInput
                style={styles.input}
                value={formData.process}
                onChangeText={(value) => handleChange('process', value)}
                placeholder="e.g., Washed"
                placeholderTextColor={colors.neutral.gray400}
              />
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cupping Score</Text>
              <TextInput
                style={styles.input}
                value={formData.cuppingScore}
                onChangeText={(value) => handleChange('cuppingScore', value)}
                placeholder="e.g., 92"
                placeholderTextColor={colors.neutral.gray400}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(value) => handleChange('price', value)}
                placeholder="e.g., 32.99"
                placeholderTextColor={colors.neutral.gray400}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Weight</Text>
              <TextInput
                style={styles.input}
                value={formData.weight}
                onChangeText={(value) => handleChange('weight', value)}
                placeholder="e.g., 250g"
                placeholderTextColor={colors.neutral.gray400}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Region</Text>
            <TextInput
              style={styles.input}
              value={formData.region}
              onChangeText={(value) => handleChange('region', value)}
              placeholder="e.g., Yirgacheffe"
              placeholderTextColor={colors.neutral.gray400}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => handleChange('notes', value)}
              placeholder="Additional notes about the coffee..."
              placeholderTextColor={colors.neutral.gray400}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.neutral.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.neutral.white} />
                <Text style={styles.submitButtonText}>Create Coffee</Text>
              </>
            )}
          </TouchableOpacity>
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
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: spacing.sm,
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
  form: {
    gap: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.neutral.gray50,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray900,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
});

