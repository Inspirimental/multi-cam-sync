import React from 'react';
import { CloudFrontApiResponse } from '@/types/VideoTypes';
import { formatTime } from '@/utils/videoUtils';

interface VideoStreamHeaderProps {
  streamName: string;
  cloudFrontData?: CloudFrontApiResponse | null;
  currentTime: number;
  duration: number;
}

export const VideoStreamHeader: React.FC<VideoStreamHeaderProps> = ({
  streamName,
  cloudFrontData,
  currentTime,
  duration
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{streamName}</h1>
        {cloudFrontData && (
          <div className="text-xs text-muted-foreground mt-1">
            Vehicle: {cloudFrontData.vehicle_id} • Streams: {cloudFrontData.total_streams} • 
            Status: {cloudFrontData.processing_status}
            {cloudFrontData.expires_at && (
              <> • Expires: {new Date(cloudFrontData.expires_at * 1000).toLocaleString('de-DE')}</>
            )}
          </div>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};