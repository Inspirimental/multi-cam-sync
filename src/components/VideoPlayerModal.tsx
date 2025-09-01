import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import OptimizedMultiVideoPlayer from './OptimizedMultiVideoPlayer';
import { VideoPlayerProps } from '@/types/VideoTypes';

interface VideoPlayerModalProps extends VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ 
  isOpen, 
  onClose, 
  videoFiles, 
  streamName 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-4 max-w-none max-h-none w-auto h-auto p-0 overflow-hidden" aria-describedby="video-player-description">
        <VisuallyHidden>
          <DialogTitle>Video Player - {streamName}</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <p id="video-player-description">Synchronized multi-camera video review modal with playback controls.</p>
        </VisuallyHidden>
        <OptimizedMultiVideoPlayer 
          videoFiles={videoFiles}
          onClose={onClose}
          streamName={streamName}
        />
      </DialogContent>
    </Dialog>
  );
};