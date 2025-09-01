/**
 * Video playback utilities - optimized for high performance multi-video streams
 */

export interface PerformanceCapabilities {
  cores: number;
  memory: number;
  isMobile: boolean;
}

/**
 * Detects device performance capabilities for informational purposes
 */
export const detectPerformanceCapability = (): PerformanceCapabilities => {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 2; // GB - Chrome only
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);

  return { cores, memory, isMobile };
};