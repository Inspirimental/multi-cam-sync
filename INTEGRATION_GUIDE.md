# Video Review System - Integration Guide

## Overview
This video review system provides a complete solution for reviewing and approving multi-video streams. The system features a **page-based architecture** with a dedicated review page, optimized 11-video grid layout, and advanced video controls for frame-accurate analysis.

## Architecture Changes (v2.0)

### 🔄 New Page-Based Architecture  
The system has moved from modal-based to **separate page navigation**:
- **Main Overview Page** (`/`) - Lists all video streams with preview cards
- **Dedicated Review Page** (`/video-review/:streamId`) - Full video analysis interface
- **Individual Video Modals** - Expandable fullscreen view with complete controls

### Key Benefits
- **Better Performance**: Dedicated page resources for video processing
- **Improved UX**: Sticky navigation, more screen space, browser history support
- **Enhanced Controls**: Frame-by-frame navigation, time jumping, progress seeking

## Core Components (Updated)

### 1. Video Review Page (NEW)
Main component for video stream analysis with sticky header and navigation
```tsx
// Route: /video-review/:streamId
import VideoReview from './pages/VideoReview';

// Automatic routing via React Router
// Provides: Navigation, Approve/Reject buttons, Full video interface
```

### 2. OptimizedMultiVideoPlayer (Enhanced)
Core 11-video grid player with intelligent layout arrangement
```tsx
import OptimizedMultiVideoPlayer from './components/OptimizedMultiVideoPlayer';

<OptimizedMultiVideoPlayer 
  videoFiles={videoFiles}
  onClose={handleClose}
  streamName="Stream Name"
/>
```

## Standalone Player Usage (Direct Integration)

### Using the Player Without Review System
The `OptimizedMultiVideoPlayer` can be used independently without the page-based review system. This is perfect for direct video playback scenarios.

#### Simple Direct Integration
```tsx
import React, { useState } from 'react';
import OptimizedMultiVideoPlayer from './components/OptimizedMultiVideoPlayer';

const SimpleVideoViewer = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Your video URLs - replace with your actual links
  const myVideoFiles = {
    'NCBSC_front': 'https://your-domain.com/videos/front-camera.mp4',
    'TCBSC_back': 'https://your-domain.com/videos/back-camera.mp4',
    'TCMVC_back': 'https://your-domain.com/videos/back-center.mp4',
    'NLBSC_left': 'https://your-domain.com/videos/left-side.mp4',
    'NLMVC_back_left': 'https://your-domain.com/videos/back-left.mp4',
    'NLMVC_front_left': 'https://your-domain.com/videos/front-left.mp4',
    'NRBSC_right': 'https://your-domain.com/videos/right-side.mp4',
    'NRMVC_back_right': 'https://your-domain.com/videos/back-right.mp4',
    'NRMVC_front_right': 'https://your-domain.com/videos/front-right.mp4',
    'WCNVC_front': 'https://your-domain.com/videos/wide-front.mp4',
    'WCWVC_front': 'https://your-domain.com/videos/wide-center.mp4',
  };

  return (
    <div>
      <button onClick={() => setShowPlayer(true)}>
        Play Videos
      </button>
      
      {showPlayer && (
        <OptimizedMultiVideoPlayer
          videoFiles={myVideoFiles}
          onClose={() => setShowPlayer(false)}
          streamName="My Custom Stream"
        />
      )}
    </div>
  );
};
```

#### Flexible Video Mapping
You can use any video URLs and even skip videos by omitting them:
```tsx
// Minimal example with only 4 videos
const partialVideoFiles = {
  'NCBSC_front': 'https://cdn.example.com/front.mp4',
  'TCBSC_back': 'https://cdn.example.com/back.mp4',
  'NLBSC_left': 'https://s3.amazonaws.com/bucket/left.mp4',
  'NRBSC_right': 'https://s3.amazonaws.com/bucket/right.mp4',
  // Missing videos will show placeholder slots
};
```

#### Integration Requirements (Minimal)
For standalone usage, you only need:
1. **React Components**: `OptimizedMultiVideoPlayer.tsx`, `VideoCard.tsx`
2. **UI Dependencies**: Radix UI Dialog, Button components
3. **Icons**: Lucide React
4. **Video URLs**: HTTPS URLs accessible from browser

No React Router or page structure required for standalone usage.

### 3. VideoCard with Modal Controls (Enhanced)  
Individual video components with expandable fullscreen modals
```tsx
import { VideoCard } from './components/VideoCard';

// Features: Click to expand, full video controls in modal
// Controls: Play/Pause, Frame navigation, Time jumping, Progress seeking
```

### 4. Navigation Integration
```tsx
import VideoStreamExample from './components/VideoStreamExample';

// Provides: Stream list, navigation to review pages
// Usage: Replace with your actual API data
```

## Enhanced Features

### 🎮 Advanced Video Controls (Modal)
When a video is expanded to fullscreen modal:
- **Play/Pause Control**: Space bar or button
- **Frame Navigation**: Left/Right arrows (1/30 second precision)  
- **10-Second Jumping**: Fast forward/backward buttons
- **Interactive Progress Bar**: Click anywhere to jump to time
- **Time Display**: Current time / Total duration
- **Close Button**: Return to grid view

### 🎯 Optimized Video Layout
**Intelligent 4-Row Grid System**:
```
Row 1: [Wide Center] [Wide Front]     # Side-by-side, reduced size
Row 2: [Front] [Back]                 # Centered, standard size  
Row 3: [Left] [Back Center] [Right]   # Evenly distributed
Row 4: [Back Left] [Back Cam] [Back Right] # Bottom row
```

### 🚀 High Performance Architecture  
- **Perfect Sync Start**: All videos synchronized using Promise.all()
- **Continuous Playback**: All 11 videos run simultaneously for seamless experience
- **Smart Resource Management**: Optimized for modern hardware
- **Error Recovery**: Graceful handling of failed video loads

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

## Integration Steps (Updated for v2.0)

### 1. Setup React Router (Required)
The new page-based architecture requires React Router setup:

```tsx
// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import VideoReview from './pages/VideoReview';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/video-review/:streamId" element={<VideoReview />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
```

### 2. Replace Mock Data with Real API
Replace VideoStreamExample with your actual API integration:

```tsx
// Your main streams list page
import { useNavigate } from 'react-router-dom';

const YourStreamsList = () => {
  const [streams, setStreams] = useState<VideoStream[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch your real streams from API
    fetchStreamsFromAPI().then(setStreams);
  }, []);

  const handleReviewStream = (streamId: string) => {
    // Navigate to dedicated review page
    navigate(`/video-review/${streamId}`);
  };

  return (
    <div className="grid gap-4">
      {streams.map(stream => (
        <Card key={stream.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3>{stream.name}</h3>
              <p className="text-sm text-muted-foreground">{stream.date}</p>
            </div>
            <Button onClick={() => handleReviewStream(stream.id)}>
              <Play className="mr-2 h-4 w-4" />
              Review Videos
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
```

### 3. Update Video Review Page Integration
Customize the VideoReview page for your workflow:

```tsx
// pages/VideoReview.tsx - Customize approval workflow
const handleApprove = async () => {
  try {
    await videoStreamService.updateStreamStatus(streamId!, 'approved');
    toast.success('Stream approved successfully');
    navigate('/'); // Return to main list
  } catch (error) {
    toast.error('Failed to approve stream');
  }
};

const handleReject = async () => {
  try {
    await videoStreamService.updateStreamStatus(streamId!, 'rejected');
    toast.success('Stream rejected');
    navigate('/');
  } catch (error) {
    toast.error('Failed to reject stream');
  }
};
```

### 4. AWS S3 Integration
Ensure your video URLs are accessible from the browser:
- **HTTPS Required**: Video URLs MUST use HTTPS protocol (not HTTP) to work in production environments
- **CORS Configuration**: Configure CORS on your S3 bucket to allow requests from your app domain
- **Range Requests**: Enable HTTP Range headers for video seeking functionality  
- **CloudFront Setup**: Use CloudFront for better performance and global distribution
- **Cache Headers**: Set appropriate cache headers for video files
- **Content-Type**: Ensure proper video MIME types (video/mp4) are set

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

### 5. Video File Organization
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

## Deployment to AWS (Updated v2.0)

### Required Files to Transfer
Copy these files to your AWS project:

#### Page Components (NEW Architecture)
- `src/pages/Index.tsx` - Main streams overview page
- `src/pages/VideoReview.tsx` - **NEW**: Dedicated video review page with sticky navigation
- `src/pages/NotFound.tsx` - 404 error page for routing
- `src/App.tsx` - **UPDATED**: Router configuration for new page structure

#### Core Components (Updated)
- `src/components/OptimizedMultiVideoPlayer.tsx` - **ENHANCED**: 11-video grid with optimized layout
- `src/components/VideoCard.tsx` - **ENHANCED**: Individual video cards with modal controls
- `src/components/VideoStreamExample.tsx` - Navigation integration example
- `src/types/VideoTypes.ts` - TypeScript interfaces for video data structures
- `src/utils/performanceDetection.ts` - Performance detection utilities

#### UI Components (shadcn/ui - copy all files)
- `src/components/ui/dialog.tsx` - Modal dialog component  
- `src/components/ui/button.tsx` - Button component with variants
- `src/components/ui/card.tsx` - Card layout component
- `src/lib/utils.ts` - Utility functions for styling

#### Optional Components
- `src/components/VideoFileImporter.tsx` - Local video file upload functionality (if needed)

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

### Test Your Integration
1. **Replace Mock Data**: Replace `VideoStreamExample` with your real API calls
2. **Test Synchronization**: Verify all 11 videos start and play in perfect sync
3. **Test Controls**: Verify play/pause, seeking, and progress bar clicking work
4. **Test Approval Workflow**: Check approve/reject functionality 
5. **Performance Testing**: Test with actual video file sizes and quantities

### Interactive Features Testing
- Click the **progress bar** at different positions to test seek functionality
- Use **keyboard shortcuts** (Space, Arrow keys) for quick navigation
- Test **individual video expansion** by clicking on videos
- Verify **10-second seeking** buttons work correctly
- Check **frame-by-frame** navigation precision

### Performance Benchmarks  
#### High Performance Multi-Video System
- **Recommended**: 11 videos × 100-500MB each (MP4, H.264)
- **Network**: Minimum 25 Mbps for smooth 11-video playback
- **Hardware**: 4+ CPU cores, 4GB+ RAM, modern GPU recommended
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+
- **Mobile**: Optimized for modern phones and tablets