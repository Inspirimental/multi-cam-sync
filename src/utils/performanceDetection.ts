export type PerformanceMode = 'high' | 'low';

export interface PerformanceCapabilities {
  cores: number;
  memory: number;
  isMobile: boolean;
  isLowEnd: boolean;
}

/**
 * Detects device performance capabilities for video playback optimization
 */
export const detectPerformanceCapability = (): PerformanceCapabilities => {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 2; // GB - Chrome only
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
  
  // Consider low-end if:
  // - Mobile device with <=2 cores OR
  // - Desktop with <=2 cores and <=4GB RAM OR
  // - Any device with <=1GB RAM
  const isLowEnd = (isMobile && cores <= 2) || 
                   (!isMobile && cores <= 2 && memory <= 4) || 
                   memory <= 1;

  return { cores, memory, isMobile, isLowEnd };
};

/**
 * Determines optimal performance mode based on device capabilities
 */
export const getOptimalPerformanceMode = (): PerformanceMode => {
  const capabilities = detectPerformanceCapability();
  return capabilities.isLowEnd ? 'low' : 'high';
};

/**
 * Performance monitoring for adaptive switching
 */
export class PerformanceMonitor {
  private frameDrops = 0;
  private totalFrames = 0;
  private monitoring = false;
  private onPerformanceIssue?: () => void;

  constructor(onPerformanceIssue?: () => void) {
    this.onPerformanceIssue = onPerformanceIssue;
  }

  startMonitoring() {
    if (this.monitoring) return;
    this.monitoring = true;
    this.frameDrops = 0;
    this.totalFrames = 0;
    this.monitorFrame();
  }

  stopMonitoring() {
    this.monitoring = false;
  }

  private monitorFrame() {
    if (!this.monitoring) return;

    requestAnimationFrame(() => {
      this.totalFrames++;
      
      // Check for performance issues every 60 frames (~1 second at 60fps)
      if (this.totalFrames % 60 === 0) {
        const dropRate = this.frameDrops / this.totalFrames;
        
        // If more than 10% frame drops, consider it a performance issue
        if (dropRate > 0.1 && this.onPerformanceIssue) {
          this.onPerformanceIssue();
          return;
        }
      }
      
      this.monitorFrame();
    });
  }

  reportFrameDrop() {
    this.frameDrops++;
  }

  getStats() {
    return {
      frameDrops: this.frameDrops,
      totalFrames: this.totalFrames,
      dropRate: this.totalFrames > 0 ? this.frameDrops / this.totalFrames : 0
    };
  }
}