import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import MultiVideoPlayer from './MultiVideoPlayer';
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
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Video Player - {streamName}</DialogTitle>
        </VisuallyHidden>
        <MultiVideoPlayer 
          videoFiles={videoFiles}
          onClose={onClose}
          streamName={streamName}
        />
      </DialogContent>
    </Dialog>
  );
};