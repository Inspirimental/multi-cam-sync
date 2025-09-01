import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  loadedVideos: number;
  totalVideos: number;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  loadedVideos,
  totalVideos
}) => {
  const progress = totalVideos > 0 ? (loadedVideos / totalVideos) * 100 : 0;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="flex flex-col items-center gap-6 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <h3 className="text-lg font-semibold">Videos werden geladen</h3>
          </div>
          
          <div className="w-full space-y-3">
            <Progress value={progress} className="w-full" />
            <div className="text-center text-sm text-muted-foreground">
              {loadedVideos} von {totalVideos} Videos geladen
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};