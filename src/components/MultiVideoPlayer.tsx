import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoFileImporter from './VideoFileImporter';
import { VideoCard } from './VideoCard';
import { LoadingModal } from './LoadingModal';
import { VideoPlayerProps, VideoFile } from '@/types/VideoTypes';

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

const MultiVideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoFiles = {}, 
  onClose, 
  streamName = "Vehicle Camera Monitor" 
}) => {
  // Merge external video files with default config
  const videoConfigs = defaultVideoConfigs.map(config => ({
    ...config,
    src: videoFiles[config.id] || config.src
  }));

  const MASTER_ID = videoConfigs[0].id;
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [loadedVideos, setLoadedVideos] = useState<{ [key: string]: string }>({});
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

  // Enhanced play/pause with better synchronization
  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      // Pause all videos immediately
      setIsPlaying(false);
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause();
        }
      });
    } else {
      // Play with synchronization
      const activeVideos = expandedVideo ? [expandedVideo] : videoConfigs.map(v => v.id);
      const videoElements = activeVideos
        .map(id => videoRefs.current[id])
        .filter((video): video is HTMLVideoElement => video !== null);

      if (videoElements.length === 0) return;

      // Step 1: Ensure all videos are at the same current time
      const masterVideo = videoRefs.current[MASTER_ID] || videoElements[0];
      const syncTime = masterVideo.currentTime;
      
      videoElements.forEach(video => {
        video.currentTime = syncTime;
      });

      // Step 2: Wait for seek operations to complete and videos to be ready
      await Promise.all(videoElements.map(video => 
        new Promise<void>(resolve => {
          if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better
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

      // Step 3: Start all videos as simultaneously as possible
      const playPromises = videoElements.map(video => {
        return video.play().catch(error => {
          console.warn(`Video ${video.src} failed to play:`, error);
        });
      });

      try {
        await Promise.all(playPromises);
        setIsPlaying(true);
      } catch (error) {
        console.warn('Some videos failed to start:', error);
        // Still set playing state as some videos might have started
        setIsPlaying(true);
      }
    }
  }, [isPlaying, expandedVideo, videoConfigs, MASTER_ID]);

  const handleSeek = useCallback((seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    syncAllVideos(newTime);
  }, [currentTime, duration, syncAllVideos]);

  // New function for progress bar click navigation
  const handleProgressBarClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressWidth = rect.width;
    
    // Calculate the percentage of progress bar clicked
    const percentage = Math.max(0, Math.min(1, clickX / progressWidth));
    const newTime = percentage * duration;
    
    setCurrentTime(newTime);
    syncAllVideos(newTime);
    
    // If playing, briefly pause and resume to ensure sync
    if (isPlaying) {
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause();
        }
      });
      
      // Small delay to ensure seek completes
      setTimeout(() => {
        Object.values(videoRefs.current).forEach(video => {
          if (video) {
            video.play().catch(console.warn);
          }
        });
      }, 50);
    }
  }, [duration, syncAllVideos, isPlaying]);

  const handleFrameStep = useCallback((direction: number) => {
    const frameRate = 30; // Assume 30fps
    const frameTime = 1 / frameRate;
    handleSeek(direction * frameTime);
  }, [handleSeek]);

  const onTimeUpdateFor = useCallback((id: string) => () => {
    const el = videoRefs.current[id];
    if (!el) return;
    const t = el.currentTime || 0;
    if (id === MASTER_ID) setCurrentTime(t);
    setVideoTimes(prev => ({ ...prev, [id]: t }));
  }, []);

  const handleVideoClick = useCallback((videoId: string) => {
    // Store current video time before expanding
    if (!expandedVideo && videoRefs.current[videoId]) {
      setVideoTimes(prev => ({
        ...prev,
        [videoId]: videoRefs.current[videoId]?.currentTime || 0
      }));
    }
    
    const isExpanding = !expandedVideo || expandedVideo !== videoId;
    setExpandedVideo(expandedVideo === videoId ? null : videoId);
    
    // When expanding or closing a video, pause all videos and update the play state
    setIsPlaying(false);
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pause();
      }
    });
  }, [expandedVideo]);

  const handleVideoLoad = useCallback((videoId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setLoadedVideos(prev => ({ ...prev, [videoId]: url }));
  }, []);

  // Helper function to handle video metadata loading with progress tracking
  const handleVideoLoadedMetadata = useCallback((videoId: string) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = (e.currentTarget as HTMLVideoElement | null);
    if (!el) return;
    
    if (videoId === MASTER_ID) setDuration(el.duration);
    
    setLoadedVideoCount(prev => {
      const newCount = prev + 1;
      if (newCount >= videoConfigs.length) {
        setAllVideosLoaded(true);
      }
      return newCount;
    });
  }, [MASTER_ID, videoConfigs.length]);

  // Count errors as finished to avoid blocking the loader forever
  const handleVideoError = useCallback((videoId: string) => (_e: React.SyntheticEvent<HTMLVideoElement>) => {
    setLoadedVideoCount(prev => {
      const newCount = prev + 1;
      if (newCount >= videoConfigs.length) {
        setAllVideosLoaded(true);
      }
      return newCount;
    });
  }, [videoConfigs.length]);

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

    // Add event listeners to the first video as the master
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
    // Reload videos when new local files are selected
    Object.keys(loadedVideos).forEach((id) => {
      const v = videoRefs.current[id];
      if (v) v.load();
    });
    setIsPlaying(false);
  }, [loadedVideos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser behavior for space and arrow keys
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

  const videoLayout = [
    // Row 1: Front Left, Front Camera, Front Right
    { id: 'NLMVC_front_left', title: 'Front Left', size: 'small' },
    { id: 'NCBSC_front', title: 'Front Camera', size: 'large' },
    { id: 'NRMVC_front_right', title: 'Front Right', size: 'small' },
    
    // Row 2: Wide Center (centered)
    { id: 'WCWVC_front', title: 'Wide Center', size: 'medium', span: 'center' },
    
    // Row 3: Left Side, Wide Front, Right Side
    { id: 'NLBSC_left', title: 'Left Side', size: 'small' },
    { id: 'WCNVC_front', title: 'Wide Front', size: 'medium' },
    { id: 'NRBSC_right', title: 'Right Side', size: 'small' },
    
    // Row 4: Back Center (centered)
    { id: 'TCMVC_back', title: 'Back Center', size: 'medium', span: 'center' },
    
    // Row 5: Back Left, Back Camera, Back Right
    { id: 'NLMVC_back_left', title: 'Back Left', size: 'small' },
    { id: 'TCBSC_back', title: 'Back Camera', size: 'large' },
    { id: 'NRMVC_back_right', title: 'Back Right', size: 'small' },
  ];

  return (
    <div className="w-full min-h-screen bg-background p-4 space-y-4">
      <LoadingModal 
        isOpen={!allVideosLoaded}
        loadedVideos={loadedVideoCount}
        totalVideos={videoConfigs.length}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{streamName}</h1>
        <div className="text-sm text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Video File Importer - Only show if no external video files provided */}
      {Object.keys(videoFiles).length === 0 && (
        <VideoFileImporter
          videoConfigs={videoConfigs}
          loadedVideos={loadedVideos}
          onVideoLoad={handleVideoLoad}
        />
      )}

      {/* Video Grid */}
      <div className="relative flex-1">
        {expandedVideo ? (
          <Card className="relative w-full aspect-video bg-video-bg border-video-border animate-fade-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-control-bg/80 hover:bg-control-hover text-foreground"
              onClick={() => { setIsPlaying(false); Object.values(videoRefs.current).forEach(v => v?.pause()); setExpandedVideo(null); }}
            >
              <X className="h-4 w-4" />
            </Button>
            <video
              ref={setVideoRef(expandedVideo)}
              className="w-full h-full object-contain rounded-lg animate-scale-in"
              poster="/placeholder.svg"
              muted
              preload="metadata"
              playsInline
              onLoadedMetadata={(e) => {
                const el = (e.currentTarget as HTMLVideoElement | null);
                if (!el) return;
                if (expandedVideo === MASTER_ID) setDuration(el.duration);
                // Restore saved time position
                if (videoTimes[expandedVideo] != null) {
                  try { el.currentTime = videoTimes[expandedVideo]!; } catch {}
                }
              }}
               onTimeUpdate={onTimeUpdateFor(expandedVideo!)}
            >
              <source src={loadedVideos[expandedVideo] || videoConfigs.find(v => v.id === expandedVideo)?.src} type="video/mp4" />
            </video>
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
                src={loadedVideos['NLMVC_front_left'] || videoConfigs.find(v => v.id === 'NLMVC_front_left')?.src || ''}
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
                src={loadedVideos['NCBSC_front'] || videoConfigs.find(v => v.id === 'NCBSC_front')?.src || ''}
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
                src={loadedVideos['NRMVC_front_right'] || videoConfigs.find(v => v.id === 'NRMVC_front_right')?.src || ''}
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

            {/* Row 2: Left Side, Wide Center, Wide Front, Right Side */}
            <div className="flex justify-center items-center gap-3">
              <VideoCard
                id="NLBSC_left"
                title="Left Side"
                src={loadedVideos['NLBSC_left'] || videoConfigs.find(v => v.id === 'NLBSC_left')?.src || ''}
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
                id="WCWVC_front"
                title="Wide Center"
                src={loadedVideos['WCWVC_front'] || videoConfigs.find(v => v.id === 'WCWVC_front')?.src || ''}
                width="w-48"
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
              <VideoCard
                id="WCNVC_front"
                title="Wide Front"
                src={loadedVideos['WCNVC_front'] || videoConfigs.find(v => v.id === 'WCNVC_front')?.src || ''}
                width="w-48"
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
                src={loadedVideos['NRBSC_right'] || videoConfigs.find(v => v.id === 'NRBSC_right')?.src || ''}
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

            {/* Row 3: Back Center */}
            <div className="flex justify-center">
              <VideoCard
                id="TCMVC_back"
                title="Back Center"
                src={loadedVideos['TCMVC_back'] || videoConfigs.find(v => v.id === 'TCMVC_back')?.src || ''}
                width="w-48"
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

            {/* Row 4: Back Left, Back Camera, Back Right */}
            <div className="flex justify-center items-center gap-3">
              <VideoCard
                id="NLMVC_back_left"
                title="Back Left"
                src={loadedVideos['NLMVC_back_left'] || videoConfigs.find(v => v.id === 'NLMVC_back_left')?.src || ''}
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
                src={loadedVideos['TCBSC_back'] || videoConfigs.find(v => v.id === 'TCBSC_back')?.src || ''}
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
                src={loadedVideos['NRMVC_back_right'] || videoConfigs.find(v => v.id === 'NRMVC_back_right')?.src || ''}
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

      {/* Control Panel */}
      <Card className="bg-control-bg border-border p-4 shadow-control">
        <div className="flex items-center justify-center space-x-4">
          {/* Frame Step Back */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFrameStep(-1)}
            className="hover:bg-control-hover text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* 10s Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSeek(-10)}
            className="hover:bg-control-hover text-foreground"
          >
            <SkipBack className="h-4 w-4 mr-1" />
            10s
          </Button>

          {/* Play/Pause */}
          <Button
            onClick={handlePlayPause}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
            size="lg"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          {/* 10s Forward */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSeek(10)}
            className="hover:bg-control-hover text-foreground"
          >
            10s
            <SkipForward className="h-4 w-4 ml-1" />
          </Button>

          {/* Frame Step Forward */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFrameStep(1)}
            className="hover:bg-control-hover text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Interactive Progress Bar */}
        <div className="mt-4">
          <div 
            className="w-full bg-muted rounded-full h-3 cursor-pointer hover:h-4 transition-all duration-200 relative group"
            onClick={handleProgressBarClick}
          >
            {/* Background track */}
            <div className="absolute inset-0 bg-muted rounded-full" />
            
            {/* Progress fill */}
            <div
              className="bg-primary h-full rounded-full transition-all duration-100 relative"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
            
            {/* Hover indicator */}
            <div className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Time tooltip on hover */}
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Click to jump to position
            </div>
          </div>
          
          {/* Time display */}
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MultiVideoPlayer;