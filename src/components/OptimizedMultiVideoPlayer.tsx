import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import VideoFileImporter from './VideoFileImporter';
import { LoadingModal } from './LoadingModal';
import { VideoStreamHeader } from './VideoStreamHeader';
import { VideoPlayerControls } from './VideoPlayerControls';
import { VideoGridLayout } from './VideoGridLayout';
import { VideoPlayerProps } from '@/types/VideoTypes';
import { createVideoConfigs } from '@/utils/videoGridUtils';
import { useVideoSync } from '@/hooks/useVideoSync';

const OptimizedMultiVideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoFiles = {}, 
  cloudFrontData,
  onClose, 
  streamName = "Vehicle Camera Monitor"
}) => {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [loadedVideos, setLoadedVideos] = useState<{ [key: string]: string }>({});
  
  // Create video configs - prioritize CloudFront data
  const videoConfigs = createVideoConfigs(videoFiles, cloudFrontData);

  // Video synchronization and state management
  const {
    videoRefs,
    countedRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    videoTimes,
    setVideoTimes,
    loadedVideoCount,
    setLoadedVideoCount,
    allVideosLoaded,
    setAllVideosLoaded,
    setVideoRef,
    handlePlayPause,
    handleSeek,
    handleFrameStep,
    handleProgressBarClick,
    onTimeUpdateFor
  } = useVideoSync({ videoConfigs, expandedVideo });

  const hasExternalVideos = Object.keys(videoFiles).length > 0;
  const srcFor = useCallback((id: string) => loadedVideos[id] || (videoConfigs.find(v => v.id === id)?.src || ''), [loadedVideos, videoConfigs]);
  const totalToLoad = videoConfigs.filter(v => Boolean(srcFor(v.id))).length;

  // Seamless video expansion with explicit stop requirement
  const handleVideoClick = useCallback((videoId: string) => {
    const currentVideo = videoRefs.current[videoId];
    const videoCurrentTime = currentVideo?.currentTime ?? currentTime ?? 0;
    const nextExpanded = expandedVideo === videoId ? null : videoId;

    // Always stop playback first and require manual resume
    setIsPlaying(false);
    Object.values(videoRefs.current).forEach(v => {
      if (!v) return;
      try { v.pause(); } catch {}
    });

    // Keep all videos in sync with the clicked video's time
    Object.values(videoRefs.current).forEach(v => {
      if (!v) return;
      try { v.currentTime = videoCurrentTime; } catch {}
    });

    // Toggle expanded view after stopping
    setExpandedVideo(nextExpanded);

    // Update displayed time
    setCurrentTime(videoCurrentTime);
  }, [expandedVideo, currentTime, videoRefs, setIsPlaying, setCurrentTime]);

  const handleVideoLoad = useCallback((videoId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setLoadedVideos(prev => ({ ...prev, [videoId]: url }));
  }, []);

  // Helper function to handle video metadata loading with progress tracking
  const handleVideoLoadedMetadata = useCallback((videoId: string) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (countedRef.current[videoId]) return;
    countedRef.current[videoId] = true;

    const el = (e.currentTarget as HTMLVideoElement | null);
    const dur = el?.duration;
    if (el && typeof dur === 'number' && isFinite(dur) && dur > 0) {
      // Prefer first video duration; otherwise set once if not set yet
      if (videoConfigs[0] && videoId === videoConfigs[0].id) {
        setDuration(dur);
        console.log('[duration] set from MASTER', dur);
      } else if (duration === 0) {
        setDuration(dur);
        console.log('[duration] initial set from', videoId, dur);
      }
    }

    console.log('[video] loaded', videoId);
    setLoadedVideoCount(prev => {
      const newCount = prev + 1;
      if (newCount >= totalToLoad) setAllVideosLoaded(true);
      return newCount;
    });
  }, [videoConfigs, totalToLoad, duration, countedRef, setDuration, setLoadedVideoCount, setAllVideosLoaded]);

  // Count errors as finished to avoid blocking the loader forever
  const handleVideoError = useCallback((videoId: string) => (_e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (countedRef.current[videoId]) return;
    countedRef.current[videoId] = true;
    console.warn('[video] error', videoId);
    setLoadedVideoCount(prev => {
      const newCount = prev + 1;
      if (newCount >= totalToLoad) setAllVideosLoaded(true);
      return newCount;
    });
  }, [totalToLoad, countedRef, setLoadedVideoCount, setAllVideosLoaded]);

  return (
    <div className="w-full bg-background space-y-4">
      <LoadingModal
        isOpen={!allVideosLoaded && totalToLoad > 0}
        loadedVideos={loadedVideoCount}
        totalVideos={totalToLoad}
      />
      
      <VideoStreamHeader
        streamName={streamName}
        cloudFrontData={cloudFrontData}
        currentTime={currentTime}
        duration={duration}
      />

      {/* Video File Importer */}
      {Object.keys(videoFiles).length === 0 && (
        <VideoFileImporter
          videoConfigs={videoConfigs}
          loadedVideos={loadedVideos}
          onVideoLoad={handleVideoLoad}
        />
      )}

      {/* Multi-Video Grid */}
      <div className="relative flex-1">
        <VideoGridLayout
          videoConfigs={videoConfigs}
          isPlaying={isPlaying}
          expandedVideo={expandedVideo}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
          onVideoClick={handleVideoClick}
          onTimeUpdateFor={onTimeUpdateFor}
          onVideoLoadedMetadata={handleVideoLoadedMetadata}
          onVideoError={handleVideoError}
          setVideoRef={setVideoRef}
          srcFor={srcFor}
        />

        {/* Close button when expanded */}
        {expandedVideo && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 z-[70] bg-control-bg/80 hover:bg-control-hover text-foreground"
            onClick={() => expandedVideo && handleVideoClick(expandedVideo)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Transport Controls */}
      <VideoPlayerControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onFrameStep={handleFrameStep}
        onProgressBarClick={handleProgressBarClick}
      />
    </div>
  );
};

export default OptimizedMultiVideoPlayer;
