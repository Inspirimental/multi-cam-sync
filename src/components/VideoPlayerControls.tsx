import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTime } from '@/utils/videoUtils';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onFrameStep: (direction: number) => void;
  onProgressBarClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onFrameStep,
  onProgressBarClick
}) => {
  return (
    <Card className="p-4 bg-control-bg border-control-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSeek(-10)}
            className="h-8 w-8 text-foreground hover:bg-control-hover"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlayPause}
            className="h-10 w-10 text-foreground hover:bg-control-hover"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSeek(10)}
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
            onClick={onProgressBarClick}
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
            onClick={() => onFrameStep(-1)}
            className="h-8 w-8 text-foreground hover:bg-control-hover"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFrameStep(1)}
            className="h-8 w-8 text-foreground hover:bg-control-hover"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};