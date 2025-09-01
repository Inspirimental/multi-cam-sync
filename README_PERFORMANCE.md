# Video Player Performance Modes

## Übersicht

Der optimierte Video Player verfügt über zwei Performance-Modi, die automatisch basierend auf der Geräteleistung ausgewählt werden:

## High Performance Modus

**Aktiviert auf:** Modernen Geräten mit ≥4 CPU-Kernen und ≥4GB RAM

**Funktionen:**
- **Nahtlose Video-Vergrößerung:** Videos werden ohne Neuladen vergrößert/verkleinert
- **Kontinuierliche Background-Wiedergabe:** Alle Videos laufen im Hintergrund weiter
- **Sofortige Synchronisation:** Beim Schließen der Einzelansicht sind alle Videos bereits synchronisiert
- **Flüssige Übergänge:** Keine Unterbrechungen beim Wechseln zwischen Ansichten

**Vorteile:**
- Bessere Benutzererfahrung
- Keine Wartezeiten beim Vergrößern/Verkleinern
- Perfekte Synchronisation

**Nachteile:**
- Höherer RAM-Verbrauch
- Mehr CPU-Last durch kontinuierliche Dekodierung

## Compatibility Modus (Low Performance)

**Aktiviert auf:** Älteren/schwächeren Geräten oder automatisch bei Performance-Problemen

**Funktionen:**
- **Separate Video-Elemente:** Grid- und Einzelansicht verwenden getrennte Video-Streams
- **Pause-Logik:** Background-Videos werden pausiert um Ressourcen zu sparen
- **Traditionelle Synchronisation:** Manuelle Zeitsynchronisation beim Wechseln

**Vorteile:**
- Geringerer Ressourcenverbrauch
- Bessere Performance auf schwächeren Geräten
- Stabiler auf älteren Browsern

**Nachteile:**
- Kurze Ladezeiten beim Vergrößern
- Mögliche Synchronisations-Verzögerungen

## Automatische Erkennung

Das System erkennt automatisch die optimale Performance-Einstellung basierend auf:

```typescript
const isLowEnd = (isMobile && cores <= 2) || 
                 (!isMobile && cores <= 2 && memory <= 4) || 
                 memory <= 1;
```

## Adaptive Performance-Überwachung

- **Frame-Drop Monitoring:** Kontinuierliche Überwachung der Wiedergabe-Performance
- **Automatischer Fallback:** Bei Performance-Problemen automatischer Wechsel zu Compatibility Modus
- **User Benachrichtigung:** Toast-Nachricht beim automatischen Moduswechsel

## Manuelle Steuerung

Benutzer können den Performance-Modus manuell über das Einstellungsmenü ändern:

1. Klick auf "High Performance" oder "Compatibility" Button im Header
2. Auswahl des gewünschten Modus im aufklappenden Panel
3. Sofortige Anwendung der neuen Einstellungen

## Technische Implementation

### High Performance Modus
- Ein `<video>` Element pro Stream mit CSS-Transform für Größenänderung
- Kontinuierliche `onTimeUpdate` Events für alle Videos
- Shared Video-Referenzen zwischen Grid und Einzelansicht

### Compatibility Modus  
- Separate `<video>` Elemente für Grid und Einzelansicht
- Pause-Resume Logik beim Ansichtswechsel
- Zeit-basierte Synchronisation über `videoTimes` State

## Browser-Kompatibilität

- **High Performance:** Chrome 80+, Firefox 75+, Safari 13+
- **Compatibility:** Alle modernen Browser, IE11+ (mit Polyfills)

## Debugging

Performance-Statistiken sind über die Browser-Konsole verfügbar:

```javascript
// Performance Monitor Statistiken abrufen
performanceMonitor.current?.getStats()
// { frameDrops: 5, totalFrames: 1800, dropRate: 0.002 }
```