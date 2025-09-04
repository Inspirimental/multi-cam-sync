# AWS CloudFront Video Streaming Integration Guide

## Überblick

Diese Anwendung ist ein Multi-Video-Player, der speziell für die Integration mit AWS CloudFront HLS-Streams entwickelt wurde. Das System unterstützt die Wiedergabe von bis zu 11 synchronisierten Kamera-Streams mit optimierter Performance und Benutzerfreundlichkeit.

## Architektur

```
Frontend (React/TypeScript)
    ↓
CloudFront API Response
    ↓
HLS.js Video Player
    ↓
AWS CloudFront Distribution
    ↓
S3 Bucket (HLS Segments)
```

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

### Unterstützte Camera Positions

Das System unterstützt insgesamt **11 Kamera-Positionen**. Im aktuellen Beispiel sind **9 aktiv**, **2 fehlen**.

#### Vollständige Kamera-Position Übersicht:

| Camera Position | Titel | Grid Position | Größe | Status |
|----------------|-------|---------------|-------|--------|
| `FLMVC_back_left` | Front Left | Row 1, Left | Small (w-32) | ✅ **Aktiv** |
| `FLNVC_front` | Front Camera | Row 1, Center | Large (w-96) | ✅ **Aktiv** |
| `FRMVC_back_right` | Front Right | Row 1, Right | Small (w-32) | ✅ **Aktiv** |
| `FLOBC_front` | Wide Center | Row 2, Left | Medium (w-48) | ✅ **Aktiv** |
| `NCMVC_front` | Wide Front | Row 2, Right | Medium (w-48) | ✅ **Aktiv** |
| `FLBSC_down` | Left Side | Row 3, Left | Small (w-32) | ✅ **Aktiv** |
| `BCMVC_back` | Back Center | Row 3, Center | Medium (w-64) | ✅ **Aktiv** |
| `FRBSC_down` | Right Side | Row 3, Right | Small (w-32) | ✅ **Aktiv** |
| `BCBSC_back` | Back Camera | Row 4, Center | Large (w-96) | ✅ **Aktiv** |
| `NLMVC_front_left` | Extra Front Left | Row 1, Left Alt | Small (w-32) | ❌ **Fehlt** |
| `NRMVC_front_right` | Extra Front Right | Row 1, Right Alt | Small (w-32) | ❌ **Fehlt** |

#### Fehlende Positionen für vollständige 11-Stream-Konfiguration:
1. **`NLMVC_front_left`** - Extra Front Left Camera
2. **`NRMVC_front_right`** - Extra Front Right Camera

#### Erweiterte Grid-Anordnung (11 Streams):
```
Row 1: [NLMVC_front_left] [FLNVC_front] [NRMVC_front_right]
       [FLMVC_back_left]              [FRMVC_back_right]
                        (5 Videos)

Row 2: [FLOBC_front] [NCMVC_front]
                (2 Videos)

Row 3: [FLBSC_down] [BCMVC_back] [FRBSC_down]
                (3 Videos)

Row 4: [BCBSC_back]
          (1 Video)
```

#### Mapping für AWS Kollege:
```json
{
  "missing_streams": [
    {
      "camera_position": "NLMVC_front_left",
      "description": "Extra Front Left Camera",
      "grid_position": "Row 1, Alt Left",
      "size": "w-32"
    },
    {
      "camera_position": "NRMVC_front_right", 
      "description": "Extra Front Right Camera",
      "grid_position": "Row 1, Alt Right",
      "size": "w-32"
    }
  ]
}
```

## HLS Stream Konfiguration

### Voraussetzungen für CloudFront

1. **S3 Bucket Setup**:
   ```
   bucket-name/
   ├── vehicle_id/
   │   ├── session_id_camera_position/
   │   │   ├── master.m3u8
   │   │   ├── playlist_*.m3u8
   │   │   └── segment_*.ts
   ```

2. **CloudFront Distribution**:
   - Origin: S3 Bucket
   - Behavior: `/hls/*` → S3 Origin
   - CORS Headers aktiviert
   - Signed Cookies Support (optional)

### HLS.js Konfiguration

```javascript
const hlsConfig = {
  enableWorker: false,
  lowLatencyMode: true,
  fragLoadingMaxRetry: 1,
  manifestLoadingMaxRetry: 1,
  xhrSetup: (xhr) => { 
    xhr.withCredentials = false; // Für Cross-Origin ohne Credentials
  }
};
```

## Implementierungsdetails

### 1. API Integration (VideoReview.tsx)

```typescript
// Mock-Implementation - ersetzen durch echte API
const fetchCloudFrontData = async () => {
  const response = await fetch(`/api/streams/${streamId}`);
  const data: CloudFrontApiResponse = await response.json();
  setCloudFrontData(data);
};
```

### 2. Video Configuration

Die Anwendung priorisiert CloudFront-Daten:

```typescript
// Priorität 1: CloudFront Streams
if (cloudFrontData?.streams) {
  return cloudFrontData.streams.map((stream) => ({
    id: stream.camera_position,
    name: `${stream.camera_position}.m3u8`,
    title: stream.camera_position.replace(/_/g, ' '),
    src: stream.hls_manifest_url
  }));
}
```

### 3. Error Handling

- **HLS Errors**: Automatische Wiederherstellung bei Netzwerk-/Media-Fehlern
- **CORS Issues**: Deaktivierte Credentials für Cross-Origin Requests
- **Timeout Protection**: 5-Sekunden-Timeout für hängende Video-Loads

## Performance Optimierungen

### 1. Video Loading
- Progressive Loading mit Metadata-Priorität
- Automatische Thumbnail-Generierung
- Lazy Loading für nicht-sichtbare Videos

### 2. Synchronisation
- Master-Video-Konzept für Zeitsteuerung
- Frame-genaue Synchronisation (30fps)
- Optimierte Seek-Performance

### 3. Memory Management
- HLS Instance Cleanup bei Component Unmount
- Thumbnail Canvas Optimierung
- Video Element Recycling

## Security Considerations

### Signed Cookies (Optional)

Wenn Signed Cookies verwendet werden:

```json
{
  "signed_cookies": {
    "CloudFront-Policy": "eyJ...",
    "CloudFront-Signature": "abc...",
    "CloudFront-Key-Pair-Id": "APKAI..."
  }
}
```

Die Cookies werden automatisch für alle HLS-Requests verwendet.

### CORS Configuration

CloudFront Behavior:
```
Allowed Methods: GET, HEAD, OPTIONS
Allowed Headers: *
Allowed Origins: https://yourdomain.com
Cached Headers: Authorization, Origin
```

## Monitoring & Logging

### Frontend Logs
- HLS Loading Events: `[HLS] loading <url>`
- Error Events: `[HLS Error] <camera_id> <error_data>`
- Performance: `[video] timeout counted as loaded <id>`

### Metriken
- Video Load Success Rate
- Average Load Time
- Stream Quality Metrics
- Error Rate per Camera Position

## Deployment Checklist

### AWS Infrastructure
- [ ] S3 Bucket mit korrekter Struktur
- [ ] CloudFront Distribution konfiguriert
- [ ] CORS Headers gesetzt
- [ ] Signed Cookies aktiviert (optional)
- [ ] Monitoring/Logging aktiviert

### API Endpoints
- [ ] GET `/api/streams/{streamId}` implementiert
- [ ] Error Handling für nicht-existierende Streams
- [ ] Rate Limiting konfiguriert
- [ ] Authentication/Authorization

### Frontend
- [ ] Umgebungsvariablen gesetzt
- [ ] Error Boundaries implementiert
- [ ] Performance Monitoring aktiviert
- [ ] Browser Kompatibilität getestet

## Troubleshooting

### Häufige Probleme

1. **Videos laden nicht**:
   - CORS Konfiguration prüfen
   - HLS Manifest URL validieren
   - CloudFront Cache-Status überprüfen

2. **Synchronisation Probleme**:
   - Alle Videos haben gleiche Framerate?
   - Master-Video Auswahl korrekt?
   - Netzwerk-Latenz berücksichtigen

3. **Performance Issues**:
   - Anzahl gleichzeitiger Streams reduzieren
   - Video-Auflösung optimieren
   - Browser-Cache leeren

### Debug Commands

```javascript
// Console Commands für Debugging
window.videoDebug = {
  getCurrentTimes: () => Object.values(videoRefs.current).map(v => v?.currentTime),
  getReadyStates: () => Object.values(videoRefs.current).map(v => v?.readyState),
  forceSync: (time) => Object.values(videoRefs.current).forEach(v => v.currentTime = time)
};
```

## Kontakt & Support

Für weitere Fragen zur AWS-Integration:
- Prüfen Sie die CloudFront Access Logs
- Validieren Sie die HLS Manifest-Dateien
- Testen Sie einzelne Streams isoliert

---

**Version**: 1.0  
**Letzte Aktualisierung**: $(date)  
**Kompatibilität**: AWS CloudFront, HLS.js 1.6+