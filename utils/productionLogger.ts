
/**
 * Production Logger
 * 
 * Centralized logging system for production environment
 * Handles error logging, analytics, and performance monitoring
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  platform: string;
  appVersion: string;
}

class ProductionLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory
  private appVersion = '1.0.0'; // Should match app.json version

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: Record<string, any>): void {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, context);
      this.addLog('debug', message, context);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    console.log(`[INFO] ${message}`, context);
    this.addLog('info', message, context);
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, context);
    this.addLog('warn', message, context);
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, error, context);
    this.addLog('error', message, context, error);
    
    // In production, you would send this to a crash reporting service
    // Example: Sentry.captureException(error, { extra: context });
  }

  /**
   * Log a fatal error (app-breaking)
   */
  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    console.error(`[FATAL] ${message}`, error, context);
    this.addLog('fatal', message, context, error);
    
    // In production, you would send this to a crash reporting service immediately
    // Example: Sentry.captureException(error, { level: 'fatal', extra: context });
  }

  /**
   * Add a log entry
   */
  private addLog(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      platform: Platform.OS,
      appVersion: this.appVersion,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Persist critical logs
    if (level === 'error' || level === 'fatal') {
      this.persistLog(entry);
    }
  }

  /**
   * Persist log to AsyncStorage
   */
  private async persistLog(entry: LogEntry): Promise<void> {
    try {
      const key = `log_${entry.timestamp}`;
      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to persist log:', error);
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get persisted logs from AsyncStorage
   */
  async getPersistedLogs(): Promise<LogEntry[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(key => key.startsWith('log_'));
      const logs = await AsyncStorage.multiGet(logKeys);
      
      return logs
        .map(([_, value]) => {
          try {
            return JSON.parse(value || '{}');
          } catch {
            return null;
          }
        })
        .filter(Boolean) as LogEntry[];
    } catch (error) {
      console.error('Failed to get persisted logs:', error);
      return [];
    }
  }

  /**
   * Clear persisted logs
   */
  async clearPersistedLogs(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(key => key.startsWith('log_'));
      await AsyncStorage.multiRemove(logKeys);
    } catch (error) {
      console.error('Failed to clear persisted logs:', error);
    }
  }

  /**
   * Track user action (for analytics)
   */
  trackAction(action: string, properties?: Record<string, any>): void {
    this.info(`User action: ${action}`, properties);
    
    // In production, you would send this to an analytics service
    // Example: Analytics.track(action, properties);
  }

  /**
   * Track screen view (for analytics)
   */
  trackScreen(screenName: string, properties?: Record<string, any>): void {
    this.info(`Screen view: ${screenName}`, properties);
    
    // In production, you would send this to an analytics service
    // Example: Analytics.screen(screenName, properties);
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`Performance: ${metric}`, { value, unit });
    
    // In production, you would send this to a performance monitoring service
    // Example: Performance.track(metric, value, unit);
  }

  /**
   * Set user context (for error reporting)
   */
  setUserContext(userId: string, email?: string, properties?: Record<string, any>): void {
    this.info('User context set', { userId, email, ...properties });
    
    // In production, you would set this in your crash reporting service
    // Example: Sentry.setUser({ id: userId, email, ...properties });
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    this.info('User context cleared');
    
    // In production, you would clear this in your crash reporting service
    // Example: Sentry.setUser(null);
  }

  /**
   * Add breadcrumb (for error context)
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    this.debug(`Breadcrumb: ${category} - ${message}`, data);
    
    // In production, you would add this to your crash reporting service
    // Example: Sentry.addBreadcrumb({ message, category, data });
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Export convenience functions
export const logDebug = (message: string, context?: Record<string, any>) => 
  logger.debug(message, context);

export const logInfo = (message: string, context?: Record<string, any>) => 
  logger.info(message, context);

export const logWarn = (message: string, context?: Record<string, any>) => 
  logger.warn(message, context);

export const logError = (message: string, error?: Error, context?: Record<string, any>) => 
  logger.error(message, error, context);

export const logFatal = (message: string, error?: Error, context?: Record<string, any>) => 
  logger.fatal(message, error, context);

export const trackAction = (action: string, properties?: Record<string, any>) => 
  logger.trackAction(action, properties);

export const trackScreen = (screenName: string, properties?: Record<string, any>) => 
  logger.trackScreen(screenName, properties);

export const trackPerformance = (metric: string, value: number, unit?: string) => 
  logger.trackPerformance(metric, value, unit);
