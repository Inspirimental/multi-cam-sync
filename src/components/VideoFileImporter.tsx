import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Check } from 'lucide-react';
import { VideoConfig } from '@/types/VideoTypes';

interface VideoFileImporterProps {
  videoConfigs: VideoConfig[];
  loadedVideos: { [key: string]: string };
  onVideoLoad: (videoId: string, file: File) => void;
}

const VideoFileImporter: React.FC<VideoFileImporterProps> = ({
  videoConfigs,
  loadedVideos,
  onVideoLoad
}) => {
  const handleFileChange = (videoId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoLoad(videoId, file);
    }
  };

  return (
    <Card className="p-6 mb-4 bg-card border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Videos laden</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoConfigs.map((config) => (
          <div key={config.id} className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {config.title}
            </Label>
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(config.id, e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id={`file-${config.id}`}
              />
              <Button
                variant={loadedVideos[config.id] ? "default" : "outline"}
                className="w-full h-10 text-sm"
                asChild
              >
                <label htmlFor={`file-${config.id}`} className="cursor-pointer flex items-center justify-center gap-2">
                  {loadedVideos[config.id] ? (
                    <>
                      <Check className="h-4 w-4" />
                      Video geladen
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {config.name} wählen
                    </>
                  )}
                </label>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default VideoFileImporter;