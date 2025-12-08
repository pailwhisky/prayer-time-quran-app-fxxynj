
/**
 * Performance Monitor
 * 
 * Monitors app performance metrics and reports issues
 */

import { logger } from './productionLogger';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private thresholds: Map<string, number> = new Map([
    ['screen_load', 1000], // 1 second
    ['api_call', 2000], // 2 seconds
    ['database_query', 500], // 500ms
    ['image_load', 3000], // 3 seconds
  ]);

  /**
   * Start measuring a performance metric
   */
  start(metricName: string): void {
    this.metrics.set(metricName, {
      name: metricName,
      startTime: Date.now(),
    });
  }

  /**
   * End measuring a performance metric
   */
  end(metricName: string): number | null {
    const metric = this.metrics.get(metricName);
    
    if (!metric) {
      logger.warn(`Performance metric not found: ${metricName}`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Check if duration exceeds threshold
    const threshold = this.getThreshold(metricName);
    if (duration > threshold) {
      logger.warn(`Performance threshold exceeded: ${metricName}`, {
        duration,
        threshold,
        exceeded: duration - threshold,
      });
    }

    // Track the metric
    logger.trackPerformance(metricName, duration);

    // Clean up
    this.metrics.delete(metricName);

    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    metricName: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.start(metricName);
    try {
      const result = await fn();
      this.end(metricName);
      return result;
    } catch (error) {
      this.end(metricName);
      throw error;
    }
  }

  /**
   * Measure a synchronous function execution time
   */
  measureSync<T>(metricName: string, fn: () => T): T {
    this.start(metricName);
    try {
      const result = fn();
      this.end(metricName);
      return result;
    } catch (error) {
      this.end(metricName);
      throw error;
    }
  }

  /**
   * Get threshold for a metric type
   */
  private getThreshold(metricName: string): number {
    // Check for exact match
    if (this.thresholds.has(metricName)) {
      return this.thresholds.get(metricName)!;
    }

    // Check for pattern match
    for (const [pattern, threshold] of this.thresholds.entries()) {
      if (metricName.includes(pattern)) {
        return threshold;
      }
    }

    // Default threshold
    return 5000; // 5 seconds
  }

  /**
   * Set custom threshold for a metric
   */
  setThreshold(metricName: string, threshold: number): void {
    this.thresholds.set(metricName, threshold);
  }

  /**
   * Get all active metrics
   */
  getActiveMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Monitor memory usage
   */
  checkMemory(): void {
    if (__DEV__) {
      // In development, log memory usage
      // Note: This is a simplified version. In production, you'd use native modules
      logger.debug('Memory check performed');
    }
  }

  /**
   * Monitor app startup time
   */
  trackStartup(duration: number): void {
    logger.trackPerformance('app_startup', duration);
    
    if (duration > 3000) {
      logger.warn('Slow app startup detected', { duration });
    }
  }

  /**
   * Monitor screen transition time
   */
  trackScreenTransition(fromScreen: string, toScreen: string, duration: number): void {
    logger.trackPerformance('screen_transition', duration, 'ms');
    logger.addBreadcrumb(
      `Screen transition: ${fromScreen} -> ${toScreen}`,
      'navigation',
      { duration }
    );
  }

  /**
   * Monitor API call performance
   */
  trackApiCall(endpoint: string, duration: number, success: boolean): void {
    logger.trackPerformance(`api_${endpoint}`, duration);
    
    if (!success) {
      logger.warn(`API call failed: ${endpoint}`, { duration });
    } else if (duration > 2000) {
      logger.warn(`Slow API call: ${endpoint}`, { duration });
    }
  }

  /**
   * Monitor database query performance
   */
  trackDatabaseQuery(query: string, duration: number): void {
    logger.trackPerformance('database_query', duration);
    
    if (duration > 500) {
      logger.warn('Slow database query', { query, duration });
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export convenience functions
export const startMetric = (name: string) => performanceMonitor.start(name);
export const endMetric = (name: string) => performanceMonitor.end(name);
export const measureAsync = <T>(name: string, fn: () => Promise<T>) => 
  performanceMonitor.measure(name, fn);
export const measureSync = <T>(name: string, fn: () => T) => 
  performanceMonitor.measureSync(name, fn);
