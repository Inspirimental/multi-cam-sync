import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import OptimizedMultiVideoPlayer from '@/components/OptimizedMultiVideoPlayer';
import { mockVideoStreams } from '@/data/mockVideoStreams';
import { useCloudFrontData } from '@/hooks/useCloudFrontData';

const VideoReview: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  
  // Find the current stream
  const currentStream = mockVideoStreams.find(stream => stream.id === streamId);

  // Fetch CloudFront stream data
  const { cloudFrontData, loading, error } = useCloudFrontData({ 
    streamId, 
    currentStream 
  });
  
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