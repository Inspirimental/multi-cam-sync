import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { VideoStream } from '@/types/VideoTypes';

// Example data with HTTPS test videos - AWS colleague can replace this with real API data
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

export const VideoStreamExample: React.FC = () => {
  const navigate = useNavigate();
  const [streams, setStreams] = useState<VideoStream[]>(mockVideoStreams);

  const getStatusIcon = (status: VideoStream['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const handleReviewClick = (streamId: string) => {
    navigate(`/video-review/${streamId}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Video Stream Management</h1>
      
      <div className="grid gap-4">
        {streams.map((stream) => (
          <Card key={stream.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(stream.status)}
                <div>
                  <h3 className="font-semibold text-foreground">{stream.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(stream.date).toLocaleString('de-DE')}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleReviewClick(stream.id)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Review
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
};
