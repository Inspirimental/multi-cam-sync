import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoFileImporter from './VideoFileImporter';
import { VideoCard } from './VideoCard';
import { LoadingModal } from './LoadingModal';
import { VideoPlayerProps, VideoFile } from '@/types/VideoTypes';
import { getOptimalPerformanceMode, PerformanceMonitor, type PerformanceMode } from '@/utils/performanceDetection';
import { useToast } from '@/hooks/use-toast';

interface VideoConfig {
  id: string;
  name: string;
  title: string;
  position: 'front' | 'back' | 'side';
  src: string;
}

const defaultVideoConfigs: VideoConfig[] = [
  { id: 'NCBSC_front', name: 'NCBSC_front.mp4', title: 'Front Camera', position: 'front', src: '/videos/NCBSC_front.mp4' },
  { id: 'TCBSC_back', name: 'TCBSC_back.mp4', title: 'Back Camera', position: 'back', src: '/videos/TCBSC_back.mp4' },
  { id: 'TCMVC_back', name: 'TCMVC_back.mp4', title: 'Back Center', position: 'back', src: '/videos/TCMVC_back.mp4' },
  { id: 'NLBSC_left', name: 'NLBSC_left.mp4', title: 'Left Side', position: 'side', src: '/videos/NLBSC_left.mp4' },
  { id: 'NLMVC_back_left', name: 'NLMVC_back_left.mp4', title: 'Back Left', position: 'side', src: '/videos/NLMVC_back_left.mp4' },
  { id: 'NLMVC_front_left', name: 'NLMVC_front_left.mp4', title: 'Front Left', position: 'side', src: '/videos/NLMVC_front_left.mp4' },
  { id: 'NRBSC_right', name: 'NRBSC_right.mp4', title: 'Right Side', position: 'side', src: '/videos/NRBSC_right.mp4' },
  { id: 'NRMVC_back_right', name: 'NRMVC_back_right.mp4', title: 'Back Right', position: 'side', src: '/videos/NRMVC_back_right.mp4' },
  { id: 'NRMVC_front_right', name: 'NRMVC_front_right.mp4', title: 'Front Right', position: 'side', src: '/videos/NRMVC_front_right.mp4' },
  { id: 'WCNVC_front', name: 'WCNVC_front.mp4', title: 'Wide Front', position: 'front', src: '/videos/WCNVC_front.mp4' },
  { id: 'WCWVC_front', name: 'WCWVC_front.mp4', title: 'Wide Center', position: 'front', src: '/videos/WCWVC_front.mp4' },
];

interface OptimizedVideoPlayerProps extends VideoPlayerProps {
  forcePerformanceMode?: PerformanceMode;
}

const OptimizedMultiVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({ 
  videoFiles = {}, 
  onClose, 
  streamName = "Vehicle Camera Monitor",
  forcePerformanceMode
}) => {
  // Performance mode detection and state
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(
    forcePerformanceMode || getOptimalPerformanceMode()
  );
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);
  const performanceMonitor = useRef<PerformanceMonitor>();
  const { toast } = useToast();

  // Merge external video files with default config
  const videoConfigs = defaultVideoConfigs.map(config => ({
    ...config,
    src: videoFiles[config.id] || config.src
  }));

  const MASTER_ID = videoConfigs[0].id;
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const countedRef = useRef<{ [key: string]: boolean }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [loadedVideos, setLoadedVideos] = useState<{ [key: string]: string }>({});
  const [videoTimes, setVideoTimes] = useState<{ [key: string]: number }>({});
  const [loadedVideoCount, setLoadedVideoCount] = useState(0);
  const [allVideosLoaded, setAllVideosLoaded] = useState(false);
  const hasExternalVideos = Object.keys(videoFiles).length > 0;
  const srcFor = useCallback((id: string) => loadedVideos[id] || (hasExternalVideos ? (videoConfigs.find(v => v.id === id)?.src || '') : ''), [loadedVideos, hasExternalVideos, videoConfigs]);
  const totalToLoad = videoConfigs.filter(v => Boolean(srcFor(v.id))).length;

  // Initialize performance monitor
  useEffect(() => {
    if (performanceMode === 'high') {
      performanceMonitor.current = new PerformanceMonitor(() => {
        toast({
          title: "Performance Issue Detected",
          description: "Switching to compatibility mode for better performance.",
        });
        setPerformanceMode('low');
      });
      performanceMonitor.current.startMonitoring();
    }

    return () => {
      performanceMonitor.current?.stopMonitoring();
    };
  }, [performanceMode, toast]);

  const setVideoRef = useCallback((id: string) => (ref: HTMLVideoElement | null) => {
    videoRefs.current[id] = ref;
  }, []);

  // Improved synchronization function
  const syncAllVideos = useCallback((targetTime: number) => {
    if (performanceMode === 'high') {
      // In high performance mode, sync all videos including background ones
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.currentTime = targetTime;
        }
      });
    } else {
      // In low performance mode, only sync active videos
      const activeVideos = expandedVideo ? [expandedVideo] : Object.keys(videoRefs.current);
      activeVideos.forEach(id => {
        const video = videoRefs.current[id];
        if (video) {
          video.currentTime = targetTime;
        }
      });
    }
  }, [performanceMode, expandedVideo]);

  // Enhanced play/pause with performance-aware synchronization
  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      // Pause logic differs by performance mode
      setIsPlaying(false);
      if (performanceMode === 'high') {
        // In high performance mode, pause all videos
        Object.values(videoRefs.current).forEach(video => {
          if (video) {
            video.pause();
          }
        });
      } else {
        // In low performance mode, pause only active videos
        const activeVideos = expandedVideo ? [expandedVideo] : Object.keys(videoRefs.current);
        activeVideos.forEach(id => {
          const video = videoRefs.current[id];
          if (video) {
            video.pause();
          }
        });
      }
    } else {
      // Play logic
      const activeVideos = performanceMode === 'high' 
        ? videoConfigs.map(v => v.id) // All videos in high performance mode
        : expandedVideo ? [expandedVideo] : videoConfigs.map(v => v.id); // Active videos only in low performance mode
      
      const videoElements = activeVideos
        .map(id => videoRefs.current[id])
        .filter((video): video is HTMLVideoElement => video !== null);

      if (videoElements.length === 0) return;

      // Synchronization
      const masterVideo = videoRefs.current[MASTER_ID] || videoElements[0];
      const syncTime = masterVideo.currentTime;
      
      videoElements.forEach(video => {
        video.currentTime = syncTime;
      });

      // Wait for videos to be ready
      await Promise.all(videoElements.map(video => 
        new Promise<void>(resolve => {
          if (video.readyState >= 2) {
            resolve();
          } else {
            const handleCanPlay = () => {
              video.removeEventListener('canplay', handleCanPlay);
              resolve();
            };
            video.addEventListener('canplay', handleCanPlay);
          }
        })
      ));

      // Start videos
      const playPromises = videoElements.map(video => {
        return video.play().catch(error => {
          console.warn(`Video ${video.src} failed to play:`, error);
          performanceMonitor.current?.reportFrameDrop();
        });
      });

      try {
        await Promise.all(playPromises);
        setIsPlaying(true);
      } catch (error) {
        console.warn('Some videos failed to start:', error);
        setIsPlaying(true);
      }
    }
  }, [isPlaying, expandedVideo, videoConfigs, MASTER_ID, performanceMode]);

  const handleSeek = useCallback((seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    syncAllVideos(newTime);
  }, [currentTime, duration, syncAllVideos]);

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
      const activeVideos = performanceMode === 'high' 
        ? Object.values(videoRefs.current)
        : (expandedVideo ? [videoRefs.current[expandedVideo]] : Object.values(videoRefs.current));
      
      activeVideos.forEach(video => {
        if (video) {
          video.pause();
        }
      });
      
      setTimeout(() => {
        activeVideos.forEach(video => {
          if (video) {
            video.play().catch(console.warn);
          }
        });
      }, 50);
    }
  }, [duration, syncAllVideos, isPlaying, performanceMode, expandedVideo]);

  const handleFrameStep = useCallback((direction: number) => {
    const frameRate = 30;
    const frameTime = 1 / frameRate;
    handleSeek(direction * frameTime);
  }, [handleSeek]);

  const onTimeUpdateFor = useCallback((id: string) => () => {
    const el = videoRefs.current[id];
    if (!el) return;
    const t = el.currentTime || 0;
    
    // Update main time based on performance mode and active video
    if (performanceMode === 'high') {
      // In high performance mode, use expanded video or master as time source
      if (id === (expandedVideo || MASTER_ID)) setCurrentTime(t);
    } else {
      // In low performance mode, use master or expanded video
      if (id === MASTER_ID || id === expandedVideo) setCurrentTime(t);
    }
    
    setVideoTimes(prev => ({ ...prev, [id]: t }));
  }, [MASTER_ID, expandedVideo, performanceMode]);

  // Seamless video expansion for high performance mode
  const handleVideoClick = useCallback((videoId: string) => {
    const currentVideo = videoRefs.current[videoId];
    const currentTime = currentVideo?.currentTime || 0;
    
    if (performanceMode === 'high') {
      // High performance mode: preserve playback state and position
      setExpandedVideo(expandedVideo === videoId ? null : videoId);
      
      // Maintain synchronization - set current time for the expanded video
      if (currentVideo) {
        setCurrentTime(currentTime);
        // Sync all other videos to this time
        Object.values(videoRefs.current).forEach(video => {
          if (video && video !== currentVideo) {
            video.currentTime = currentTime;
          }
        });
      }
    } else {
      // Low performance mode: save state before switching
      if (!expandedVideo && currentVideo) {
        setVideoTimes(prev => ({
          ...prev,
          [videoId]: currentTime
        }));
      }
      
      if (expandedVideo === videoId && videoRefs.current[expandedVideo]) {
        setVideoTimes(prev => ({
          ...prev,
          [expandedVideo]: videoRefs.current[expandedVideo]?.currentTime || 0
        }));
      }
      
      setExpandedVideo(expandedVideo === videoId ? null : videoId);
      
      // Pause all videos in low performance mode
      setIsPlaying(false);
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause();
        }
      });
    }
  }, [expandedVideo, performanceMode]);

  const handleVideoLoad = useCallback((videoId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setLoadedVideos(prev => ({ ...prev, [videoId]: url }));
  }, []);

  // Helper function to handle video metadata loading with progress tracking
  const handleVideoLoadedMetadata = useCallback((videoId: string) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (countedRef.current[videoId]) return;
    countedRef.current[videoId] = true;

    const el = (e.currentTarget as HTMLVideoElement | null);
    if (videoId === MASTER_ID && el) setDuration(el.duration);

    console.log('[video] loaded', videoId);
    setLoadedVideoCount(prev => {
      const newCount = prev + 1;
      if (newCount >= totalToLoad) setAllVideosLoaded(true);
      return newCount;
    });
  }, [MASTER_ID, totalToLoad]);

  // Count errors as finished to avoid blocking the loader forever
  const handleVideoError = useCallback((videoId: string) => (_e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (countedRef.current[videoId]) return;
    countedRef.current[videoId] = true;
    console.warn('[video] error', videoId);
    performanceMonitor.current?.reportFrameDrop();
    setLoadedVideoCount(prev => {
      const newCount = prev + 1;
      if (newCount >= totalToLoad) setAllVideosLoaded(true);
      return newCount;
    });
  }, [totalToLoad]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      const firstVideo = Object.values(videoRefs.current)[0];
      if (firstVideo) {
        setCurrentTime(firstVideo.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      const firstVideo = Object.values(videoRefs.current)[0];
      if (firstVideo) {
        setDuration(firstVideo.duration);
      }
    };

    const firstVideo = Object.values(videoRefs.current)[0];
    if (firstVideo) {
      firstVideo.addEventListener('timeupdate', handleTimeUpdate);
      firstVideo.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        firstVideo.removeEventListener('timeupdate', handleTimeUpdate);
        firstVideo.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  useEffect(() => {
    Object.keys(loadedVideos).forEach((id) => {
      const v = videoRefs.current[id];
      if (v) v.load();
    });
    countedRef.current = {};
    setLoadedVideoCount(0);
    setAllVideosLoaded(totalToLoad === 0);
    setIsPlaying(false);
  }, [loadedVideos, totalToLoad]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
      }

      switch (e.code) {
        case 'Space':
          handlePlayPause();
          break;
        case 'ArrowLeft':
          handleFrameStep(-1);
          break;
        case 'ArrowRight':
          handleFrameStep(1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePlayPause, handleFrameStep]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Performance mode toggle
  const togglePerformanceMode = useCallback(() => {
    const newMode: PerformanceMode = performanceMode === 'high' ? 'low' : 'high';
    setPerformanceMode(newMode);
    toast({
      title: "Performance Mode Changed",
      description: `Switched to ${newMode === 'high' ? 'High Performance' : 'Compatibility'} mode.`,
    });
  }, [performanceMode, toast]);

  const videoLayout = [
    { id: 'NLMVC_front_left', title: 'Front Left', size: 'small' },
    { id: 'NCBSC_front', title: 'Front Camera', size: 'large' },
    { id: 'NRMVC_front_right', title: 'Front Right', size: 'small' },
    { id: 'WCWVC_front', title: 'Wide Center', size: 'medium', span: 'center' },
    { id: 'NLBSC_left', title: 'Left Side', size: 'small' },
    { id: 'WCNVC_front', title: 'Wide Front', size: 'medium' },
    { id: 'NRBSC_right', title: 'Right Side', size: 'small' },
    { id: 'TCMVC_back', title: 'Back Center', size: 'medium', span: 'center' },
    { id: 'NLMVC_back_left', title: 'Back Left', size: 'small' },
    { id: 'TCBSC_back', title: 'Back Camera', size: 'large' },
    { id: 'NRMVC_back_right', title: 'Back Right', size: 'small' },
  ];

  return (
    <div className="w-full min-h-screen bg-background p-4 space-y-4">
      <LoadingModal 
        isOpen={!allVideosLoaded && totalToLoad > 0}
        loadedVideos={loadedVideoCount}
        totalVideos={totalToLoad}
      />
      
      {/* Header with Performance Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">{streamName}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPerformanceSettings(!showPerformanceSettings)}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              {performanceMode === 'high' ? 'High Performance' : 'Compatibility'}
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Performance Settings */}
      {showPerformanceSettings && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Performance Mode</h3>
              <p className="text-sm text-muted-foreground">
                {performanceMode === 'high' 
                  ? 'All videos run continuously for seamless playback' 
                  : 'Videos pause in background to save resources'}
              </p>
            </div>
            <Button onClick={togglePerformanceMode} variant="outline">
              Switch to {performanceMode === 'high' ? 'Compatibility' : 'High Performance'}
            </Button>
          </div>
        </Card>
      )}

      {/* Video File Importer */}
      {Object.keys(videoFiles).length === 0 && (
        <VideoFileImporter
          videoConfigs={videoConfigs}
          loadedVideos={loadedVideos}
          onVideoLoad={handleVideoLoad}
        />
      )}

      {/* Video Grid with Performance-Aware Rendering */}
      <div className="relative flex-1">
        {expandedVideo ? (
          <Card className="relative w-full aspect-video bg-video-bg border-video-border animate-fade-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-control-bg/80 hover:bg-control-hover text-foreground"
              onClick={() => { 
                if (performanceMode === 'low') {
                  // Save current time before closing in low performance mode
                  if (expandedVideo && videoRefs.current[expandedVideo]) {
                    setVideoTimes(prev => ({
                      ...prev,
                      [expandedVideo]: videoRefs.current[expandedVideo]?.currentTime || 0
                    }));
                  }
                  setIsPlaying(false); 
                  Object.values(videoRefs.current).forEach(v => v?.pause()); 
                }
                setExpandedVideo(null); 
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Expanded video */}
            {performanceMode === 'high' ? (
              // High performance: Show only the expanded video
              <div className="w-full h-full relative">
                {expandedVideo && (
                  <video
                    key={`expanded-${expandedVideo}`}
                    ref={setVideoRef(expandedVideo)}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={handleVideoLoadedMetadata(expandedVideo)}
                    onTimeUpdate={onTimeUpdateFor(expandedVideo)}
                    onError={handleVideoError(expandedVideo)}
                  >
                    <source src={srcFor(expandedVideo)} type="video/mp4" />
                  </video>
                )}
              </div>
            ) : (
              // Low performance: Separate video element for expanded view
              <video
                ref={(ref) => {
                  if (expandedVideo) {
                    videoRefs.current[`${expandedVideo}_expanded`] = ref;
                  }
                }}
                className="w-full h-full object-contain rounded-lg animate-scale-in"
                poster="/placeholder.svg"
                muted
                preload="metadata"
                playsInline
                onLoadedMetadata={(e) => {
                  const el = (e.currentTarget as HTMLVideoElement | null);
                  if (!el || !expandedVideo) return;
                  if (expandedVideo === MASTER_ID) setDuration(el.duration);
                  // Restore saved time position
                  if (videoTimes[expandedVideo] != null) {
                    try { el.currentTime = videoTimes[expandedVideo]!; } catch {}
                  }
                }}
                onTimeUpdate={onTimeUpdateFor(expandedVideo!)}
              >
                <source src={expandedVideo ? srcFor(expandedVideo) : ''} type="video/mp4" />
              </video>
            )}
            
            <div className="absolute bottom-4 left-4 bg-control-bg/80 px-3 py-1 rounded text-sm text-foreground">
              {videoConfigs.find(v => v.id === expandedVideo)?.title}
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3 max-w-6xl mx-auto mb-6 animate-fade-in">
            {/* Row 1: Front Left, Front Camera, Front Right */}
            <div className="flex justify-center items-start gap-3">
              <VideoCard
                id="NLMVC_front_left"
                title="Front Left"
                src={srcFor('NLMVC_front_left')}
                width="w-32"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('NLMVC_front_left')}
                onLoadedMetadata={handleVideoLoadedMetadata('NLMVC_front_left')}
                onError={handleVideoError('NLMVC_front_left')}
                onLoadStart={() => {
                  if (videoTimes['NLMVC_front_left'] && videoRefs.current['NLMVC_front_left']) {
                    videoRefs.current['NLMVC_front_left']!.currentTime = videoTimes['NLMVC_front_left'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
              <VideoCard
                id="NCBSC_front"
                title="Front Camera"
                src={srcFor('NCBSC_front')}
                width="w-96"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('NCBSC_front')}
                onLoadedMetadata={handleVideoLoadedMetadata('NCBSC_front')}
                onError={handleVideoError('NCBSC_front')}
                onLoadStart={() => {
                  if (videoTimes['NCBSC_front'] && videoRefs.current['NCBSC_front']) {
                    videoRefs.current['NCBSC_front']!.currentTime = videoTimes['NCBSC_front'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
              <VideoCard
                id="NRMVC_front_right"
                title="Front Right"
                src={srcFor('NRMVC_front_right')}
                width="w-32"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('NRMVC_front_right')}
                onLoadedMetadata={handleVideoLoadedMetadata('NRMVC_front_right')}
                onError={handleVideoError('NRMVC_front_right')}
                onLoadStart={() => {
                  if (videoTimes['NRMVC_front_right'] && videoRefs.current['NRMVC_front_right']) {
                    videoRefs.current['NRMVC_front_right']!.currentTime = videoTimes['NRMVC_front_right'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
            </div>

            {/* Row 2: Wide Center (centered) */}
            <div className="flex justify-center">
              <VideoCard
                id="WCWVC_front"
                title="Wide Center"
                src={srcFor('WCWVC_front')}
                width="w-64"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('WCWVC_front')}
                onLoadedMetadata={handleVideoLoadedMetadata('WCWVC_front')}
                onError={handleVideoError('WCWVC_front')}
                onLoadStart={() => {
                  if (videoTimes['WCWVC_front'] && videoRefs.current['WCWVC_front']) {
                    videoRefs.current['WCWVC_front']!.currentTime = videoTimes['WCWVC_front'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
            </div>

            {/* Row 3: Left Side, Wide Front, Right Side */}
            <div className="flex justify-center items-start gap-3">
              <VideoCard
                id="NLBSC_left"
                title="Left Side"
                src={srcFor('NLBSC_left')}
                width="w-32"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('NLBSC_left')}
                onLoadedMetadata={handleVideoLoadedMetadata('NLBSC_left')}
                onError={handleVideoError('NLBSC_left')}
                onLoadStart={() => {
                  if (videoTimes['NLBSC_left'] && videoRefs.current['NLBSC_left']) {
                    videoRefs.current['NLBSC_left']!.currentTime = videoTimes['NLBSC_left'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
              <VideoCard
                id="WCNVC_front"
                title="Wide Front"
                src={srcFor('WCNVC_front')}
                width="w-64"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('WCNVC_front')}
                onLoadedMetadata={handleVideoLoadedMetadata('WCNVC_front')}
                onError={handleVideoError('WCNVC_front')}
                onLoadStart={() => {
                  if (videoTimes['WCNVC_front'] && videoRefs.current['WCNVC_front']) {
                    videoRefs.current['WCNVC_front']!.currentTime = videoTimes['WCNVC_front'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
              <VideoCard
                id="NRBSC_right"
                title="Right Side"
                src={srcFor('NRBSC_right')}
                width="w-32"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('NRBSC_right')}
                onLoadedMetadata={handleVideoLoadedMetadata('NRBSC_right')}
                onError={handleVideoError('NRBSC_right')}
                onLoadStart={() => {
                  if (videoTimes['NRBSC_right'] && videoRefs.current['NRBSC_right']) {
                    videoRefs.current['NRBSC_right']!.currentTime = videoTimes['NRBSC_right'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
            </div>

            {/* Row 4: Back Center (centered) */}
            <div className="flex justify-center">
              <VideoCard
                id="TCMVC_back"
                title="Back Center"
                src={srcFor('TCMVC_back')}
                width="w-64"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('TCMVC_back')}
                onLoadedMetadata={handleVideoLoadedMetadata('TCMVC_back')}
                onError={handleVideoError('TCMVC_back')}
                onLoadStart={() => {
                  if (videoTimes['TCMVC_back'] && videoRefs.current['TCMVC_back']) {
                    videoRefs.current['TCMVC_back']!.currentTime = videoTimes['TCMVC_back'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
            </div>

            {/* Row 5: Back Left, Back Camera, Back Right */}
            <div className="flex justify-center items-start gap-3">
              <VideoCard
                id="NLMVC_back_left"
                title="Back Left"
                src={srcFor('NLMVC_back_left')}
                width="w-32"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('NLMVC_back_left')}
                onLoadedMetadata={handleVideoLoadedMetadata('NLMVC_back_left')}
                onError={handleVideoError('NLMVC_back_left')}
                onLoadStart={() => {
                  if (videoTimes['NLMVC_back_left'] && videoRefs.current['NLMVC_back_left']) {
                    videoRefs.current['NLMVC_back_left']!.currentTime = videoTimes['NLMVC_back_left'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
              <VideoCard
                id="TCBSC_back"
                title="Back Camera"
                src={srcFor('TCBSC_back')}
                width="w-96"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('TCBSC_back')}
                onLoadedMetadata={handleVideoLoadedMetadata('TCBSC_back')}
                onError={handleVideoError('TCBSC_back')}
                onLoadStart={() => {
                  if (videoTimes['TCBSC_back'] && videoRefs.current['TCBSC_back']) {
                    videoRefs.current['TCBSC_back']!.currentTime = videoTimes['TCBSC_back'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
              <VideoCard
                id="NRMVC_back_right"
                title="Back Right"
                src={srcFor('NRMVC_back_right')}
                width="w-32"
                isPlaying={isPlaying}
                onVideoClick={handleVideoClick}
                onTimeUpdate={onTimeUpdateFor('NRMVC_back_right')}
                onLoadedMetadata={handleVideoLoadedMetadata('NRMVC_back_right')}
                onError={handleVideoError('NRMVC_back_right')}
                onLoadStart={() => {
                  if (videoTimes['NRMVC_back_right'] && videoRefs.current['NRMVC_back_right']) {
                    videoRefs.current['NRMVC_back_right']!.currentTime = videoTimes['NRMVC_back_right'];
                  }
                }}
                setVideoRef={setVideoRef}
                videoTimes={videoTimes}
                videoRefs={videoRefs}
              />
            </div>
          </div>
        )}
      </div>

      {/* Transport Controls */}
      <Card className="p-4 bg-control-bg border-control-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSeek(-10)}
              className="h-8 w-8 text-foreground hover:bg-control-hover"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="h-10 w-10 text-foreground hover:bg-control-hover"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSeek(10)}
              className="h-8 w-8 text-foreground hover:bg-control-hover"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 flex items-center gap-4">
            <div className="text-sm text-muted-foreground min-w-[60px]">
              {formatTime(currentTime)}
            </div>
            
            <div 
              className="flex-1 h-2 bg-muted rounded-full cursor-pointer relative"
              onClick={handleProgressBarClick}
            >
              <div 
                className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            
            <div className="text-sm text-muted-foreground min-w-[60px] text-right">
              {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFrameStep(-1)}
              className="h-8 w-8 text-foreground hover:bg-control-hover"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFrameStep(1)}
              className="h-8 w-8 text-foreground hover:bg-control-hover"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OptimizedMultiVideoPlayer;
