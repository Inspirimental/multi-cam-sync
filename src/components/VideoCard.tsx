import React, { useState, useRef, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  // Generate thumbnail from frame 20
  const generateThumbnail = async (video: HTMLVideoElement) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Wait for video to be ready and seek to frame 20 (assuming 30fps, frame 20 = ~0.67s)
      const targetTime = 20 / 30; // Frame 20 at 30fps
      video.currentTime = targetTime;
      
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
          setThumbnail(thumbnailUrl);
          
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });
    } catch (error) {
      console.warn(`Failed to generate thumbnail for ${id}:`, error);
    }
  };

  const handleLoadedData = async (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    
    try {
      // Generate thumbnail
      await generateThumbnail(video);
      
      // Reset video to start after thumbnail generation
      video.currentTime = videoTimes[id] || 0;
      setIsLoading(false);
    } catch (error) {
      console.warn(`Error loading video ${id}:`, error);
      setHasError(true);
      setIsLoading(false);
    }
    
    onLoadedMetadata(event);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart();
  };

  return (
    <div className={width}>
      <Card
        className={cn(
          "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
          isPlaying && "animate-pulse-border"
        )}
        onClick={() => onVideoClick(id)}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-video-bg rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full animate-spin border-2 border-primary border-t-transparent" />
              <div className="text-xs text-muted-foreground">Loading...</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
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
          className={cn(
            "w-full h-full object-contain rounded-lg",
            isLoading && "opacity-0"
          )}
          poster={thumbnail || undefined}
          muted
          preload="metadata"
          playsInline
          onLoadedData={handleLoadedData}
          onTimeUpdate={onTimeUpdate}
          onLoadStart={handleLoadStart}
          onError={handleError}
          style={{
            visibility: isLoading ? 'hidden' : 'visible'
          }}
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

        {/* Loading Indicator Badge */}
        {isLoading && (
          <div className="absolute top-2 left-2 bg-primary/80 px-2 py-1 rounded text-xs text-primary-foreground animate-pulse">
            Loading
          </div>
        )}
      </Card>
    </div>
  );
};