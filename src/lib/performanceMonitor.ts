/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100;

  /**
   * Mark a performance timing
   */
  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }

  /**
   * Measure duration between two marks
   */
  measure(name: string, startMark: string, endMark: string): number | null {
    if (typeof performance === 'undefined') return null;

    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0] as PerformanceEntry;
      
      this.addMetric(name, measure.duration);
      
      // Clean up
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
      
      return measure.duration;
    } catch {
      return null;
    }
  }

  /**
   * Record a metric
   */
  private addMetric(name: string, value: number): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get metrics by name
   */
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  /**
   * Get average metric value
   */
  getAverage(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Log Web Vitals
   */
  logWebVitals(): void {
    if (typeof performance === 'undefined') return;

    // First Contentful Paint
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcp) {
      console.log('FCP:', fcp.startTime, 'ms');
    }

    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime, 'ms');
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // LCP not supported
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for component performance tracking
 */
export const usePerformanceTracking = (componentName: string) => {
  const startMark = `${componentName}-start`;
  const endMark = `${componentName}-end`;

  const trackRender = () => {
    performanceMonitor.mark(startMark);
    
    return () => {
      performanceMonitor.mark(endMark);
      const duration = performanceMonitor.measure(
        `${componentName}-render`,
        startMark,
        endMark
      );
      
      if (duration && duration > 100) {
        console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    };
  };

  return { trackRender };
};

