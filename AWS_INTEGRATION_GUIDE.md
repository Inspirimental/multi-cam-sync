# AWS CloudFront Player Integration

## Benötigte Dateien

### Minimale Integration:
- `OptimizedMultiVideoPlayer.tsx`
- `VideoCard.tsx` 
- `useVideoSync.tsx`
- `VideoTypes.ts`
- `videoUtils.ts`
- HLS.js dependency (`npm install hls.js`)

## CloudFront API Integration

### API Response Format

Die Anwendung erwartet folgende JSON-Struktur von der CloudFront API:

```json
{
  "cohort_id": "INC#ZRH_LCR_10024#1752756048000000000",
  "vehicle_id": "ZRH_LCR_10024",
  "original_session_id": "",
  "streams": [
    {
      "camera_position": "BCBSC_back",
      "unique_session_id": "1752756048000000000_camera",
      "hls_manifest_url": "https://app.weride.iamo.ai/hls/ZRH_LCR_10024/1752756048000000000_camera/1752756048000000000_camera_BCBSC_back/1752756048000000000_camera_BCBSC_back_master.m3u8",
      "mp4_url": null,
      "thumbnail_url": null,
      "duration": null,
      "resolution": "Auto"
    }
  ],
  "total_streams": 9,
  "processing_status": "completed",
  "signed_cookies": {},
  "expires_at": 1756973730
}
```

## Player Integration

### 1. CloudFront Data Hook verwenden

```typescript
import { useCloudFrontData } from '@/hooks/useCloudFrontData';

const { cloudFrontData, loading, error } = useCloudFrontData({ 
  streamId, 
  currentStream 
});
```

### 2. Player einbinden

```typescript
import OptimizedMultiVideoPlayer from '@/components/OptimizedMultiVideoPlayer';

<OptimizedMultiVideoPlayer
  cloudFrontData={cloudFrontData}
  onClose={handleBack}
  streamName={currentStream.name}
/>
```

### 3. Keyboard Controls

- **Leertaste**: Play/Pause
- **←**: Frame zurück (1/30 Sekunde)  
- **→**: Frame vor (1/30 Sekunde)

Der Player verwendet automatisch die HLS-URLs aus der CloudFront API Response.