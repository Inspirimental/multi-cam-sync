import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Maximize2, Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const hasSrc = Boolean(src);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRefs.current[id];
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRefs.current[id];
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
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
          'relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video',
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
              disablePictureInPicture
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
            >
              <source src={src} type="video/mp4" />
            </video>

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
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[62] bg-black/80 rounded-lg p-4 min-w-96">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Control Buttons and Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
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