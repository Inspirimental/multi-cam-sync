import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import OptimizedMultiVideoPlayer from '@/components/OptimizedMultiVideoPlayer';
import { VideoStream } from '@/types/VideoTypes';

// Mock data - in real app this would come from API/props/state management
const mockVideoStreams: VideoStream[] = [
  {
    id: 'stream_1',
    name: '2024-01-15 Vormittag',
    date: '2024-01-15T08:00:00Z',
    status: 'pending',
    videoFiles: {
      'NCBSC_front': 'https://sharing.timbeck.de/hls/NCBSC_front/index.m3u8',
      'TCBSC_back': 'https://sharing.timbeck.de/hls/TCBSC_back/index.m3u8',
      'TCMVC_back': 'https://sharing.timbeck.de/hls/TCMVC_back/index.m3u8',
      'NLBSC_left': 'https://sharing.timbeck.de/hls/NLBSC_left/index.m3u8',
      'NLMVC_back_left': 'https://sharing.timbeck.de/hls/NLMVC_back_left/index.m3u8',
      'NLMVC_front_left': 'https://sharing.timbeck.de/hls/NLMVC_front_left/index.m3u8',
      'NRBSC_right': 'https://sharing.timbeck.de/hls/NRBSC_right/index.m3u8',
      'NRMVC_back_right': 'https://sharing.timbeck.de/hls/NRMVC_back_right/index.m3u8',
      'NRMVC_front_right': 'https://sharing.timbeck.de/hls/NRMVC_front_right/index.m3u8',
      'WCNVC_front': 'https://sharing.timbeck.de/hls/WCNVC_front/index.m3u8',
      'WCWVC_front': 'https://sharing.timbeck.de/hls/WCWVC_front/index.m3u8',
    }
  },
  {
    id: 'stream_2',
    name: '2024-01-15 Nachmittag',
    date: '2024-01-15T14:00:00Z',
    status: 'approved',
    videoFiles: {
      'NCBSC_front': 'https://sharing.timbeck.de/hls/NCBSC_front/index.m3u8',
      'TCBSC_back': 'https://sharing.timbeck.de/hls/TCBSC_back/index.m3u8',
      'TCMVC_back': 'https://sharing.timbeck.de/hls/TCMVC_back/index.m3u8',
      'NLBSC_left': 'https://sharing.timbeck.de/hls/NLBSC_left/index.m3u8',
      'NLMVC_back_left': 'https://sharing.timbeck.de/hls/NLMVC_back_left/index.m3u8',
      'NLMVC_front_left': 'https://sharing.timbeck.de/hls/NLMVC_front_left/index.m3u8',
      'NRBSC_right': 'https://sharing.timbeck.de/hls/NRBSC_right/index.m3u8',
      'NRMVC_back_right': 'https://sharing.timbeck.de/hls/NRMVC_back_right/index.m3u8',
      'NRMVC_front_right': 'https://sharing.timbeck.de/hls/NRMVC_front_right/index.m3u8',
      'WCNVC_front': 'https://sharing.timbeck.de/hls/WCNVC_front/index.m3u8',
      'WCWVC_front': 'https://sharing.timbeck.de/hls/WCWVC_front/index.m3u8',
    }
  },
  {
    id: 'stream_3',
    name: '2024-01-16 Morgen',
    date: '2024-01-16T09:00:00Z',
    status: 'rejected',
    videoFiles: {
      // Beispiel für weniger Streams (nur 7 statt 11)
      'NCBSC_front': 'https://sharing.timbeck.de/hls/NCBSC_front/index.m3u8',
      'TCBSC_back': 'https://sharing.timbeck.de/hls/TCBSC_back/index.m3u8',
      'NLBSC_left': 'https://sharing.timbeck.de/hls/NLBSC_left/index.m3u8',
      'NRBSC_right': 'https://sharing.timbeck.de/hls/NRBSC_right/index.m3u8',
      'WCNVC_front': 'https://sharing.timbeck.de/hls/WCNVC_front/index.m3u8',
      'WCWVC_front': 'https://sharing.timbeck.de/hls/WCWVC_front/index.m3u8',
      'TCMVC_back': 'https://sharing.timbeck.de/hls/TCMVC_back/index.m3u8',
    }
  }
];

const VideoReview: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  
  // Find the current stream
  const currentStream = mockVideoStreams.find(stream => stream.id === streamId);
  
  if (!currentStream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Stream nicht gefunden</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </Card>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{currentStream.name}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(currentStream.date).toLocaleString('de-DE')}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Video Player */}
      <div className="p-4">
        <OptimizedMultiVideoPlayer
          videoFiles={currentStream.videoFiles}
          onClose={handleBack}
          streamName={currentStream.name}
        />
      </div>
    </div>
  );
};

export default VideoReview;