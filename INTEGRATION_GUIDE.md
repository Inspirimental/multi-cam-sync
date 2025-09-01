# Video Player Integration Guide

## Overview
This video player system has been refactored to be easily integrated into existing AWS applications. The player supports 11 synchronized video streams and can be embedded as a modal dialog.

## Key Components

### 1. VideoPlayerModal
Modal wrapper for the video player
```tsx
import { VideoPlayerModal } from './components/VideoPlayerModal';

<VideoPlayerModal
  isOpen={showPlayer}
  onClose={() => setShowPlayer(false)}
  videoFiles={videoFilesForThisStream}
  streamName="2024-01-15 Vormittag"
/>
```

### 2. MultiVideoPlayer
Core player component (can be used standalone or in modal)
```tsx
import MultiVideoPlayer from './components/MultiVideoPlayer';

<MultiVideoPlayer 
  videoFiles={videoFiles}
  onClose={handleClose}
  streamName="Custom Stream Name"
/>
```

## Data Structure

### VideoStream Interface
```typescript
interface VideoStream {
  id: string;
  name: string;                    // Display name like "2024-01-15 Vormittag"
  date: string;                    // ISO date string
  status: 'pending' | 'approved' | 'rejected';
  videoFiles: { [videoId: string]: string }; // Video ID to URL/path mapping
}
```

### Video Files Mapping
The player expects video files mapped by these IDs:
```typescript
const videoFiles = {
  'NCBSC_front': 'https://your-s3-bucket/stream1/front.mp4',
  'TCBSC_back': 'https://your-s3-bucket/stream1/back.mp4',
  'TCMVC_back': 'https://your-s3-bucket/stream1/back_center.mp4',
  'NLBSC_left': 'https://your-s3-bucket/stream1/left.mp4',
  'NLMVC_back_left': 'https://your-s3-bucket/stream1/back_left.mp4',
  'NLMVC_front_left': 'https://your-s3-bucket/stream1/front_left.mp4',
  'NRBSC_right': 'https://your-s3-bucket/stream1/right.mp4',
  'NRMVC_back_right': 'https://your-s3-bucket/stream1/back_right.mp4',
  'NRMVC_front_right': 'https://your-s3-bucket/stream1/front_right.mp4',
  'WCNVC_front': 'https://your-s3-bucket/stream1/wide_front.mp4',
  'WCWVC_front': 'https://your-s3-bucket/stream1/wide_center.mp4',
};
```

### Working Test Example
The current implementation uses working test videos from `https://sharing.timbeck.de/` for immediate testing:
```typescript
const testVideoFiles = {
  'NCBSC_front': 'https://sharing.timbeck.de/NCBSC_front.mp4',
  'TCBSC_back': 'https://sharing.timbeck.de/TCBSC_back.mp4',
  'TCMVC_back': 'https://sharing.timbeck.de/TCMVC_back.mp4',
  'NLBSC_left': 'https://sharing.timbeck.de/NLBSC_left.mp4',
  'NLMVC_back_left': 'https://sharing.timbeck.de/NLMVC_back_left.mp4',
  'NLMVC_front_left': 'https://sharing.timbeck.de/NLMVC_front_left.mp4',
  'NRBSC_right': 'https://sharing.timbeck.de/NRBSC_right.mp4',
  'NRMVC_back_right': 'https://sharing.timbeck.de/NRMVC_back_right.mp4',
  'NRMVC_front_right': 'https://sharing.timbeck.de/NRMVC_front_right.mp4',
  'WCNVC_front': 'https://sharing.timbeck.de/WCNVC_front.mp4',
  'WCWVC_front': 'https://sharing.timbeck.de/WCWVC_front.mp4',
};
```

### Important HTTPS & CORS Requirements
- **HTTPS Required**: Video URLs MUST use HTTPS protocol (not HTTP) to work in production environments
- **CORS Configuration**: Your video server must allow cross-origin requests from your app's domain
- **Range Requests**: Enable HTTP Range headers for video seeking functionality
- **Content-Type**: Ensure proper video MIME types (video/mp4) are set

## Integration Steps

### 1. Replace Mock Data
In your existing list component, replace the VideoStreamExample with your real API data:

```tsx
// Your existing list component
const YourStreamList = () => {
  const [streams, setStreams] = useState<VideoStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<VideoStream | null>(null);
  
  // Fetch your streams from API
  useEffect(() => {
    fetchStreamsFromAPI().then(setStreams);
  }, []);

  return (
    <div>
      {streams.map(stream => (
        <div key={stream.id}>
          <Button onClick={() => setSelectedStream(stream)}>
            <Play /> Review {stream.name}
          </Button>
        </div>
      ))}
      
      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!selectedStream}
        onClose={() => setSelectedStream(null)}
        videoFiles={selectedStream?.videoFiles || {}}
        streamName={selectedStream?.name}
      />
    </div>
  );
};
```

### 2. AWS S3 Integration
Ensure your video URLs are accessible from the browser:
- **HTTPS Required**: Configure SSL/TLS for your video URLs (HTTPS protocol mandatory)
- **CORS Configuration**: Configure CORS on your S3 bucket to allow requests from your app domain
- **Range Requests**: Enable HTTP Range headers for video seeking functionality  
- **CloudFront Setup**: Use CloudFront for better performance and global distribution
- **Cache Headers**: Set appropriate cache headers for video files
- **Content-Type**: Ensure video files serve with correct MIME type (video/mp4)

Example CORS configuration for S3:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["https://your-app-domain.com"],
      "ExposeHeaders": ["Content-Range", "Content-Length"]
    }
  ]
}
```

### 3. Video File Organization
Organize your S3 structure like:
```
your-bucket/
  stream-2024-01-15-morning/
    NCBSC_front.mp4
    TCBSC_back.mp4
    ...
  stream-2024-01-15-afternoon/
    NCBSC_front.mp4
    TCBSC_back.mp4
    ...
```

## Features

### Keyboard Controls
- **Spacebar**: Play/Pause
- **Left Arrow**: Previous frame
- **Right Arrow**: Next frame

### Video Controls
- Synchronized playback across all 11 videos
- Individual video expansion to fullscreen
- Frame-by-frame navigation
- Time scrubbing

### Approval Workflow
The example includes approve/reject buttons. Customize these to your needs:
```tsx
const handleApprove = async (streamId: string) => {
  await updateStreamStatus(streamId, 'approved');
  setStreams(prev => prev.map(stream => 
    stream.id === streamId ? { ...stream, status: 'approved' } : stream
  ));
};
```

## Troubleshooting

### Common Issues

#### Videos Not Loading
- **Mixed Content Error**: Ensure all video URLs use HTTPS protocol
- **CORS Error**: Configure CORS headers on your video server/CDN
- **Network Issues**: Check video URLs are accessible from browser
- **Large Files**: Consider video compression and progressive loading

#### Performance Issues  
- **Too Many Simultaneous Videos**: Modern browsers handle 8-12 streams well
- **Mobile Limitations**: Consider reduced video count or quality on mobile
- **Bandwidth**: Implement adaptive bitrate streaming for varying connections

#### Browser Compatibility
- **Safari**: May require specific video codecs (H.264)
- **Firefox**: Check autoplay policies and user interaction requirements
- **Chrome**: Verify HTTPS requirements and security policies

### Debug Steps
1. Check browser console for network/CORS errors
2. Test individual video URLs in browser 
3. Verify HTTPS protocol for all video sources
4. Check network tab for failed video requests
5. Test with smaller video files first

## Deployment to AWS

### Required Files to Transfer
Copy these files to your AWS project:
- `src/components/MultiVideoPlayer.tsx`
- `src/components/VideoPlayerModal.tsx`
- `src/components/VideoFileImporter.tsx` (if needed)
- `src/types/VideoTypes.ts`
- All `src/components/ui/*` components (shadcn/ui components)

### Environment Setup
The player uses:
- React 18+
- TypeScript
- Tailwind CSS
- Radix UI components (for modals, buttons, etc.)

Ensure these dependencies are installed in your AWS environment.

## Example API Integration

```tsx
// Example API service
export const videoStreamService = {
  async getStreams(): Promise<VideoStream[]> {
    const response = await fetch('/api/streams');
    return response.json();
  },
  
  async updateStreamStatus(streamId: string, status: 'approved' | 'rejected') {
    await fetch(`/api/streams/${streamId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

## Testing
The current implementation includes a working example with mock data. Test your integration by:
1. Replacing mock data with real API calls
2. Verifying video URLs are accessible
3. Testing approval/rejection workflow
4. Performance testing with actual video sizes