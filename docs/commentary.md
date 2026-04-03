# Kommentator-System

## Übersicht

Das Kommentator-System generiert automatisch textbasierte Kommentare nach jedem Spiel und liest diese optional per Web Speech API vor. Das System ist in `src/games/schafkopf/commentary.js` implementiert.

---

## Persönlichkeiten

Es sind vier Kommentator-Persönlichkeiten verfügbar, die jeweils über eigene Templates, Stimmeinstellungen und Sprechgeschwindigkeit verfügen:

### Dramatischer Stadion-Reporter (dramatic)
- **Icon:** 🎙️
- **Pitch:** 1.2 (etwas höher)
- **Rate:** 0.95 (fast normal)
- **Stil:** Große Emotionen, Superlative, Begriffe wie "SENSATIONELL", "HISTORISCH"

### Nüchterner Tagesschau-Sprecher (tagesschau)
- **Icon:** 📺
- **Pitch:** 0.88 (etwas tiefer)
- **Rate:** 0.78 (langsamer)
- **Stil:** Sachlich, faktisch, kurze Sätze, keine Emotionen

### Bayerischer Opa (bavarian)
- **Icon:** 🍺
- **Pitch:** 0.82 (tief)
- **Rate:** 0.72 (langsam)
- **Stil:** Bayerischer Dialekt, Redewendungen wie "Jo mei", "Freilich", "Na bitte"

### Aufgeregter Fan im Biergarten (fan)
- **Icon:** 🤩
- **Pitch:** 1.3 (hoch)
- **Rate:** 1.1 (schnell)
- **Stil:** Extrem emotional, Ausrufe, "JAAAAA", "WAAAS"

---

## Template-Struktur

### Haupt-Templates

Templates sind nach Persönlichkeit, Ergebnis (gewonnen/verloren) und Spieltyp organisiert:

```javascript
COMMENTATOR_TEMPLATES = {
  dramatic: {
    won: {
      Sauspiel: ["Template 1", "Template 2", ...],
      Wenz: ["Template 1", "Template 2", ...],
      Solo: ["Template 1", "Template 2", ...],
      "Wenz Tout": ["Template 1", ...],
      "Solo Tout": ["Template 1", ...],
    },
    lost: { ... }
  },
  tagesschau: { ... },
  bavarian: { ... },
  fan: {
    won: { ... },
    lost: ["Allgemeine Verlust-Templates"]  // Keine Typ-Differenzierung
  }
}
```

### Platzhalter

Templates unterstützen folgende Platzhalter:

| Platzhalter | Beispiel | Beschreibung |
|---|---|---|
| `{player}` | "Müller" | Ansagender Spieler |
| `{partner}` | "Wagner" | Partner (bei Sauspiel) |
| `{type}` | "Solo" | Spieltyp |
| `{spielwert}` | "2.00" | Spielwert als formatierter String |
| `{seq}` | "5" | Laufende Nummer des Spiels |
| `{laufende}` | "3" | Anzahl der Laufenden |
| `{bock}` | "2" | Bock-Multiplikator |

---

## Modifikatoren

Zusätzliche Informationen werden über Modifikator-Templates angehängt:

```javascript
MODIFIERS = {
  dramatic: {
    schneider: [" Und obendrauf: SCHNEIDER! Die Demütigung ist komplett!"],
    schwarz: [" SCHWARZ! Kein einziger Stich für die Verlierer! HISTORISCH!"],
    laufende: [" Dazu {laufende} Laufende! Das ist eine Abrechnung ohne Gnade!"],
    bock: [" Und das alles in einer BOCKRUNDE mit Faktor {bock}!"],
    klopfer: [" Plus Klopfer! Die Dreistigkeit zahlt sich aus — oder nicht!"],
  },
  // ... andere Persönlichkeiten
}
```

Modifikatoren werden bedingungslos angehängt, wenn die entsprechende Bedingung erfüllt ist (außer bei der "fan"-Persönlichkeit, die keine Modifikatoren für Verluste verwendet).

---

## Spieler-Reaktionen

### Declarer-Reaktionen

Der gewinnende/verlierende Spieler kann zusätzlich reagieren:

```javascript
PLAYER_REACTIONS = {
  dramatic: {
    won: [
      "Ja, das war ich! Hat jemand etwas anderes erwartet?!",
      "CHAMPION! Das ist meine Bühne!",
      "Grandios, ich weiß. Danke, danke, kein Applaus nötig.",
    ],
    lost: [
      "Das ist ein SKANDAL! Ich fordere eine Neuauszählung!",
      "Unglaublich! Das war Sabotage!",
    ],
  },
  // ... andere Persönlichkeiten
}
```

### Opponent-Reaktionen

Ein zufälliger Gegner kann ebenfalls reagieren:

```javascript
OPPONENT_REACTIONS = {
  dramatic: {
    won: [
      "Hervorragend! Wir haben sie zerstört!",
      "Das ist GERECHTIGKEIT! Uns aufhalten? Unmöglich!",
    ],
    lost: [
      "Glück gehabt. Nur Glück.",
      "Das war Glück. Das nächste Mal gewinnen WIR.",
    ],
  },
  // ... andere Persönlichkeiten
}
```

---

## Reaktions-Wahrscheinlichkeit

Die Wahrscheinlichkeit für Spieler-Reaktionen hängt von der Dramatik des Spiels ab:

```javascript
function reactionChance(game) {
  let p = 0.30;  // Basis für einfaches Sauspiel

  // Spieltyp
  if (game.type === "Solo Tout" || game.type === "Wenz Tout") p += 0.50;
  else if (game.type === "Solo" || game.type === "Wenz") p += 0.28;

  // Zusätzliche Faktoren
  if (game.schwarz) p += 0.25;
  if (game.schneider) p += 0.10;
  if (game.laufende >= 3) p += 0.12;
  if (game.bock > 1) p += 0.10;
  if (game.klopfer?.length > 0) p += 0.10;

  return Math.min(p, 0.95);  // Maximal 95%
}
```

**Beispiele:**
- Einfaches Sauspiel: 30%
- Solo mit Schneider und Schwarz: 65%
- Solo Tout mit 3 Laufenden und Bock 2: 95%

---

## API-Funktionen

### `buildCommentatorText(game, personality)`

Erstellt den Kommentar-Text für den Kommentator.

**Parameter:**
- `game` – Spiel-Objekt aus der API
- `personality` – Persönlichkeits-Key (string)

**Rückgabe:** Vollständiger Kommentar-Text (string)

---

### `buildFullCommentary(game, regPlayers, personality)`

Erstellt die vollständige Commentary-Struktur mit optionalen Spieler-Reaktionen.

**Parameter:**
- `game` – Spiel-Objekt aus der API
- `regPlayers` – Array der registrierten Spieler (für Avatar/Charakter-Lookup)
- `personality` – Kommentator-Persönlichkeit (string, default: "dramatic")

**Rückgabe:**
```javascript
{
  segments: [
    {
      avatar: "🎙️",
      name: "Kommentator",
      label: "Dramatischer Stadion-Reporter",
      text: "UND DAAA! Müller spielt das Solo durch! ..."
    },
    {
      avatar: "🦊",
      name: "Müller",
      label: "Dramatischer Stadion-Reporter",
      text: "CHAMPION! Das ist meine Bühne!"
    }
    // ... evtl. Gegner-Reaktion
  ],
  spokenText: "UND DAAA! Müller spielt das Solo durch! ... — CHAMPION! Das ist meine Bühne! ..."
}
```

---

## Text-to-Speech (TTS)

### Web Speech API

Die App verwendet die browser-native `SpeechSynthesisUtterance` API:

```javascript
const utter = new SpeechSynthesisUtterance(spokenText);
utter.voice = selectedVoice;  // Aus window.speechSynthesis.getVoices()
utter.pitch = personality.pitch;
utter.rate = personality.rate;
utter.lang = "de-DE";
utter.onend = onClose;
window.speechSynthesis.speak(utter);
```

### Stimmen-Auswahl

Die App lädt alle verfügbaren Stimmen des Systems und stellt diese im Kommentator-Settings-Panel zur Auswahl:

- Priorität 1: Explizit gewählte Stimme (`player.voice_name`)
- Priorität 2: Erste deutsche Stimme (`v.lang.startsWith("de")`)
- Priorität 3: Standard-Stimme des Systems

### Browser-Unterstützung

Nicht alle Browser unterstützen TTS oder deutsche Stimmen. Die App prüft dies:

```javascript
const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;
```

Wenn TTS nicht verfügbar ist, wird das Overlay nur angezeigt, aber nicht vorgelesen.

---

## Player-Einstellungen

Jeder Spieler kann seine eigene Persönlichkeit und Stimme konfigurieren:

```javascript
{
  id: "uuid",
  name: "Müller",
  avatar: "🦊",
  character_type: "bavarian",  // Reaktions-Stil
  voice_name: "Anna",           // TTS-Stimme (optional)
  created_at: "2025-04-01T10:00:00.000Z"
}
```

Die `character_type` bestimmt, welche Reaktionstemplates verwendet werden, wenn der Spieler reagiert.

---

## UI-Integration

### Overlay-Anzeige

Das `CommentaryOverlay` wird automatisch angezeigt, wenn:
1. Ein Spiel eingetragen wurde
2. Der Kommentator in den Settings aktiviert ist

```javascript
// In SessionView.jsx
if (enabled) setPendingCommentary(newGame);
```

### Kommentator-Settings

In der Session-View kann der Kommentator konfiguriert werden:

```javascript
{
  personality: "dramatic",  // Kommentator-Persönlichkeit
  voice: "Anna",            // Kommentator-Stimme
  enabled: true             // Aktiv/Inaktiv
}
```

Diese Einstellungen werden über `useCommentatorSettings()` im `localStorage` persistiert.

### Automatisches Schließen

Das Overlay schließt automatisch:
- Nach dem TTS (`onend`-Event)
- Bei Klick auf "Schließen"
- Bei Klick außerhalb der Karte (Overlay-Hintergrund)
- Bei Komponenten-Unmount (Cleanup)

---

## Erweiterbarkeit

### Neue Persönlichkeit

Um eine neue Persönlichkeit hinzuzufügen:

1. In `PERSONALITIES` registrieren:
```javascript
PERSONALITIES = {
  // ...
  sarcastic: {
    label: "Sarkastischer Kommentator",
    icon: "😏",
    pitch: 1.0,
    rate: 0.9
  }
}
```

2. Templates in `COMMENTATOR_TEMPLATES` hinzufügen:
```javascript
COMMENTATOR_TEMPLATES = {
  // ...
  sarcastic: {
    won: {
      Sauspiel: ["Oh, wie üblich gewonnen. Wie überraschend.", ...],
      // ...
    },
    lost: { ... }
  }
}
```

3. Modifikatoren in `MODIFIERS` hinzufügen

4. Spieler-Reaktionen in `PLAYER_REACTIONS` und `OPPONENT_REACTIONS` ergänzen

### Neue Spieltypen

Für neue Spieltypen (z. B. "Ramsch") müssen Templates für alle Persönlichkeiten hinzugefügt werden:

```javascript
COMMENTATOR_TEMPLATES.dramatic.won.Ramsch = [
  "RAMSCH! Alle verloren! Die Tränen fließen!",
  // ...
];
```
