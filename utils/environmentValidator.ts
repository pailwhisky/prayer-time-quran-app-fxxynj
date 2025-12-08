
/**
 * Environment Validator
 * 
 * Validates that all required environment variables are set
 * Prevents runtime errors due to missing configuration
 */

import { logger } from './productionLogger';

export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  revenueCatApiKey: string;
  environment: 'development' | 'staging' | 'production';
}

class EnvironmentValidator {
  private config: EnvironmentConfig | null = null;
  private validated = false;

  /**
   * Validate all required environment variables
   */
  validate(): EnvironmentConfig {
    if (this.validated && this.config) {
      return this.config;
    }

    logger.info('Validating environment configuration...');

    const errors: string[] = [];

    // Check Supabase URL
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      errors.push('EXPO_PUBLIC_SUPABASE_URL is not set');
    } else if (!supabaseUrl.startsWith('https://')) {
      errors.push('EXPO_PUBLIC_SUPABASE_URL must start with https://');
    }

    // Check Supabase Anon Key
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseAnonKey) {
      errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
    }

    // RevenueCat API Key (optional in development)
    const revenueCatApiKey = 'test_amHZgULphTOfAXgpIlAcujAxXvZ'; // Hardcoded for now
    if (!revenueCatApiKey && !__DEV__) {
      errors.push('RevenueCat API key is not configured');
    }

    // Determine environment
    const environment = __DEV__ ? 'development' : 'production';

    if (errors.length > 0) {
      const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
      logger.fatal(errorMessage);
      throw new Error(errorMessage);
    }

    this.config = {
      supabaseUrl: supabaseUrl!,
      supabaseAnonKey: supabaseAnonKey!,
      revenueCatApiKey,
      environment,
    };

    this.validated = true;

    logger.info('Environment validation successful', {
      environment,
      supabaseUrl: supabaseUrl!.substring(0, 30) + '...',
    });

    return this.config;
  }

  /**
   * Get validated configuration
   */
  getConfig(): EnvironmentConfig {
    if (!this.validated || !this.config) {
      return this.validate();
    }
    return this.config;
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.getConfig().environment === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.getConfig().environment === 'development';
  }

  /**
   * Get environment name
   */
  getEnvironment(): string {
    return this.getConfig().environment;
  }
}

// Export singleton instance
export const environmentValidator = new EnvironmentValidator();

// Export convenience functions
export const validateEnvironment = () => environmentValidator.validate();
export const getEnvironmentConfig = () => environmentValidator.getConfig();
export const isProduction = () => environmentValidator.isProduction();
export const isDevelopment = () => environmentValidator.isDevelopment();
