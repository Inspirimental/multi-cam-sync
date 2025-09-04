import { useState, useEffect } from 'react';
import { CloudFrontApiResponse, VideoStream } from '@/types/VideoTypes';
import { createMockCloudFrontResponse } from '@/data/mockVideoStreams';

interface UseCloudFrontDataProps {
  streamId?: string;
  currentStream?: VideoStream;
}

export const useCloudFrontData = ({ streamId, currentStream }: UseCloudFrontDataProps) => {
  const [cloudFrontData, setCloudFrontData] = useState<CloudFrontApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCloudFrontData = async () => {
      if (!currentStream) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In real implementation, this would be your actual API endpoint
        // const response = await fetch(`/api/streams/${streamId}`);
        // const data: CloudFrontApiResponse = await response.json();
        
        // Mock CloudFront API response with corrected URLs
        const mockCloudFrontResponse = createMockCloudFrontResponse(currentStream.name);
        
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

  return { cloudFrontData, loading, error };
};