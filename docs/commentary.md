# Kommentator-System

## Übersicht

Das Kommentator-System generiert nach jedem Schafkopf-Spiel bzw. jeder Wizard-Runde automatisch textbasierte Kommentare und liest diese per Web Speech API vor. Es gibt keine externe KI-API — alles basiert auf lokalen Templates.

**Dateien:**
- `src/games/schafkopf/commentary.js` — Schafkopf-Templates + `PERSONALITIES` (Quelle der Wahrheit)
- `src/games/wizard/commentary.js` — Wizard-Templates + re-exportiert `PERSONALITIES`
- `src/components/CommentaryOverlay.jsx` — gemeinsame UI-Komponente
- `src/hooks/useCommentatorSettings.js` — localStorage-Persistenz der Einstellungen

---

## Persönlichkeiten

Vier Persönlichkeiten sind in `PERSONALITIES` (schafkopf/commentary.js) definiert und werden von beiden Spielen verwendet:

| Key | Label | Icon | Pitch | Rate | Stil |
|---|---|---|---|---|---|
| `dramatic` | Dramatischer Stadion-Reporter | 🎙️ | 1.2 | 0.95 | Superlative, Ausrufe, CAPS |
| `tagesschau` | Nüchterner Tagesschau-Sprecher | 📺 | 0.88 | 0.78 | Sachlich, kurz, faktisch |
| `bavarian` | Bayerischer Opa | 🍺 | 0.82 | 0.72 | Dialekt, "Jo mei", "Freilich" |
| `fan` | Aufgeregter Fan im Biergarten | 🤩 | 1.3 | 1.1 | Extrem emotional, Ausrufe |

---

## Schafkopf-Kommentator

### Template-Struktur

Templates sind nach Persönlichkeit × Ergebnis × Spieltyp organisiert:

```js
COMMENTATOR_TEMPLATES = {
  dramatic: {
    won: {
      Sauspiel: ["Template 1", "Template 2", ...],
      Wenz:     ["Template 1", ...],
      Solo:     ["Template 1", ...],
      "Wenz Tout": [...],
      "Solo Tout": [...],
    },
    lost: { /* gleiche Struktur */ }
  },
  tagesschau: { ... },
  bavarian: { ... },
  fan: {
    won: { ... },
    lost: ["Allgemeine Verlust-Templates"]  // Fan: keine Typ-Differenzierung bei Verlust
  }
}
```

**Template-Platzhalter:**

| Platzhalter | Beschreibung |
|---|---|
| `{player}` | Ansagender Spieler |
| `{partner}` | Partner (bei Sauspiel) |
| `{type}` | Spieltyp |
| `{spielwert}` | Spielwert als formatierter String |
| `{laufende}` | Anzahl der Laufenden |
| `{bock}` | Bock-Multiplikator |

### Modifikatoren

Zusätzliche Sätze werden angehängt, wenn Sonderbedingungen erfüllt sind:

```js
MODIFIERS = {
  dramatic: {
    schneider: [" Und obendrauf: SCHNEIDER!"],
    schwarz:   [" SCHWARZ! Kein einziger Stich!"],
    laufende:  [" Dazu {laufende} Laufende!"],
    bock:      [" Bockrunde Faktor {bock}!"],
    klopfer:   [" Plus Klopfer!"],
  },
  // ... andere Persönlichkeiten analog
}
```

### Reaktionswahrscheinlichkeit (Schafkopf)

```js
function reactionChance(game) {
  let p = 0.30;  // Basis: einfaches Sauspiel

  if (type === "Solo Tout" || type === "Wenz Tout") p += 0.50;
  else if (type === "Solo" || type === "Wenz")      p += 0.28;
  if (game.schwarz)            p += 0.25;
  if (game.schneider)          p += 0.10;
  if (game.laufende >= 3)      p += 0.12;
  if (game.bock > 1)           p += 0.10;
  if (game.klopfer?.length > 0) p += 0.10;

  return Math.min(p, 0.95);
}
```

**Beispiele:**
- Einfaches Sauspiel: 30%
- Solo mit Schneider + Schwarz: 65%
- Solo Tout mit 3 Laufenden + Bock: 95%

### Hauptfunktion

```js
buildFullCommentary(game, regPlayers, personality)
  → { segments, spokenText }
```

- **Segment 0:** Kommentator-Text (immer vorhanden)
- **Segment 1:** Spieler-Reaktion des Ansagers (mit `reactionChance`)
- **Segment 2:** Gegner-Reaktion (mit `reactionChance × 0.75`)

---

## Wizard-Kommentator

### Template-Szenarien

Statt Spieltypen gibt es drei Szenarien basierend auf der Vorhersage-Genauigkeit:

| Szenario | Bedingung |
|---|---|
| `allCorrect` | Alle Spieler lagen exakt richtig |
| `allWrong` | Kein Spieler lag richtig |
| `mixed` | Manche richtig, manche falsch |

**Template-Platzhalter:**

| Platzhalter | Beschreibung |
|---|---|
| `{roundNum}` | Aktuelle Rundennummer |
| `{topPlayer}` | Spieler mit den meisten Punkten diese Runde |
| `{topScore}` | Sein Punktestand diese Runde |
| `{bottomPlayer}` | Spieler mit den wenigsten Punkten |
| `{correctCount}` | Anzahl Spieler mit korrekter Vorhersage |
| `{totalPlayers}` | Gesamtzahl der Spieler |
| `{bigMissPlayer}` | Spieler mit der größten Abweichung |
| `{bigMissDiff}` | Größte Abweichung (absolut) |

### Reaktionswahrscheinlichkeit (Wizard)

```js
function reactionChance(round, players, totalRounds) {
  let p = 0.35;  // Basis

  if (allCorrect)        p += 0.30;
  if (allWrong)          p += 0.35;
  if (bigMissDiff >= 3)  p += 0.25;
  if (scoreSpread >= 50) p += 0.20;  // max - min Punkte diese Runde
  if (isLastRound)       p += 0.25;

  return Math.min(p, 0.95);
}
```

### Hauptfunktion

```js
buildWizardCommentary(round, regPlayers, personality)
  → { segments, spokenText }
```

- **Segment 0:** Kommentator-Text (immer)
- **Segment 1:** Reaktion des Rundengewinners (topPlayer)
- **Segment 2:** Reaktion des Rundenverlierers (bottomPlayer), leicht seltener

---

## Spieler-Reaktionen

Reaktionen nutzen den `character_type` des registrierten Spielers — unabhängig von der Kommentator-Persönlichkeit. Ein Spieler mit `character_type: "bavarian"` antwortet immer auf Bayerisch, egal welcher Kommentator aktiv ist.

```js
PLAYER_REACTIONS[charType]["won" | "lost"]  → string[]
OPPONENT_REACTIONS[charType]["won" | "lost"] → string[]
```

Reaktionen nennen bewusst **nicht** den eigenen Namen — das klingt natürlicher.

---

## CommentaryOverlay

Die gemeinsame UI-Komponente für beide Spiele. Das `buildFn`-Prop erlaubt die Übergabe unterschiedlicher Build-Funktionen:

```jsx
// Schafkopf (Standard, buildFn weggelassen)
<CommentaryOverlay game={game} ... />

// Wizard
<CommentaryOverlay game={round} buildFn={buildWizardCommentary} ... />
```

**Intern:**
```js
const fn = buildFn ?? buildFullCommentary;
const { segments, spokenText } = useRef(fn(game, regPlayers, personality)).current;
```

`useRef` stellt sicher, dass die Commentary nur einmal beim Mount berechnet wird, nicht bei jedem Re-Render.

### Segment-Rendering

- **Index 0 (Kommentator):** kursiv, größere Schrift, kein Avatar links
- **Index > 0 (Spieler):** Avatar emoji links, normale Schrift

### Automatisches Schließen

Das Overlay schließt sich:
- Nach dem TTS-Ende (`utter.onend = onClose`)
- Bei Klick auf "✕ Schließen"
- Bei Klick auf den Overlay-Hintergrund
- Bei Komponenten-Unmount (Cleanup: `speechSynthesis.cancel()`)

---

## TTS (Web Speech API)

```js
const utter = new SpeechSynthesisUtterance(spokenText);
utter.voice = voices.find(v => v.name === commentatorVoice)
           ?? voices.find(v => v.lang.startsWith("de"))
           ?? null;
utter.pitch = personality.pitch;
utter.rate  = personality.rate;
utter.lang  = "de-DE";
window.speechSynthesis.speak(utter);
```

Alle Segmente werden als **ein einziger Utterance** vorgelesen (verbunden mit ` — `). Das vermeidet Pausen zwischen Segmenten.

**Verfügbarkeit prüfen:**
```js
const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;
```

Wenn TTS nicht verfügbar ist, wird das Overlay nur angezeigt, aber nicht vorgelesen.

---

## Einstellungen (useCommentatorSettings)

Persistiert in `localStorage`:

| Key | Typ | Default |
|---|---|---|
| `sk_commentator_personality` | string | `"dramatic"` |
| `sk_commentator_voice` | string \| null | `null` (System-Default) |
| `sk_commentator_enabled` | boolean | `true` |

**Hook:**
```js
const { personality, voice, enabled, setPersonality, setVoice, setEnabled }
  = useCommentatorSettings();
```

---

## Settings-Panel UI

Sowohl Schafkopf (`SessionView.jsx`) als auch Wizard (`ScoreSheet.jsx`) haben ein identisch aufgebautes Einstellungs-Panel, erreichbar über den 🎙️-Button:

- **Aktivieren/Deaktivieren:** Checkbox
- **Persönlichkeit:** Chip-Buttons für alle 4 Persönlichkeiten
- **Stimme:** Dropdown aus `window.speechSynthesis.getVoices()`

Die Einstellungen sind global (gemeinsam für beide Spiele) — Änderung in Schafkopf wirkt auch in Wizard.
