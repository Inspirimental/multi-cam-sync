# Video Review System - Integration Guide

## Overview
This video review system provides a complete solution for reviewing multi-video streams with **HLS streaming support**. The system features a page-based architecture with a dedicated review page, flexible 7-11 video grid layout, and advanced video controls for frame-accurate analysis.

## Architecture Changes (v3.0)

### 🎥 HLS Streaming Support
The system now supports **HTTP Live Streaming (HLS)** with M3U8 playlists:
- **Primary Format**: HLS (M3U8) for optimized streaming performance
- **Fallback Support**: MP4 for legacy compatibility
- **Adaptive Bitrate**: Automatic quality adjustment based on bandwidth
- **Robust Stream Handling**: Gracefully handles missing streams (7-11 videos)

### 🔄 Flexible Video Grid
The video grid automatically adapts to available streams:
- **Full Layout**: 11 cameras in optimized 4-row arrangement
- **Reduced Layout**: 7 cameras with automatic layout adjustment
- **Smart Fallback**: System continues working even with missing camera feeds

### 🎮 Enhanced User Experience
- **Dedicated Review Page**: Clean interface without approval buttons
- **Sticky Navigation**: Better header with back navigation
- **Modal Video Player**: Full-featured expandable video controls
- **Frame-Perfect Navigation**: 1/30 second precision for detailed analysis

## Core Components (Updated)

### 1. Video Review Page (Simplified)
Main component for video stream analysis with clean navigation
```tsx
// Route: /video-review/:streamId
import VideoReview from './pages/VideoReview';

// Features: Clean header, back navigation, full video interface
// Removed: Approve/Reject buttons for cleaner UX
```

### 2. OptimizedMultiVideoPlayer (HLS Enhanced)
Core video grid player with HLS streaming support
```tsx
import OptimizedMultiVideoPlayer from './components/OptimizedMultiVideoPlayer';

<OptimizedMultiVideoPlayer 
  videoFiles={hlsVideoFiles}  // Now supports M3U8 URLs
  onClose={handleClose}
  streamName="Stream Name"
/>
```

### 3. HLS Video Configuration
Updated video configuration for M3U8 streams:
```tsx
const hlsVideoFiles = {
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
};
```

## Standalone Player Usage (HLS Direct Integration)

### Using the Player with HLS Streams
The `OptimizedMultiVideoPlayer` now prioritizes HLS streaming for better performance:

#### HLS Direct Integration
```tsx
import React, { useState } from 'react';
import OptimizedMultiVideoPlayer from './components/OptimizedMultiVideoPlayer';

const HLSVideoViewer = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Your HLS stream URLs - replace with your actual M3U8 links
  const myHLSStreams = {
    'NCBSC_front': 'https://your-cdn.com/streams/front/index.m3u8',
    'TCBSC_back': 'https://your-cdn.com/streams/back/index.m3u8',
    'TCMVC_back': 'https://your-cdn.com/streams/back_center/index.m3u8',
    'NLBSC_left': 'https://your-cdn.com/streams/left/index.m3u8',
    'NRBSC_right': 'https://your-cdn.com/streams/right/index.m3u8',
    // Add more streams as available (system handles 7-11 streams flexibly)
  };

  return (
    <div>
      <button onClick={() => setShowPlayer(true)}>
        Play HLS Streams
      </button>
      
      {showPlayer && (
        <OptimizedMultiVideoPlayer
          videoFiles={myHLSStreams}
          onClose={() => setShowPlayer(false)}
          streamName="Live Camera Feed"
        />
      )}
    </div>
  );
};
```

#### Flexible Stream Handling
You can use any number of streams from 7-11:
```tsx
// Example with only 7 streams (system adapts automatically)
const reducedHLSStreams = {
  'NCBSC_front': 'https://cdn.example.com/hls/front/index.m3u8',
  'TCBSC_back': 'https://cdn.example.com/hls/back/index.m3u8',
  'NLBSC_left': 'https://cdn.example.com/hls/left/index.m3u8',
  'NRBSC_right': 'https://cdn.example.com/hls/right/index.m3u8',
  'WCNVC_front': 'https://cdn.example.com/hls/wide_front/index.m3u8',
  'WCWVC_front': 'https://cdn.example.com/hls/wide_center/index.m3u8',
  'TCMVC_back': 'https://cdn.example.com/hls/back_center/index.m3u8',
  // Missing streams are handled gracefully
};
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

### 🎯 Optimized Video Layout (Updated)
**Intelligent Flexible Grid System**:
```
Full Layout (11 streams):
Row 1: [Front Left] [Front Camera] [Front Right]
Row 2: [Wide Center] [Wide Front]              
Row 3: [Left] [Wide Front] [Right]           
Row 4: [Back Left] [Back Camera] [Back Right]

Reduced Layout (7 streams):
Row 1: [Front Camera]                          # Centered
Row 2: [Wide Center] [Wide Front]              # Side-by-side
Row 3: [Left] [Wide Front] [Right]             # Distributed
Row 4: [Back Left] [Back Camera] [Back Right]  # Bottom row
```

### 🚀 HLS Performance Architecture  
- **Native Browser Support**: Leverages browser HLS capabilities
- **Adaptive Streaming**: Automatic quality adjustment based on bandwidth
- **Efficient Buffering**: Optimized segment loading for multiple streams
- **Error Recovery**: Graceful handling of network issues and missing streams
- **CDN Optimization**: Works with CDN-delivered HLS streams

## Data Structure (Updated)

### VideoStream Interface (HLS Ready)
```typescript
interface VideoStream {
  id: string;
  name: string;                    // Display name like "2024-01-15 Vormittag"
  date: string;                    // ISO date string
  status: 'pending' | 'approved' | 'rejected';
  videoFiles: { [videoId: string]: string }; // Video ID to HLS URL mapping
}
```

### HLS Video Files Mapping
The player expects HLS streams mapped by these IDs:
```typescript
const hlsVideoFiles = {
  'NCBSC_front': 'https://your-cdn.com/hls/stream1/front/index.m3u8',
  'TCBSC_back': 'https://your-cdn.com/hls/stream1/back/index.m3u8',
  'TCMVC_back': 'https://your-cdn.com/hls/stream1/back_center/index.m3u8',
  'NLBSC_left': 'https://your-cdn.com/hls/stream1/left/index.m3u8',
  'NLMVC_back_left': 'https://your-cdn.com/hls/stream1/back_left/index.m3u8',
  'NLMVC_front_left': 'https://your-cdn.com/hls/stream1/front_left/index.m3u8',
  'NRBSC_right': 'https://your-cdn.com/hls/stream1/right/index.m3u8',
  'NRMVC_back_right': 'https://your-cdn.com/hls/stream1/back_right/index.m3u8',
  'NRMVC_front_right': 'https://your-cdn.com/hls/stream1/front_right/index.m3u8',
  'WCNVC_front': 'https://your-cdn.com/hls/stream1/wide_front/index.m3u8',
  'WCWVC_front': 'https://your-cdn.com/hls/stream1/wide_center/index.m3u8',
};
```

### Working HLS Test Example
The current implementation uses working HLS test streams:
```typescript
const testHLSStreams = {
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
};
```

## Integration Steps (Updated for v3.0 HLS)

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

### 3. HLS CDN Integration
Ensure your HLS streams are accessible from the browser:
- **HTTPS Required**: HLS URLs MUST use HTTPS protocol
- **CORS Configuration**: Configure CORS on your CDN/server
- **Segment Headers**: Enable proper HLS segment delivery
- **CDN Setup**: Use CDN for better performance and global distribution
- **Cache Headers**: Set appropriate cache headers for M3U8 playlists
- **Content-Type**: Ensure proper HLS MIME types (application/x-mpegURL)

Example CORS configuration for HLS:
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

### 4. HLS Stream Organization
Organize your HLS structure like:
```
your-cdn/hls/
  stream-2024-01-15-morning/
    NCBSC_front/
      index.m3u8
      segment001.ts
      segment002.ts
      ...
    TCBSC_back/
      index.m3u8
      segment001.ts
      ...
```

## Deployment Requirements

### Required Files to Transfer
Copy these files to your project:

#### Page Components (Updated)
- `src/pages/Index.tsx` - Main streams overview page
- `src/pages/VideoReview.tsx` - **Updated**: Simplified review page without approval buttons
- `src/pages/NotFound.tsx` - 404 error page for routing
- `src/App.tsx` - Router configuration

#### Core Components (HLS Ready)
- `src/components/OptimizedMultiVideoPlayer.tsx` - **HLS Enhanced**: Flexible 7-11 video grid
- `src/components/VideoCard.tsx` - **HLS Enhanced**: Individual video cards with HLS support
- `src/components/VideoStreamExample.tsx` - Navigation integration example
- `src/types/VideoTypes.ts` - TypeScript interfaces
- `src/utils/videoUtils.ts` - Video utility functions

#### UI Components (shadcn/ui)
- `src/components/ui/dialog.tsx` - Modal dialog component  
- `src/components/ui/button.tsx` - Button component with variants
- `src/components/ui/card.tsx` - Card layout component
- `src/lib/utils.ts` - Utility functions for styling

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

## Testing

### Test Your HLS Integration
1. **Replace Mock Data**: Replace `VideoStreamExample` with your real API calls
2. **Test HLS Playback**: Verify all HLS streams load and play correctly
3. **Test Flexible Layout**: Test with 7, 9, and 11 streams to verify layout adaptation
4. **Test Synchronization**: Verify all videos start and play in sync
5. **Test Controls**: Verify play/pause, seeking, and progress bar work with HLS
6. **Performance Testing**: Test with actual HLS stream quantities

### Interactive Features Testing
- Click the **progress bar** at different positions to test HLS seek functionality
- Use **keyboard shortcuts** (Space, Arrow keys) for quick navigation
- Test **individual video expansion** by clicking on videos
- Verify **10-second seeking** buttons work correctly with HLS
- Check **frame-by-frame** navigation precision

### Performance Benchmarks (HLS)
#### HLS Multi-Stream System
- **Recommended**: 7-11 HLS streams with adaptive bitrate
- **Network**: Minimum 25 Mbps for smooth multi-stream HLS playback
- **Hardware**: 4+ CPU cores, 4GB+ RAM, modern GPU recommended
- **Browser**: Chrome 80+ (best HLS support), Firefox 75+, Safari 13+ (native HLS)
- **Mobile**: Optimized for modern phones and tablets with HLS support