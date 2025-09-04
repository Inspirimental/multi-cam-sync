import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import OptimizedMultiVideoPlayer from '@/components/OptimizedMultiVideoPlayer';
import { VideoStream, CloudFrontApiResponse } from '@/types/VideoTypes';

// Mock data - in real app this would come from API/props/state management
const mockVideoStreams: VideoStream[] = [
  {
    id: 'stream_1',
    name: '2024-01-15 Vormittag',
    date: '2024-01-15T08:00:00Z',
    status: 'pending',
    videoFiles: {
      'NCBSC_front': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_front/index.m3u8',
      'TCBSC_back': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_back/index.m3u8',
      'TCMVC_back': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_back_center/index.m3u8',
      'NLBSC_left': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_left/index.m3u8',
      'NLMVC_back_left': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_back_left/index.m3u8',
      'NLMVC_front_left': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_front_left/index.m3u8',
      'NRBSC_right': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_right/index.m3u8',
      'NRMVC_back_right': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_back_right/index.m3u8',
      'NRMVC_front_right': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_front_right/index.m3u8',
      'WCNVC_front': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_wide_front/index.m3u8',
      'WCWVC_front': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_wide_center/index.m3u8',
    }
  },
  {
    id: 'stream_2',
    name: '2024-01-15 Nachmittag',
    date: '2024-01-15T14:00:00Z',
    status: 'approved',
    videoFiles: {
      'NCBSC_front': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_front/index.m3u8',
      'TCBSC_back': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_back/index.m3u8',
      'TCMVC_back': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_back_center/index.m3u8',
      'NLBSC_left': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_left/index.m3u8',
      'NLMVC_back_left': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_back_left/index.m3u8',
      'NLMVC_front_left': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_front_left/index.m3u8',
      'NRBSC_right': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_right/index.m3u8',
      'NRMVC_back_right': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_back_right/index.m3u8',
      'NRMVC_front_right': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_front_right/index.m3u8',
      'WCNVC_front': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_wide_front/index.m3u8',
      'WCWVC_front': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10025/1752756048000000001_wide_center/index.m3u8',
    }
  },
  {
    id: 'stream_3',
    name: '2024-01-16 Morgen',
    date: '2024-01-16T09:00:00Z',
    status: 'rejected',
    videoFiles: {
      // Beispiel für weniger Streams (nur 7 statt 11)
      'NCBSC_front': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10026/1752756048000000002_front/index.m3u8',
      'TCBSC_back': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10026/1752756048000000002_back/index.m3u8',
      'NLBSC_left': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10026/1752756048000000002_left/index.m3u8',
      'NRBSC_right': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10026/1752756048000000002_right/index.m3u8',
      'WCNVC_front': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10026/1752756048000000002_wide_front/index.m3u8',
      'WCWVC_front': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10026/1752756048000000002_wide_center/index.m3u8',
      'TCMVC_back': 'https://app.weride.iamo.ai/hls/ZRH_LCR_10026/1752756048000000002_back_center/index.m3u8',
    }
  }
];

const VideoReview: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const [cloudFrontData, setCloudFrontData] = useState<CloudFrontApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Find the current stream
  const currentStream = mockVideoStreams.find(stream => stream.id === streamId);

  // Fetch CloudFront stream data
  useEffect(() => {
    const fetchCloudFrontData = async () => {
      if (!currentStream) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In real implementation, this would be your actual API endpoint
        // const response = await fetch(`/api/streams/${streamId}`);
        
        // Mock CloudFront API response for demonstration
        const mockCloudFrontResponse: CloudFrontApiResponse = {
          cohort_id: `INC#${currentStream.name.replace(/\s+/g, '_')}#${Date.now()}000000000`,
          vehicle_id: currentStream.id.toUpperCase(),
          original_session_id: "",
          streams: Object.keys(currentStream.videoFiles).map((key, index) => ({
            camera_position: key,
            unique_session_id: `${Date.now()}000000000_${key}`,
            hls_manifest_url: currentStream.videoFiles[key],
            mp4_url: null,
            thumbnail_url: null,
            duration: null,
            resolution: "Auto"
          })),
          total_streams: Object.keys(currentStream.videoFiles).length,
          processing_status: "completed",
          signed_cookies: {
            // In real implementation, these would be actual CloudFront signed cookies
            // "CloudFront-Policy": "eyJ...",
            // "CloudFront-Signature": "abc...",
            // "CloudFront-Key-Pair-Id": "APKAI..."
          },
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        };
        
        setCloudFrontData(mockCloudFrontResponse);
      } catch (err) {
        console.error('Failed to fetch CloudFront data:', err);
        setError('Failed to load stream data');
      } finally {
        setLoading(false);
      }
    };

    fetchCloudFrontData();
  }, [currentStream, streamId]);
  
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-semibold text-foreground mb-4">Lade Stream-Daten...</h1>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Fehler beim Laden</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
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
          cloudFrontData={cloudFrontData}
          onClose={handleBack}
          streamName={currentStream.name}
        />
      </div>
    </div>
  );
};

export default VideoReview;