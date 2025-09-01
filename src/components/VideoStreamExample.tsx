import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { VideoPlayerModal } from './VideoPlayerModal';
import { VideoStream } from '@/types/VideoTypes';

// Example data with working test videos - AWS colleague can replace this with real API data
const mockVideoStreams: VideoStream[] = [
  {
    id: 'stream_1',
    name: '2024-01-15 Vormittag',
    date: '2024-01-15T08:00:00Z',
    status: 'pending',
    videoFiles: {
      'NCBSC_front': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'TCBSC_back': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'TCMVC_back': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'NLBSC_left': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'NLMVC_back_left': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'NLMVC_front_left': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'NRBSC_right': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'NRMVC_back_right': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'NRMVC_front_right': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'WCNVC_front': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'WCWVC_front': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    }
  },
  {
    id: 'stream_2',
    name: '2024-01-15 Nachmittag',
    date: '2024-01-15T14:00:00Z',
    status: 'approved',
    videoFiles: {
      'NCBSC_front': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'TCBSC_back': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'TCMVC_back': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'NLBSC_left': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'NLMVC_back_left': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'NLMVC_front_left': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'NRBSC_right': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'NRMVC_back_right': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'NRMVC_front_right': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'WCNVC_front': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'WCWVC_front': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    }
  },
  {
    id: 'stream_3',
    name: '2024-01-16 Morgen',
    date: '2024-01-16T09:00:00Z',
    status: 'rejected',
    videoFiles: {
      'NCBSC_front': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'TCBSC_back': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'TCMVC_back': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'NLBSC_left': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'NLMVC_back_left': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'NLMVC_front_left': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'NRBSC_right': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'NRMVC_back_right': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'NRMVC_front_right': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'WCNVC_front': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'WCWVC_front': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    }
  }
];

export const VideoStreamExample: React.FC = () => {
  const [selectedStream, setSelectedStream] = useState<VideoStream | null>(null);
  const [streams, setStreams] = useState<VideoStream[]>(mockVideoStreams);

  const getStatusIcon = (status: VideoStream['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const handleApprove = (streamId: string) => {
    setStreams(prev => prev.map(stream => 
      stream.id === streamId ? { ...stream, status: 'approved' as const } : stream
    ));
    setSelectedStream(null);
  };

  const handleReject = (streamId: string) => {
    setStreams(prev => prev.map(stream => 
      stream.id === streamId ? { ...stream, status: 'rejected' as const } : stream
    ));
    setSelectedStream(null);
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
                  onClick={() => setSelectedStream(stream)}
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

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!selectedStream}
        onClose={() => setSelectedStream(null)}
        videoFiles={selectedStream?.videoFiles || {}}
        streamName={selectedStream?.name}
      />
      
      {/* Approval Panel - Shows when video is playing */}
      {selectedStream && (
        <Card className="fixed bottom-4 right-4 p-4 shadow-lg border-primary bg-background/95 backdrop-blur">
          <div className="flex space-x-2">
            <Button
              onClick={() => handleApprove(selectedStream.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Freigeben
            </Button>
            <Button
              onClick={() => handleReject(selectedStream.id)}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Ablehnen
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
