
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <IconSymbol name="exclamationmark.triangle.fill" size={64} color={colors.highlight} />
            
            <Text style={styles.title}>Oops! Something went wrong</Text>
            
            <Text style={styles.message}>
              We&apos;re sorry for the inconvenience. The app encountered an unexpected error.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorText}>{this.state.errorInfo.componentStack}</Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <IconSymbol name="arrow.clockwise" size={20} color={colors.card} />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
              If the problem persists, please try restarting the app.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetails: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.highlight,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
