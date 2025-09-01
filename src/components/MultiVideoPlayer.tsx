import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoFileImporter from './VideoFileImporter';

interface VideoConfig {
  id: string;
  name: string;
  title: string;
  position: 'front' | 'back' | 'side';
  src: string;
}

const videoConfigs: VideoConfig[] = [
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
const MASTER_ID = videoConfigs[0].id;

const MultiVideoPlayer: React.FC = () => {
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [loadedVideos, setLoadedVideos] = useState<{ [key: string]: string }>({});

  const setVideoRef = useCallback((id: string) => (ref: HTMLVideoElement | null) => {
    videoRefs.current[id] = ref;
  }, []);

  const syncAllVideos = useCallback((targetTime: number) => {
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.currentTime = targetTime;
      }
    });
  }, []);

  const handlePlayPause = useCallback(() => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        if (newPlayState) {
          video.play();
        } else {
          video.pause();
        }
      }
    });
  }, [isPlaying]);

  const handleSeek = useCallback((seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    syncAllVideos(newTime);
  }, [currentTime, duration, syncAllVideos]);

  const handleFrameStep = useCallback((direction: number) => {
    const frameRate = 30; // Assume 30fps
    const frameTime = 1 / frameRate;
    handleSeek(direction * frameTime);
  }, [handleSeek]);

  const handleVideoClick = useCallback((videoId: string) => {
    setExpandedVideo(expandedVideo === videoId ? null : videoId);
  }, [expandedVideo]);

  const handleVideoLoad = useCallback((videoId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setLoadedVideos(prev => ({ ...prev, [videoId]: url }));
  }, []);

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

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVideoGridClass = (config: VideoConfig): string => {
    if (config.position === 'front' || config.position === 'back') {
      return 'col-span-2 row-span-2';
    }
    return 'col-span-1 row-span-1';
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Vehicle Camera Monitor</h1>
        <div className="text-sm text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Video File Importer */}
      <VideoFileImporter
        videoConfigs={videoConfigs}
        loadedVideos={loadedVideos}
        onVideoLoad={handleVideoLoad}
      />

      {/* Video Grid */}
      <div className="relative flex-1">
        {expandedVideo ? (
          <Card className="relative w-full h-full bg-video-bg border-video-border">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-control-bg/80 hover:bg-control-hover text-foreground"
              onClick={() => setExpandedVideo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <video
              ref={setVideoRef(expandedVideo)}
              className="w-full h-full object-contain rounded-lg"
              poster="/placeholder.svg"
              muted
              preload="metadata"
              playsInline
              onLoadedMetadata={(e) => {
                if (expandedVideo === MASTER_ID) setDuration(e.currentTarget.duration);
              }}
              onTimeUpdate={(e) => {
                if (expandedVideo === MASTER_ID) setCurrentTime(e.currentTarget.currentTime);
              }}
            >
              <source src={loadedVideos[expandedVideo] || videoConfigs.find(v => v.id === expandedVideo)?.src} type="video/mp4" />
            </video>
            <div className="absolute bottom-4 left-4 bg-control-bg/80 px-3 py-1 rounded text-sm text-foreground">
              {videoConfigs.find(v => v.id === expandedVideo)?.title}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-6 grid-rows-4 gap-2 h-full">
            {videoConfigs.map((config) => (
              <Card
                key={config.id}
                className={cn(
                  "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group",
                  getVideoGridClass(config),
                  isPlaying && "animate-pulse-border"
                )}
                onClick={() => handleVideoClick(config.id)}
              >
                <video
                  ref={setVideoRef(config.id)}
                  className="w-full h-full object-contain rounded-lg"
                  poster="/placeholder.svg"
                  muted
                  preload="metadata"
                  playsInline
                  onLoadedMetadata={(e) => {
                    if (config.id === MASTER_ID) setDuration(e.currentTarget.duration);
                  }}
                  onTimeUpdate={(e) => {
                    if (config.id === MASTER_ID) setCurrentTime(e.currentTarget.currentTime);
                  }}
                >
                  <source src={loadedVideos[config.id] || config.src} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                  {config.title}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </Card>
            ))}
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

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-100"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MultiVideoPlayer;