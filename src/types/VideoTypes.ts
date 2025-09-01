export interface VideoFile {
  id: string;
  name: string;
  title: string;
  position: 'front' | 'back' | 'side';
  src?: string; // Optional - can be provided externally
}

export interface VideoStream {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  videoFiles: { [videoId: string]: string }; // Map of video ID to file path/URL
}

export interface VideoPlayerProps {
  videoFiles?: { [videoId: string]: string }; // Video ID to source mapping - optional
  onClose?: () => void;
  streamName?: string;
}