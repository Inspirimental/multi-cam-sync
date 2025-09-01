import React from 'react';
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
  if (!isOpen) return null;
  const progress = totalVideos > 0 ? (loadedVideos / totalVideos) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Videos werden geladen</h3>
        </div>
        <div className="mt-4 space-y-2">
          <Progress value={progress} />
          <div className="text-center text-sm text-muted-foreground">
            {loadedVideos} von {totalVideos} Videos geladen
          </div>
        </div>
      </div>
    </div>
  );
};