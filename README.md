# Video Review System

Ein professionelles System zur Überprüfung von Multi-Video-Streams mit optimierter Benutzeroberfläche und HLS-Streaming-Unterstützung.

## Projektübersicht

**URL**: https://lovable.dev/projects/5f5d362e-b93a-4794-8256-46bc9b4f15da

Dieses System ermöglicht die gleichzeitige Wiedergabe von 7-11 synchronisierten HLS-Video-Streams in einem intelligenten Layout mit separaten Seiten für Übersicht und detaillierte Bewertung.

## Hauptfunktionen

### 🎥 Multi-Video-System
- **7-11 synchronisierte HLS-Streams** in optimiertem Grid-Layout
- **Flexible Stream-Anzahl** - funktioniert mit beliebig vielen verfügbaren Kameras
- **Separate Bewertungsseite** für fokussierte Videoanalyse  
- **Intelligente Layout-Anordnung** mit automatischer Größenanpassung
- **Frame-für-Frame Navigation** für präzise Videoanalyse

### 🎮 Erweiterte Video-Steuerung
- **Modal-Video-Player** mit vollständigen Kontrollelementen
- **Play/Pause** mit Echtzeit-Synchronisation
- **10-Sekunden vor/zurück** für schnelle Navigation
- **Frame-Navigation** (1/30 Sekunde Schritte)
- **Interaktiver Fortschrittsbalken** mit Zeitanzeige
- **Vollbild-Modus** für einzelne Videos

### 📱 Moderne Benutzeroberfläche
- **Responsive Design** für alle Bildschirmgrößen
- **Sticky Header** mit Navigation
- **High Performance** für flüssige Multi-Video-Wiedergabe
- **Intuitive Tastaturkürzel** (Leertaste, Pfeiltasten)

## Technologie-Stack

- **Frontend**: React 18+ mit TypeScript
- **Video-Format**: HLS (HTTP Live Streaming) mit M3U8-Playlists
- **Styling**: Tailwind CSS mit shadcn/ui Komponenten
- **Build-Tool**: Vite für schnelle Entwicklung
- **Icons**: Lucide React für moderne Icon-Bibliothek
- **Routing**: React Router für Seitennavigation

## Architektur

### Haupt-Komponenten
```
src/
├── pages/
│   ├── Index.tsx          # Haupt-Übersichtsseite mit Video-Streams
│   └── VideoReview.tsx    # Separate Bewertungsseite für Video-Analyse
├── components/
│   ├── OptimizedMultiVideoPlayer.tsx  # Kern-Player mit flexiblem Video-Grid
│   ├── VideoCard.tsx                  # Einzelne Video-Komponente mit Modal
│   └── VideoStreamExample.tsx         # Demo-Daten und Navigation
└── types/
    └── VideoTypes.ts                   # TypeScript Interfaces
```

### Routing-System
- `/` - Hauptseite mit Video-Stream-Übersicht
- `/video-review/:streamId` - Detaillierte Bewertungsseite

## Video-Layout

Das System verwendet ein intelligentes flexibles Layout, das sich an die verfügbaren Streams anpasst:

**Standard-Layout (11 Kameras)**:
- **Reihe 1**: Front Left, Front Camera, Front Right
- **Reihe 2**: Wide Center und Wide Front (nebeneinander)  
- **Reihe 3**: Left Side, Wide Front, Right Side
- **Reihe 4**: Back Left, Back Camera, Back Right

**Reduziertes Layout** (7 Kameras): Automatische Anpassung ohne Front-Left/Right Kameras

## HLS-Streaming

### Unterstützte Formate
- **HLS (M3U8)**: Primäres Format für optimale Performance
- **MP4**: Fallback-Unterstützung für Kompatibilität
- **Adaptive Bitrate**: Automatische Qualitätsanpassung

### Stream-URLs
```javascript
const videoFiles = {
  'NCBSC_front': 'https://sharing.timbeck.de/hls/NCBSC_front/index.m3u8',
  'TCBSC_back': 'https://sharing.timbeck.de/hls/TCBSC_back/index.m3u8',
  'WCWVC_front': 'https://sharing.timbeck.de/hls/WCWVC_front/index.m3u8',
  // ... weitere Streams
};
```

## Installation und Entwicklung

### Voraussetzungen
- Node.js & npm ([Installation mit nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Moderner Browser mit HLS-Unterstützung

### Lokale Entwicklung

```sh
# Repository klonen
git clone <YOUR_GIT_URL>

# In Projektverzeichnis wechseln
cd <YOUR_PROJECT_NAME>

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

### Bearbeitung in Lovable

Besuche einfach das [Lovable Project](https://lovable.dev/projects/5f5d362e-b93a-4794-8256-46bc9b4f15da) und beginne mit der Eingabe von Änderungswünschen.

Alle Änderungen über Lovable werden automatisch in dieses Repository übertragen.

### Andere Bearbeitungsmöglichkeiten

- **Direkt in GitHub**: Dateien direkt im Browser bearbeiten
- **GitHub Codespaces**: Vollständige Entwicklungsumgebung im Browser
- **Lokale IDE**: Klone das Repository und arbeite mit deiner bevorzugten IDE

## Deployment

### Lovable Hosting
Öffne [Lovable](https://lovable.dev/projects/5f5d362e-b93a-4794-8256-46bc9b4f15da) und klicke auf Share → Publish.

### Custom Domain
Um eine eigene Domain zu verbinden:
- Navigiere zu Project > Settings > Domains
- Klicke auf "Connect Domain"
- [Detaillierte Anleitung](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Demo-Daten

Das System verwendet HLS-Testvideos von `https://sharing.timbeck.de/hls/` für sofortige Funktionsprüfung. Für die Produktion können diese durch echte HLS-Stream-URLs ersetzt werden.

## System-Anforderungen

### Browser-Support
- **Chrome**: 80+ (beste HLS-Unterstützung)
- **Firefox**: 75+ (mit Media Source Extensions)
- **Safari**: 13+ (native HLS-Unterstützung)
- **Edge**: 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+

### Empfohlene Hardware
- **4+ CPU Kerne** für optimale Multi-Stream-Performance
- **4GB+ RAM** für flüssige 7-11-Video-Wiedergabe
- **Stabile Internetverbindung** (25+ Mbps für 11 Streams empfohlen)

### HLS-Streaming-Anforderungen
- **CDN-Unterstützung**: Optimierte Auslieferung für Multiple-Streams
- **CORS-Konfiguration**: Korrekte Cross-Origin-Einstellungen
- **Segment-Größe**: 2-6 Sekunden für optimale Pufferung

