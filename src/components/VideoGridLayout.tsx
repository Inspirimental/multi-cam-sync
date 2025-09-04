import React from 'react';
import { VideoCard } from './VideoCard';
import { VideoConfig } from '@/types/VideoTypes';

interface VideoGridLayoutProps {
  videoConfigs: VideoConfig[];
  isPlaying: boolean;
  expandedVideo: string | null;
  videoTimes: { [key: string]: number };
  videoRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement | null }>;
  onVideoClick: (id: string) => void;
  onTimeUpdateFor: (id: string) => () => void;
  onVideoLoadedMetadata: (id: string) => (event: React.SyntheticEvent<HTMLVideoElement>) => void;
  onVideoError: (id: string) => (event: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  setVideoRef: (id: string) => (ref: HTMLVideoElement | null) => void;
  srcFor: (id: string) => string;
}

export const VideoGridLayout: React.FC<VideoGridLayoutProps> = ({
  videoConfigs,
  isPlaying,
  expandedVideo,
  videoTimes,
  videoRefs,
  onVideoClick,
  onTimeUpdateFor,
  onVideoLoadedMetadata,
  onVideoError,
  setVideoRef,
  srcFor
}) => {
  return (
    <div className="flex flex-col gap-3 max-w-6xl mx-auto mb-6 animate-fade-in">
      {/* Row 1: Front Left, Front Camera, Front Right */}
      <div className="flex justify-center items-start gap-3">
        <VideoCard
          id="FLMVC_back_left"
          title="Front Left"
          src={srcFor('FLMVC_back_left')}
          width="w-32"
          isPlaying={isPlaying}
          isExpanded={expandedVideo === 'FLMVC_back_left'}
          onVideoClick={onVideoClick}
          onTimeUpdate={onTimeUpdateFor('FLMVC_back_left')}
          onLoadedMetadata={onVideoLoadedMetadata('FLMVC_back_left')}
          onError={onVideoError('FLMVC_back_left')}
          onLoadStart={() => {
            if (videoTimes['FLMVC_back_left'] && videoRefs.current['FLMVC_back_left']) {
              videoRefs.current['FLMVC_back_left']!.currentTime = videoTimes['FLMVC_back_left'];
            }
          }}
          setVideoRef={setVideoRef}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
        />
        <VideoCard
          id="FLNVC_front"
          title="Front Camera"
          src={srcFor('FLNVC_front')}
          width="w-96"
          isPlaying={isPlaying}
          isExpanded={expandedVideo === 'FLNVC_front'}
          onVideoClick={onVideoClick}
          onTimeUpdate={onTimeUpdateFor('FLNVC_front')}
          onLoadedMetadata={onVideoLoadedMetadata('FLNVC_front')}
          onError={onVideoError('FLNVC_front')}
          onLoadStart={() => {
            if (videoTimes['FLNVC_front'] && videoRefs.current['FLNVC_front']) {
              videoRefs.current['FLNVC_front']!.currentTime = videoTimes['FLNVC_front'];
            }
          }}
          setVideoRef={setVideoRef}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
        />
        <VideoCard
          id="FRMVC_back_right"
          title="Front Right"
          src={srcFor('FRMVC_back_right')}
          width="w-32"
          isPlaying={isPlaying}
          isExpanded={expandedVideo === 'FRMVC_back_right'}
          onVideoClick={onVideoClick}
          onTimeUpdate={onTimeUpdateFor('FRMVC_back_right')}
          onLoadedMetadata={onVideoLoadedMetadata('FRMVC_back_right')}
          onError={onVideoError('FRMVC_back_right')}
          onLoadStart={() => {
            if (videoTimes['FRMVC_back_right'] && videoRefs.current['FRMVC_back_right']) {
              videoRefs.current['FRMVC_back_right']!.currentTime = videoTimes['FRMVC_back_right'];
            }
          }}
          setVideoRef={setVideoRef}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
        />
      </div>

      {/* Row 2: Wide Cameras */}
      <div className="flex justify-center items-start gap-3">
        <VideoCard
          id="FLOBC_front"
          title="Wide Center"
          src={srcFor('FLOBC_front')}
          width="w-48"
          isPlaying={isPlaying}
          isExpanded={expandedVideo === 'FLOBC_front'}
          onVideoClick={onVideoClick}
          onTimeUpdate={onTimeUpdateFor('FLOBC_front')}
          onLoadedMetadata={onVideoLoadedMetadata('FLOBC_front')}
          onError={onVideoError('FLOBC_front')}
          onLoadStart={() => {
            if (videoTimes['FLOBC_front'] && videoRefs.current['FLOBC_front']) {
              videoRefs.current['FLOBC_front']!.currentTime = videoTimes['FLOBC_front'];
            }
          }}
          setVideoRef={setVideoRef}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
        />
        <VideoCard
          id="NCMVC_front"
          title="Wide Front"
          src={srcFor('NCMVC_front')}
          width="w-48"
          isPlaying={isPlaying}
          isExpanded={expandedVideo === 'NCMVC_front'}
          onVideoClick={onVideoClick}
          onTimeUpdate={onTimeUpdateFor('NCMVC_front')}
          onLoadedMetadata={onVideoLoadedMetadata('NCMVC_front')}
          onError={onVideoError('NCMVC_front')}
          onLoadStart={() => {
            if (videoTimes['NCMVC_front'] && videoRefs.current['NCMVC_front']) {
              videoRefs.current['NCMVC_front']!.currentTime = videoTimes['NCMVC_front'];
            }
          }}
          setVideoRef={setVideoRef}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
        />
      </div>

      {/* Row 3: Left Side, Back Center, Right Side */}
      <div className="flex justify-center items-start gap-8">
        <VideoCard
          id="FLBSC_down"
          title="Left Side"
          src={srcFor('FLBSC_down')}
          width="w-32"
          isPlaying={isPlaying}
          isExpanded={expandedVideo === 'FLBSC_down'}
          onVideoClick={onVideoClick}
          onTimeUpdate={onTimeUpdateFor('FLBSC_down')}
          onLoadedMetadata={onVideoLoadedMetadata('FLBSC_down')}
          onError={onVideoError('FLBSC_down')}
          onLoadStart={() => {
            if (videoTimes['FLBSC_down'] && videoRefs.current['FLBSC_down']) {
              videoRefs.current['FLBSC_down']!.currentTime = videoTimes['FLBSC_down'];
            }
          }}
          setVideoRef={setVideoRef}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
        />
        <VideoCard
          id="BCMVC_back"
          title="Back Center"
          src={srcFor('BCMVC_back')}
          width="w-64"
          isPlaying={isPlaying}
          isExpanded={expandedVideo === 'BCMVC_back'}
          onVideoClick={onVideoClick}
          onTimeUpdate={onTimeUpdateFor('BCMVC_back')}
          onLoadedMetadata={onVideoLoadedMetadata('BCMVC_back')}
          onError={onVideoError('BCMVC_back')}
          onLoadStart={() => {
            if (videoTimes['BCMVC_back'] && videoRefs.current['BCMVC_back']) {
              videoRefs.current['BCMVC_back']!.currentTime = videoTimes['BCMVC_back'];
            }
          }}
          setVideoRef={setVideoRef}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
        />
        <VideoCard
          id="FRBSC_down"
          title="Right Side"
          src={srcFor('FRBSC_down')}
          width="w-32"
          isPlaying={isPlaying}
          isExpanded={expandedVideo === 'FRBSC_down'}
          onVideoClick={onVideoClick}
          onTimeUpdate={onTimeUpdateFor('FRBSC_down')}
          onLoadedMetadata={onVideoLoadedMetadata('FRBSC_down')}
          onError={onVideoError('FRBSC_down')}
          onLoadStart={() => {
            if (videoTimes['FRBSC_down'] && videoRefs.current['FRBSC_down']) {
              videoRefs.current['FRBSC_down']!.currentTime = videoTimes['FRBSC_down'];
            }
          }}
          setVideoRef={setVideoRef}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
        />
      </div>

      {/* Row 4: Back Camera - Centered */}
      <div className="flex justify-center items-start gap-3">
        <VideoCard
          id="BCBSC_back"
          title="Back Camera"
          src={srcFor('BCBSC_back')}
          width="w-96"
          isPlaying={isPlaying}
          isExpanded={expandedVideo === 'BCBSC_back'}
          onVideoClick={onVideoClick}
          onTimeUpdate={onTimeUpdateFor('BCBSC_back')}
          onLoadedMetadata={onVideoLoadedMetadata('BCBSC_back')}
          onError={onVideoError('BCBSC_back')}
          onLoadStart={() => {
            if (videoTimes['BCBSC_back'] && videoRefs.current['BCBSC_back']) {
              videoRefs.current['BCBSC_back']!.currentTime = videoTimes['BCBSC_back'];
            }
          }}
          setVideoRef={setVideoRef}
          videoTimes={videoTimes}
          videoRefs={videoRefs}
        />
      </div>
    </div>
  );
};