import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Maximize2, Play, Pause, X, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/videoUtils';
import Hls from 'hls.js';

interface VideoCardProps {
  id: string;
  title: string;
  src: string;
  width: string;
  isPlaying: boolean;
  isExpanded?: boolean;
  onVideoClick: (id: string) => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
  onLoadStart: () => void;
  setVideoRef: (id: string) => (ref: HTMLVideoElement | null) => void;
  videoTimes: { [key: string]: number };
  videoRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement | null }>;
  onError?: (event: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  src,
  width,
  isPlaying,
  isExpanded,
  onVideoClick,
  onTimeUpdate,
  onLoadedMetadata,
  onLoadStart,
  setVideoRef,
  videoTimes,
  videoRefs,
  onError,
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const hasSrc = Boolean(src);
  const hlsRef = useRef<Hls | null>(null);
  
  // Initialize HLS for .m3u8 streams
  useEffect(() => {
    const video = videoRefs.current[id];
    if (!video || !src) return;

    // Check if this is an HLS stream
    const isHLS = src.includes('.m3u8');

    // Prefer native HLS (Safari) first to avoid CORS issues with XHR
    if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (isHLS && Hls.isSupported()) {
      // Use Hls.js for browsers without native HLS support
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      const isCrossOrigin = (() => {
        try {
          const u = new URL(src, window.location.href);
          return u.origin !== window.location.origin;
        } catch {
          return false;
        }
      })();

      // Check if this is a CloudFront URL that needs signed cookies
      const isCloudFront = src.includes('cloudfront.net') || src.includes('.amazonaws.com');
      
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
        fragLoadingMaxRetry: 1,
        manifestLoadingMaxRetry: 1,
      });
      
      hlsRef.current = hls;
      const sourceUrl = src;
      console.log('[HLS] loading', sourceUrl);
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('[HLS Error]', id, data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('[HLS] NETWORK_ERROR -> retry startLoad', id);
              try { hls.startLoad(); } catch {}
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('[HLS] MEDIA_ERROR -> recoverMediaError', id);
              try { hls.recoverMediaError(); } catch {}
              break;
            default:
              setHasError(true);
              try { video.dispatchEvent(new Event('error')); } catch {}
          }
        }
      });
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[HLS] Manifest parsed for', id);
        try { video.dispatchEvent(new Event('loadedmetadata')); } catch {}
      });
      
    } else if (!isHLS) {
      // Regular video file
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, id, videoRefs]);

  const handlePlayPause = () => {
    const video = videoRefs.current[id];
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsVideoPlaying(true);
    } else {
      video.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRefs.current[id];
    if (!video) return;
    
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip10SecondsBack = () => {
    const video = videoRefs.current[id];
    if (!video) return;
    
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skip10SecondsForward = () => {
    const video = videoRefs.current[id];
    if (!video) return;
    
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };

  const frameBack = () => {
    const video = videoRefs.current[id];
    if (!video) return;
    
    // Assuming 30fps, one frame = 1/30 second
    video.currentTime = Math.max(0, video.currentTime - (1/30));
  };

  const frameForward = () => {
    const video = videoRefs.current[id];
    if (!video) return;
    
    // Assuming 30fps, one frame = 1/30 second
    video.currentTime = Math.min(video.duration, video.currentTime + (1/30));
  };

  const closeModal = () => {
    onVideoClick(id); // This should close the expanded state
  };

  // Helper: wait for an event with timeout
  const waitForEvent = (el: HTMLVideoElement, event: keyof HTMLMediaElementEventMap, timeout = 800) => {
    return new Promise<void>((resolve) => {
      let resolved = false;
      const on = () => {
        if (resolved) return;
        resolved = true;
        el.removeEventListener(event, on as any);
        resolve();
      };
      const to = window.setTimeout(() => {
        if (resolved) return;
        resolved = true;
        el.removeEventListener(event, on as any);
        resolve();
      }, timeout);
      el.addEventListener(event, on as any, { once: true });
    });
  };

  // Generate thumbnail (try frame 20, fallback to first frame)
  const generateThumbnail = async (video: HTMLVideoElement) => {
    try {
      // Ensure at least the first frame is available
      if (video.readyState < 2) {
        await waitForEvent(video, 'loadeddata', 1200);
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const prevTime = video.currentTime;
      const targetTime = 20 / 30; // ~0.67s @30fps

      // Try seeking to target time if possible
      let drew = false;
      try {
        if (
          video.seekable &&
          video.seekable.length > 0 &&
          video.seekable.end(video.seekable.length - 1) >= targetTime
        ) {
          video.currentTime = targetTime;
          await waitForEvent(video, 'seeked', 700);
        }
      } catch {}

      try {
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 180;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnail(url);
        drew = true;
      } catch (err) {
        // Cross-origin or canvas error: silently ignore, we'll just skip thumbnail
        console.warn(`Thumbnail draw failed for ${id}`, err);
      }

      // Restore time
      try {
        video.currentTime = videoTimes[id] || prevTime || 0;
      } catch {}

      return drew;
    } catch (error) {
      console.warn(`Failed to generate thumbnail for ${id}:`, error);
      return false;
    }
  };

  const handleOnLoadedMetadata = async (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    setDuration(video.duration);
    setCurrentTime(video.currentTime);

    try {
      // Attempt thumbnail generation but do not block loading indefinitely
      await generateThumbnail(video);
    } finally {
      // Notify parent that this video has loaded
      onLoadedMetadata(event);
    }
  };

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    setCurrentTime(video.currentTime);
    onTimeUpdate();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('[video] error details', id, {
      error: e.currentTarget.error,
      networkState: e.currentTarget.networkState,
      readyState: e.currentTarget.readyState,
      src: e.currentTarget.src,
      currentSrc: e.currentTarget.currentSrc
    });
    setHasError(true);
    onError?.(e);
  };

  const handleLoadStart = () => {
    setHasError(false);
    onLoadStart();
  };

  return (
    <div className={width}>
      <Card
        className={cn(
          'relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group w-full aspect-video',
          isPlaying && 'animate-pulse-border'
        )}
        onClick={() => hasSrc && onVideoClick(id)}
      >
        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-video-bg rounded-lg">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="text-xs">Failed to load</div>
              <div className="text-xs opacity-60">{title}</div>
            </div>
          </div>
        )}

        {hasSrc && (
          <>
            {isExpanded && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" />
            )}
            <video
              ref={setVideoRef(id)}
              className={cn(
                "w-full h-full object-contain rounded-lg",
                isExpanded && "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[61] max-w-[90vw] max-h-[90vh]"
              )}
              poster={thumbnail || undefined}
              muted
              preload={isExpanded ? 'auto' : 'metadata'}
              playsInline
              crossOrigin={src.includes('cloudfront.net') || src.includes('.amazonaws.com') ? 'use-credentials' : undefined}
              onLoadedMetadata={handleOnLoadedMetadata}
              onLoadedData={handleOnLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onLoadStart={handleLoadStart}
              onError={handleError}
              onPause={() => {
                console.log('[video] pause', id);
                setIsVideoPlaying(false);
              }}
              onWaiting={() => console.log('[video] waiting', id)}
              onPlaying={() => {
                console.log('[video] playing', id);
                setIsVideoPlaying(true);
              }}
            />

            {/* Video Controls for Expanded View */}
            {isExpanded && (
              <>
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="fixed top-4 right-4 z-[62] bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeModal();
                  }}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Video Controls */}
                <div 
                  className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[62] bg-black/80 rounded-lg p-4 min-w-96"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Control Buttons and Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* 10 seconds back */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          skip10SecondsBack();
                        }}
                        title="10 Sekunden zurück"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>

                      {/* Frame back */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          frameBack();
                        }}
                        title="Ein Frame zurück"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Play/Pause */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPause();
                        }}
                      >
                        {isVideoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>

                      {/* Frame forward */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          frameForward();
                        }}
                        title="Ein Frame vor"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* 10 seconds forward */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          skip10SecondsForward();
                        }}
                        title="10 Sekunden vor"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />

        {/* Video Title */}
        <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
          {title}
        </div>

        {/* Maximize Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
        >
          <Maximize2 className="h-3 w-3" />
        </Button>

      </Card>
    </div>
  );
};