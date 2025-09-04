export interface VideoFile {
  id: string;
  name: string;
  title: string;
  position: 'front' | 'back' | 'side';
  src?: string; // Optional - can be provided externally
}

export interface VideoConfig extends VideoFile {
  // VideoConfig is now just an alias for VideoFile for backward compatibility
}

// CloudFront API Types
export interface CloudFrontStream {
  camera_position: string;
  unique_session_id: string;
  hls_manifest_url: string;
  mp4_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  resolution: string;
}

export interface CloudFrontApiResponse {
  cohort_id: string;
  vehicle_id: string;
  original_session_id: string;
  streams: CloudFrontStream[];
  total_streams: number;
  processing_status: string;
  signed_cookies: { [key: string]: string };
  expires_at: number;
}

export interface VideoStream {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  videoFiles: { [videoId: string]: string }; // Map of video ID to file path/URL
  // Optional CloudFront data
  cloudFrontData?: CloudFrontApiResponse;
}

export interface VideoPlayerProps {
  videoFiles?: { [videoId: string]: string }; // Video ID to source mapping - optional
  cloudFrontData?: CloudFrontApiResponse; // CloudFront API data - optional
  onClose?: () => void;
  streamName?: string;
}