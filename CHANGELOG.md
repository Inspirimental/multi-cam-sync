# Changelog - Video Review System

## Version 1.2.0 (2025-01-02)

### 🎯 **CORS & HLS Streaming Fixes**
- **Gelöst**: Chrome CORS-Probleme mit HLS-Streams
- **Server-Konfiguration**: Hinzugefügte `.htaccess` CORS-Headers für `*.m3u8` und `*.ts` Dateien
- **Vereinfachte HLS-Konfiguration**: Entfernung der komplexen Credential-Retry-Logik
- **Browser-Kompatibilität**: Vollständige Unterstützung für Chrome, Safari, Firefox

### 🔧 **Video-Synchronisation verbessert**
- **Behoben**: Seek-Problem im erweiterten Video-Modal
- **Erweiterte Synchronisation**: Das System verwendet jetzt das erweiterte Video als Referenz statt immer das Master-Video
- **Verbessertes Timing**: Konsistente Wiedergabe-Position nach manueller Seek-Operation

### 🧹 **Code-Cleanup**
- **Entfernt**: Nicht verwendete `triedCredsRef` Variable
- **Vereinfacht**: HLS-Setup ohne komplexe Fallback-Mechanismen
- **Optimiert**: Performance und Wartbarkeit des Codes

## Finale Server-Konfiguration (.htaccess)

```apache
# MIME-Types für HLS
AddType application/vnd.apple.mpegurl .m3u8
AddType video/MP2T .ts

# CORS für HLS-Streams
<FilesMatch "\.(m3u8|ts)$">
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET,HEAD,OPTIONS"
  Header set Access-Control-Allow-Headers "Origin,Range,Accept,Access-Control-Request-Method,Access-Control-Request-Headers"
  Header set Access-Control-Expose-Headers "Content-Length,Content-Range,Accept-Ranges"
</FilesMatch>

# Preflight-OPTIONS sauber beantworten
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^ - [R=204,L]
```

## Browser-Support Status ✅

| Browser | HLS Support | Status |
|---------|-------------|---------|
| Safari | ✅ Native | Funktioniert perfekt |
| Chrome | ✅ Hls.js | Funktioniert mit CORS-Fix |
| Firefox | ✅ Hls.js | Funktioniert mit CORS-Fix |
| Edge | ✅ Hls.js | Funktioniert mit CORS-Fix |

## Technische Details

### HLS-Loading-Strategie
1. **Safari**: Nutzt natives HLS (`video.canPlayType`)
2. **Andere Browser**: Nutzt Hls.js mit deaktivierten Credentials
3. **CORS-Handling**: Vereinfachtes Setup ohne Retry-Mechanismen

### Video-Synchronisation
- **Grid-View**: Synchronisation auf Master-Video (NCBSC_front)
- **Erweiterte Ansicht**: Synchronisation auf das aktuell erweiterte Video
- **Seek-Operations**: Berücksichtigen das aktuelle Referenz-Video

## Performance-Optimierungen
- Entfernung nicht benötigter Ref-Variablen
- Vereinfachte Error-Handling-Logik
- Optimierte HLS-Konfiguration für Cross-Origin-Streams