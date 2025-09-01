import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  id: string;
  title: string;
  src: string;
  width: string;
  isPlaying: boolean;
  onVideoClick: (id: string) => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
  onLoadStart: () => void;
  setVideoRef: (id: string) => (ref: HTMLVideoElement | null) => void;
  videoTimes: { [key: string]: number };
  videoRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement | null }>;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  src,
  width,
  isPlaying,
  onVideoClick,
  onTimeUpdate,
  onLoadedMetadata,
  onLoadStart,
  setVideoRef,
  videoTimes,
  videoRefs
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

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

    try {
      // Attempt thumbnail generation but do not block loading indefinitely
      await generateThumbnail(video);
    } finally {
      // Notify parent that this video has loaded
      onLoadedMetadata(event);
    }
  };

  const handleError = () => {
    setHasError(true);
  };

  const handleLoadStart = () => {
    setHasError(false);
    onLoadStart();
  };

  return (
    <div className={width}>
      <Card
        className={cn(
          'relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video',
          isPlaying && 'animate-pulse-border'
        )}
        onClick={() => onVideoClick(id)}
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

        {/* Video Element */}
        <video
          ref={setVideoRef(id)}
          className="w-full h-full object-contain rounded-lg"
          poster={thumbnail || undefined}
          muted
          preload="metadata"
          playsInline
          onLoadedMetadata={handleOnLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onLoadStart={handleLoadStart}
          onError={handleError}
        >
          <source src={src} type="video/mp4" />
        </video>

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