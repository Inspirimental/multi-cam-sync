# Video Review System - Integration Guide

## Overview
This video review system provides a complete solution for reviewing multi-video streams with **HLS streaming support**. The system features a page-based architecture with a dedicated review page, flexible 7-11 video grid layout, and advanced video controls for frame-accurate analysis.

## System Features & Architecture

### 🎥 HLS Streaming & Video Management
- **Primary Format**: HLS (M3U8) for optimized streaming performance
- **Fallback Support**: MP4 for legacy compatibility  
- **Adaptive Bitrate**: Automatic quality adjustment based on bandwidth
- **Flexible Stream Count**: Supports 7-11 video streams with intelligent layout
- **Smart Fallback**: System continues working even with missing camera feeds

### 🎮 Enhanced User Experience & Controls
- **Dedicated Review Page**: Clean interface without approval buttons
- **Modal Video Player**: Full-featured expandable video controls with:
  - Play/Pause Control (Space bar or button)
  - Frame Navigation (Left/Right arrows - 1/30 second precision)  
  - 10-Second Jumping (Fast forward/backward buttons)
  - Interactive Progress Bar (Click anywhere to jump to time)
  - Time Display (Current time / Total duration)
- **Optimized Video Layout**: Intelligent grid system adapting to stream count

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

### 3. AWS S3 HLS Video Configuration
Updated video configuration for AWS S3 M3U8 streams:
```tsx
const awsHlsVideoFiles = {
  'NCBSC_front': 'https://d1234567890abcd.cloudfront.net/hls/NCBSC_front/index.m3u8',
  'TCBSC_back': 'https://d1234567890abcd.cloudfront.net/hls/TCBSC_back/index.m3u8',
  'TCMVC_back': 'https://d1234567890abcd.cloudfront.net/hls/TCMVC_back/index.m3u8',
  'NLBSC_left': 'https://d1234567890abcd.cloudfront.net/hls/NLBSC_left/index.m3u8',
  'NLMVC_back_left': 'https://d1234567890abcd.cloudfront.net/hls/NLMVC_back_left/index.m3u8',
  'NLMVC_front_left': 'https://d1234567890abcd.cloudfront.net/hls/NLMVC_front_left/index.m3u8',
  'NRBSC_right': 'https://d1234567890abcd.cloudfront.net/hls/NRBSC_right/index.m3u8',
  'NRMVC_back_right': 'https://d1234567890abcd.cloudfront.net/hls/NRMVC_back_right/index.m3u8',
  'NRMVC_front_right': 'https://d1234567890abcd.cloudfront.net/hls/NRMVC_front_right/index.m3u8',
  'WCNVC_front': 'https://d1234567890abcd.cloudfront.net/hls/WCNVC_front/index.m3u8',
  'WCWVC_front': 'https://d1234567890abcd.cloudfront.net/hls/WCWVC_front/index.m3u8',
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

### 🎯 Intelligent Video Layout System
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

## AWS CloudFront + S3 Setup für HLS Streams mit Signed Cookies

Für die Implementierung mit AWS CloudFront, S3 und Signed Cookies ist folgende Konfiguration erforderlich:

### 1. S3 Bucket Konfiguration (Privat)

```bash
# Bucket Policy für CloudFront (Privater Zugriff)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-hls-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::account-id:distribution/distribution-id"
        }
      }
    }
  ]
}
```

**Wichtig**: Der S3 Bucket muss privat sein - kein öffentlicher Zugriff!

### 2. CloudFront Distribution mit Signed Cookies

```bash
# CloudFront Distribution Settings
Origin:
  - Domain: your-hls-bucket.s3.amazonaws.com
  - Origin Access Control: Enabled
  - Path Pattern: /hls/*

Behaviors:
  - Viewer Protocol Policy: Redirect HTTP to HTTPS
  - Allowed HTTP Methods: GET, HEAD, OPTIONS
  - Cache Policy: Caching Optimized for HLS
  - Origin Request Policy: CORS-S3Origin
  - Restrict Viewer Access: Yes (Trusted Signers)

CORS Headers:
  - Access-Control-Allow-Origin: https://your-domain.com
  - Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  - Access-Control-Allow-Headers: Range
  - Access-Control-Allow-Credentials: true

Trusted Key Groups:
  - Create a key group with your public key
  - Enable signed cookies for the distribution
```

### 3. CloudFront Signed Cookies Setup

```typescript
// Server-side: Generate signed cookies (Node.js/Lambda)
import AWS from 'aws-sdk';

const cloudfront = new AWS.CloudFront.Signer(
  process.env.CLOUDFRONT_KEY_PAIR_ID!,
  process.env.CLOUDFRONT_PRIVATE_KEY!
);

const signedCookies = cloudfront.getSignedCookie({
  url: 'https://your-cloudfront-domain.net/hls/*',
  expires: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
});

// Cookies werden automatisch im Browser gesetzt
```

### 4. API Endpoint Structure

Die Anwendung erwartet folgende API-Antwort mit CloudFront-Daten:

```json
{
  "cohort_id": "INC#ZRH_LCR_10024#1752756048000000000",
  "vehicle_id": "ZRH_LCR_10024",
  "original_session_id": "",
  "streams": [
    {
      "camera_position": "NCBSC_front",
      "unique_session_id": "1752756048000000000_camera",
      "hls_manifest_url": "https://your-cloudfront-domain.net/hls/ZRH_LCR_10024/1752756048000000000_camera/index.m3u8",
      "mp4_url": null,
      "thumbnail_url": null,
      "duration": null,
      "resolution": "Auto"
    },
    {
      "camera_position": "TCBSC_back",
      "unique_session_id": "1752756048000000000_back",
      "hls_manifest_url": "https://your-cloudfront-domain.net/hls/ZRH_LCR_10024/1752756048000000000_back/index.m3u8",
      "mp4_url": null,
      "thumbnail_url": null,
      "duration": null,
      "resolution": "Auto"
    }
  ],
  "total_streams": 2,
  "processing_status": "completed",
  "signed_cookies": {
    "CloudFront-Policy": "eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIj...",
    "CloudFront-Signature": "abcdef123456...",
    "CloudFront-Key-Pair-Id": "APKAIX..."
  },
  "expires_at": 1756973730
}
```

### 5. Frontend Implementation

Die Frontend-Implementierung wurde erweitert um CloudFront-Unterstützung:

```typescript
// VideoReview Komponente fetcht CloudFront-Daten
const fetchCloudFrontData = async (streamId: string) => {
  const response = await fetch(`/api/streams/${streamId}`);
  const data: CloudFrontApiResponse = await response.json();
  
  // Signed Cookies werden automatisch vom Browser verwaltet
  return data;
};

// OptimizedMultiVideoPlayer unterstützt CloudFront-Streams
<OptimizedMultiVideoPlayer
  cloudFrontData={cloudFrontApiResponse}
  streamName={streamName}
  onClose={handleClose}
/>
```
Organize your HLS streams in S3 with this structure:
```
s3://your-hls-bucket/
  hls/
    stream-2024-01-15-morning/
      NCBSC_front/
        index.m3u8
        segment001.ts
        segment002.ts
        segment003.ts
        ...
      TCBSC_back/
        index.m3u8  
        segment001.ts
        segment002.ts
        ...
      TCMVC_back/
        index.m3u8
        segment001.ts
        ...
```

#### AWS S3 Upload Example
Use AWS CLI to upload HLS files:
```bash
# Upload with proper content types
aws s3 sync ./hls-output/ s3://your-hls-bucket/hls/ \
  --include "*.m3u8" \
  --content-type "application/x-mpegURL" \
  --cache-control "max-age=60"

aws s3 sync ./hls-output/ s3://your-hls-bucket/hls/ \
  --include "*.ts" \
  --content-type "video/MP2T" \
  --cache-control "max-age=3600"
```

## Deployment & Environment Setup

### Required Dependencies
The player requires these packages (install via npm/yarn):
```bash
npm install @radix-ui/react-dialog @radix-ui/react-slot
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-router-dom hls.js
```

### Required Components
**Core Files to Copy**:
- `src/pages/Index.tsx` - Main streams overview page
- `src/pages/VideoReview.tsx` - Simplified review page  
- `src/components/OptimizedMultiVideoPlayer.tsx` - HLS multi-video grid
- `src/components/VideoCard.tsx` - Individual video cards with HLS support
- `src/types/VideoTypes.ts` - TypeScript interfaces
- `src/utils/videoUtils.ts` - Video utility functions

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

### System Requirements & Performance
#### Hardware Recommendations
- **CPU**: 4+ cores for optimal multi-stream performance
- **RAM**: 4GB+ for smooth 7-11 video playback
- **Network**: Minimum 25 Mbps for multi-stream HLS
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+ (native HLS), Edge 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+