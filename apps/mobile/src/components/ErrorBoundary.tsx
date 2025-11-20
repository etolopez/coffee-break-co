/**
 * Error Boundary Component
 * Catches React errors and displays them with full details
 * Ensures errors are logged to console for Android debugging
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { logger } from '../utils/logger';
import { colors, typography, spacing } from '../config/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary to catch React component errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Catch errors in child components
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details - CRITICAL for Android debugging
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to our enhanced logger (always visible on Android)
    logger.error('React Error Boundary Caught Error', error, {
      componentStack: errorInfo.componentStack,
    });

    // Also log to console.error (most reliable on Android)
    console.error('🚨 REACT ERROR BOUNDARY:', error);
    console.error('🚨 Error Message:', error.message);
    console.error('🚨 Error Stack:', error.stack);
    console.error('🚨 Component Stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });
  }

  /**
   * Reset error state
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>⚠️ Something went wrong</Text>
            <Text style={styles.subtitle}>An error occurred in the app</Text>
          </View>

          {this.state.error && (
            <View style={styles.errorSection}>
              <Text style={styles.sectionTitle}>Error Details:</Text>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
              
              {this.state.error.stack && (
                <>
                  <Text style={styles.sectionTitle}>Stack Trace:</Text>
                  <ScrollView style={styles.stackContainer} nestedScrollEnabled>
                    <Text style={styles.stackText}>{this.state.error.stack}</Text>
                  </ScrollView>
                </>
              )}
            </View>
          )}

          {this.state.errorInfo && (
            <View style={styles.errorSection}>
              <Text style={styles.sectionTitle}>Component Stack:</Text>
              <ScrollView style={styles.stackContainer} nestedScrollEnabled>
                <Text style={styles.stackText}>{this.state.errorInfo.componentStack}</Text>
              </ScrollView>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>

          <View style={styles.note}>
            <Text style={styles.noteText}>
              💡 Check the console/logs for full error details
            </Text>
            <Text style={styles.noteText}>
              All errors are logged to console.error for debugging
            </Text>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.status.error,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral.gray600,
  },
  errorSection: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.status.error,
    fontFamily: 'monospace',
  },
  stackContainer: {
    maxHeight: 200,
    backgroundColor: colors.neutral.gray100,
    padding: spacing.sm,
    borderRadius: 4,
    marginTop: spacing.xs,
  },
  stackText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray800,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.primary[600],
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  note: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
  },
  noteText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
});

