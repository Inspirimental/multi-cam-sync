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
  const [videoTimes, setVideoTimes] = useState<{ [key: string]: number }>({});

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
          <Card className="relative w-full aspect-video bg-video-bg border-video-border animate-fade-in">
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
              <div className="w-32">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('NLMVC_front_left')}
                >
                  <video
                    ref={setVideoRef('NLMVC_front_left')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('NLMVC_front_left' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('NLMVC_front_left')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['NLMVC_front_left'] && videoRefs.current['NLMVC_front_left']) {
                         videoRefs.current['NLMVC_front_left']!.currentTime = videoTimes['NLMVC_front_left'];
                       }
                     }}
                  >
                    <source src={loadedVideos['NLMVC_front_left'] || videoConfigs.find(v => v.id === 'NLMVC_front_left')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Front Left
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
              <div className="w-96">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('NCBSC_front')}
                >
                  <video
                    ref={setVideoRef('NCBSC_front')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('NCBSC_front' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('NCBSC_front')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['NCBSC_front'] && videoRefs.current['NCBSC_front']) {
                         videoRefs.current['NCBSC_front']!.currentTime = videoTimes['NCBSC_front'];
                       }
                     }}
                  >
                    <source src={loadedVideos['NCBSC_front'] || videoConfigs.find(v => v.id === 'NCBSC_front')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Front Camera
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
              <div className="w-32">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('NRMVC_front_right')}
                >
                  <video
                    ref={setVideoRef('NRMVC_front_right')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('NRMVC_front_right' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('NRMVC_front_right')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['NRMVC_front_right'] && videoRefs.current['NRMVC_front_right']) {
                         videoRefs.current['NRMVC_front_right']!.currentTime = videoTimes['NRMVC_front_right'];
                       }
                     }}
                  >
                    <source src={loadedVideos['NRMVC_front_right'] || videoConfigs.find(v => v.id === 'NRMVC_front_right')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Front Right
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
            </div>

            {/* Row 2: Left Side, Wide Center, Wide Front, Right Side */}
            <div className="flex justify-center items-center gap-3">
              <div className="w-32">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('NLBSC_left')}
                >
                  <video
                    ref={setVideoRef('NLBSC_left')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('NLBSC_left' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('NLBSC_left')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['NLBSC_left'] && videoRefs.current['NLBSC_left']) {
                         videoRefs.current['NLBSC_left']!.currentTime = videoTimes['NLBSC_left'];
                       }
                     }}
                  >
                    <source src={loadedVideos['NLBSC_left'] || videoConfigs.find(v => v.id === 'NLBSC_left')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Left Side
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
              <div className="w-48">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('WCWVC_front')}
                >
                  <video
                    ref={setVideoRef('WCWVC_front')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('WCWVC_front' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('WCWVC_front')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['WCWVC_front'] && videoRefs.current['WCWVC_front']) {
                         videoRefs.current['WCWVC_front']!.currentTime = videoTimes['WCWVC_front'];
                       }
                     }}
                  >
                    <source src={loadedVideos['WCWVC_front'] || videoConfigs.find(v => v.id === 'WCWVC_front')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Wide Center
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
              <div className="w-48">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('WCNVC_front')}
                >
                  <video
                    ref={setVideoRef('WCNVC_front')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('WCNVC_front' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('WCNVC_front')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['WCNVC_front'] && videoRefs.current['WCNVC_front']) {
                         videoRefs.current['WCNVC_front']!.currentTime = videoTimes['WCNVC_front'];
                       }
                     }}
                  >
                    <source src={loadedVideos['WCNVC_front'] || videoConfigs.find(v => v.id === 'WCNVC_front')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Wide Front
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
              <div className="w-32">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('NRBSC_right')}
                >
                  <video
                    ref={setVideoRef('NRBSC_right')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('NRBSC_right' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('NRBSC_right')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['NRBSC_right'] && videoRefs.current['NRBSC_right']) {
                         videoRefs.current['NRBSC_right']!.currentTime = videoTimes['NRBSC_right'];
                       }
                     }}
                  >
                    <source src={loadedVideos['NRBSC_right'] || videoConfigs.find(v => v.id === 'NRBSC_right')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Right Side
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
            </div>

            {/* Row 3: Back Center */}
            <div className="flex justify-center">
              <div className="w-48">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('TCMVC_back')}
                >
                  <video
                    ref={setVideoRef('TCMVC_back')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('TCMVC_back' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('TCMVC_back')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['TCMVC_back'] && videoRefs.current['TCMVC_back']) {
                         videoRefs.current['TCMVC_back']!.currentTime = videoTimes['TCMVC_back'];
                       }
                     }}
                  >
                    <source src={loadedVideos['TCMVC_back'] || videoConfigs.find(v => v.id === 'TCMVC_back')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Back Center
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
            </div>

            {/* Row 5: Back Left, Back Camera, Back Right */}
            <div className="flex justify-center items-center gap-3">
              <div className="w-32">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('NLMVC_back_left')}
                >
                  <video
                    ref={setVideoRef('NLMVC_back_left')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('NLMVC_back_left' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('NLMVC_back_left')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['NLMVC_back_left'] && videoRefs.current['NLMVC_back_left']) {
                         videoRefs.current['NLMVC_back_left']!.currentTime = videoTimes['NLMVC_back_left'];
                       }
                     }}
                  >
                    <source src={loadedVideos['NLMVC_back_left'] || videoConfigs.find(v => v.id === 'NLMVC_back_left')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Back Left
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
              <div className="w-96">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('TCBSC_back')}
                >
                  <video
                    ref={setVideoRef('TCBSC_back')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('TCBSC_back' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('TCBSC_back')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['TCBSC_back'] && videoRefs.current['TCBSC_back']) {
                         videoRefs.current['TCBSC_back']!.currentTime = videoTimes['TCBSC_back'];
                       }
                     }}
                  >
                    <source src={loadedVideos['TCBSC_back'] || videoConfigs.find(v => v.id === 'TCBSC_back')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Back Camera
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
              <div className="w-32">
                <Card
                  className={cn(
                    "relative bg-video-bg border-video-border hover:border-primary transition-colors cursor-pointer group h-full aspect-video",
                    isPlaying && "animate-pulse-border"
                  )}
                  onClick={() => handleVideoClick('NRMVC_back_right')}
                >
                  <video
                    ref={setVideoRef('NRMVC_back_right')}
                    className="w-full h-full object-contain rounded-lg"
                    poster="/placeholder.svg"
                    muted
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const el = (e.currentTarget as HTMLVideoElement | null);
                      if (!el) return;
                      if ('NRMVC_back_right' === MASTER_ID) setDuration(el.duration);
                    }}
                     onTimeUpdate={onTimeUpdateFor('NRMVC_back_right')}
                     onLoadStart={() => {
                       // Restore saved time when video loads
                       if (videoTimes['NRMVC_back_right'] && videoRefs.current['NRMVC_back_right']) {
                         videoRefs.current['NRMVC_back_right']!.currentTime = videoTimes['NRMVC_back_right'];
                       }
                     }}
                  >
                    <source src={loadedVideos['NRMVC_back_right'] || videoConfigs.find(v => v.id === 'NRMVC_back_right')?.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-control-bg/80 px-2 py-1 rounded text-xs text-foreground">
                    Back Right
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-control-bg/80 hover:bg-control-hover"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
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