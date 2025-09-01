# Video Review System

Ein professionelles System zur Überprüfung und Genehmigung von Multi-Video-Streams mit optimierter Benutzeroberfläche und präzisen Steuerungselementen.

## Projektübersicht

**URL**: https://lovable.dev/projects/5f5d362e-b93a-4794-8256-46bc9b4f15da

Dieses System ermöglicht die gleichzeitige Wiedergabe und Bewertung von 11 synchronisierten Video-Streams in einem intelligenten Layout mit separaten Seiten für Übersicht und detaillierte Bewertung.

## Hauptfunktionen

### 🎥 Multi-Video-System
- **11 synchronisierte Video-Streams** in optimiertem Grid-Layout
- **Separate Bewertungsseite** für fokussierte Videoanalyse  
- **Intelligente Layout-Anordnung** mit reduzierten Größen für Wide Center/Front Videos
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
- **Sticky Header** mit Navigation und Aktions-Buttons
- **High Performance** für flüssige Multi-Video-Wiedergabe
- **Intuitive Tastaturkürzel** (Leertaste, Pfeiltasten)

## Technologie-Stack

- **Frontend**: React 18+ mit TypeScript
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
│   ├── OptimizedMultiVideoPlayer.tsx  # Kern-Player mit 11-Video-Grid
│   ├── VideoCard.tsx                  # Einzelne Video-Komponente mit Modal
│   └── VideoStreamExample.tsx         # Demo-Daten und Navigation
└── types/
    └── VideoTypes.ts                   # TypeScript Interfaces
```

### Routing-System
- `/` - Hauptseite mit Video-Stream-Übersicht
- `/video-review/:streamId` - Detaillierte Bewertungsseite

## Video-Layout

Das System verwendet ein intelligentes 4-Reihen-Layout:

**Reihe 1**: Wide Center und Wide Front (nebeneinander, reduzierte Größe)
**Reihe 2**: Front und Back (zentriert)  
**Reihe 3**: Left Side, Back Center, Right Side (gleichmäßig verteilt)
**Reihe 4**: Back Left, Back Camera, Back Right (untere Reihe)

## Installation und Entwicklung

### Voraussetzungen
- Node.js & npm ([Installation mit nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Moderner Browser für Multi-Video-Performance

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

Das System verwendet Testvideos von `https://sharing.timbeck.de/` für sofortige Funktionsprüfung. Für die Produktion können diese durch echte Video-URLs ersetzt werden.

## System-Anforderungen

### Browser-Support
- **Chrome**: 80+
- **Firefox**: 75+ 
- **Safari**: 13+
- **Edge**: 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+

### Empfohlene Hardware
- **4+ CPU Kerne** für optimale Performance
- **4GB+ RAM** für flüssige 11-Video-Wiedergabe
- **Stabile Internetverbindung** (25+ Mbps empfohlen)
