# Video Player Integration Guide

## Overview
This video player system has been refactored to be easily integrated into existing AWS applications. The player supports 11 synchronized video streams and can be embedded as a modal dialog.

## Key Components

### 1. VideoPlayerModal
Modal wrapper for the video player with enhanced accessibility
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
Core player component with synchronized playback and interactive controls
```tsx
import MultiVideoPlayer from './components/MultiVideoPlayer';

<MultiVideoPlayer 
  videoFiles={videoFiles}
  onClose={handleClose}
  streamName="Custom Stream Name"
/>
```

## Features

### Video Synchronization
- **Perfect Sync Start**: All 11 videos start simultaneously using Promise.all()
- **Real-time Synchronization**: Videos stay in perfect sync during playback
- **Async Loading**: Waits for all videos to be ready before starting playback
- **Smart Resume**: Maintains sync when pausing/resuming

### Interactive Controls
- **Play/Pause**: Space bar or button with synchronized control
- **Frame Navigation**: Left/Right arrows for frame-by-frame stepping  
- **10-Second Seek**: Quick forward/backward buttons
- **Interactive Progress Bar**: Click anywhere on the progress bar to jump to that position
- **Individual Video Expansion**: Click any video to view it fullscreen
- **Keyboard Shortcuts**: Space, Arrow keys for quick control

### Progress Bar Features
- **Click Navigation**: Click anywhere on the bar to jump to that time
- **Hover Effects**: Visual feedback and tooltips
- **Time Display**: Shows current time and total duration
- **Smooth Animation**: Fluid progress updates with visual transitions

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
- **Spacebar**: Play/Pause (synchronized across all videos)
- **Left Arrow**: Previous frame (frame-by-frame navigation)
- **Right Arrow**: Next frame (frame-by-frame navigation)

### Interactive Controls
- **Synchronized Playback**: All 11 videos play in perfect synchronization
- **Individual Video Expansion**: Click any video to view it fullscreen
- **Frame-by-Frame Navigation**: Precise control for detailed analysis
- **10-Second Seeking**: Quick forward/backward buttons
- **Interactive Progress Bar**: Click anywhere to jump to specific times
- **Time Scrubbing**: Drag or click the progress bar for instant navigation

### Advanced Features
- **Async Video Loading**: Waits for all videos to be ready before starting
- **Smart Synchronization**: Automatically corrects time drift between videos  
- **Error Handling**: Graceful handling of failed video loads
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Performance Optimized**: Efficient handling of multiple simultaneous video streams

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

#### Core Components
- `src/components/MultiVideoPlayer.tsx` - Main player component with sync controls
- `src/components/VideoPlayerModal.tsx` - Modal wrapper component  
- `src/components/VideoStreamExample.tsx` - Integration example with working test data
- `src/types/VideoTypes.ts` - TypeScript interfaces for video data structures

#### UI Components (shadcn/ui - copy all files)
- `src/components/ui/dialog.tsx` - Modal dialog component
- `src/components/ui/button.tsx` - Button component with variants
- `src/components/ui/card.tsx` - Card layout component
- `src/lib/utils.ts` - Utility functions for styling

#### Optional (if using file import feature)
- `src/components/VideoFileImporter.tsx` - Local video file upload functionality

### Environment Setup
The player requires these dependencies:
- **React 18+** with TypeScript support
- **Tailwind CSS 3.0+** for styling
- **Radix UI components** for modals, buttons, and UI elements
- **Lucide React** for icons
- **Class Variance Authority** (cva) for component variants

Install required packages:
```bash
npm install @radix-ui/react-dialog @radix-ui/react-slot
npm install lucide-react class-variance-authority clsx tailwind-merge
```

Ensure these are configured in your AWS environment and build process.

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
The current implementation includes a fully working example with real test videos from `https://sharing.timbeck.de/`. 

### Test Your Integration
1. **Replace Mock Data**: Replace `VideoStreamExample` with your real API calls
2. **Verify Video URLs**: Ensure all video URLs are accessible via HTTPS
3. **Test Synchronization**: Verify all 11 videos start and play in perfect sync
4. **Test Controls**: Verify play/pause, seeking, and progress bar clicking work
5. **Test Approval Workflow**: Check approve/reject functionality 
6. **Performance Testing**: Test with actual video file sizes and quantities

### Interactive Features Testing
- Click the **progress bar** at different positions to test seek functionality
- Use **keyboard shortcuts** (Space, Arrow keys) for quick navigation
- Test **individual video expansion** by clicking on videos
- Verify **10-second seeking** buttons work correctly
- Check **frame-by-frame** navigation precision

### Performance Benchmarks  
- **Recommended**: 11 videos × 100-500MB each (MP4, H.264)
- **Network**: Minimum 25 Mbps for smooth 11-video playback
- **Browser**: Modern browsers handle 8-12 simultaneous streams optimally