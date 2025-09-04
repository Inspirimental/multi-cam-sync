import { useRef, useState, useCallback, useEffect } from 'react';
import { VideoConfig } from '@/types/VideoTypes';

interface UseVideoSyncProps {
  videoConfigs: VideoConfig[];
  expandedVideo: string | null;
}

export const useVideoSync = ({ videoConfigs, expandedVideo }: UseVideoSyncProps) => {
  const MASTER_ID = videoConfigs[0]?.id || '';
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const countedRef = useRef<{ [key: string]: boolean }>({});
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoTimes, setVideoTimes] = useState<{ [key: string]: number }>({});
  const [loadedVideoCount, setLoadedVideoCount] = useState(0);
  const [allVideosLoaded, setAllVideosLoaded] = useState(false);

  const setVideoRef = useCallback((id: string) => (ref: HTMLVideoElement | null) => {
    videoRefs.current[id] = ref;
  }, []);

  // Improved synchronization function
  const syncAllVideos = useCallback((targetTime: number) => {
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.currentTime = targetTime;
      }
    });
  }, []);

  // Enhanced play/pause with performance-aware synchronization
  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      // Pause all videos
      setIsPlaying(false);
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause();
        }
      });
    } else {
      // Play logic - play all available grid videos
      const videoElements: HTMLVideoElement[] = Object.values(videoRefs.current).filter(Boolean) as HTMLVideoElement[];
      if (videoElements.length === 0) return;

      // Synchronize to expanded video if available, otherwise to master
      const referenceVideo = expandedVideo ? videoRefs.current[expandedVideo] : videoRefs.current[MASTER_ID] || videoElements[0];
      const syncTime = referenceVideo?.currentTime || 0;
      videoElements.forEach(v => { try { v.currentTime = syncTime; } catch {} });

      // Ensure readiness
      await Promise.all(videoElements.map(v => new Promise<void>((resolve) => {
        if (v.readyState >= 2) return resolve();
        const onCanPlay = () => { v.removeEventListener('canplay', onCanPlay); resolve(); };
        v.addEventListener('canplay', onCanPlay);
      })));

      // Start all
      const playPromises = videoElements.map(v => v.play().catch(err => {
        console.warn('Video failed to play', err);
      }));

      try {
        await Promise.allSettled(playPromises);
        setIsPlaying(true);
      } catch {
        setIsPlaying(true);
      }
    }
  }, [isPlaying, MASTER_ID, expandedVideo]);

  const handleSeek = useCallback((seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    syncAllVideos(newTime);
  }, [currentTime, duration, syncAllVideos]);

  const handleFrameStep = useCallback((direction: number) => {
    const frameRate = 30;
    const frameTime = 1 / frameRate;
    handleSeek(direction * frameTime);
  }, [handleSeek]);

  const onTimeUpdateFor = useCallback((id: string) => () => {
    const el = videoRefs.current[id];
    if (!el) return;
    const t = el.currentTime || 0;

    // Ensure duration is set as soon as it's known
    const dur = el.duration;
    if (typeof dur === 'number' && isFinite(dur) && dur > 0) {
      if (duration === 0 || (id === MASTER_ID && dur !== duration)) {
        setDuration(dur);
      }
    }
    
    // Drive the global progress with the expanded video, or with any advancing video if no expanded one
    const epsilon = 0.05; // ~3 frames at 60fps
    const shouldDrive = id === (expandedVideo || MASTER_ID) || (!expandedVideo && t > currentTime + epsilon);
    if (shouldDrive) setCurrentTime(t);
    
    setVideoTimes(prev => ({ ...prev, [id]: t }));
  }, [MASTER_ID, expandedVideo, duration, currentTime]);

  // Progress bar click navigation
  const handleProgressBarClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressWidth = rect.width;
    
    const percentage = Math.max(0, Math.min(1, clickX / progressWidth));
    const newTime = percentage * duration;
    
    setCurrentTime(newTime);
    syncAllVideos(newTime);
    
    if (isPlaying) {
      // Brief pause and resume for sync
      const targetVideos = Object.values(videoRefs.current);
      targetVideos.forEach(v => {
        if (v) v.pause();
      });
      
      setTimeout(() => {
        targetVideos.forEach(v => {
          if (v) {
            v.play().catch(console.warn);
          }
        });
      }, 50);
    }
  }, [duration, syncAllVideos, isPlaying]);

  return {
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
    onTimeUpdateFor,
    syncAllVideos
  };
};