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

## Watten-Kommentator

### Dateien

- `src/games/watten/commentary.js` — Templates + `buildWattenCommentary`
- `src/games/watten/roundScenarios.js` — Szenario-Erkennung + Template-Variablen

### Szenarien (17, Prioritätsreihenfolge)

| # | Szenario | Bedingung |
|---|---|---|
| 1 | `game_won_zu_null` | Spiel gewonnen, Verlierer hat 0 Punkte |
| 2 | `game_won_comeback` | Spiel gewonnen, max. Rückstand ≥ 6 Punkte |
| 3 | `game_won_gespannt_duel` | Spiel gewonnen, Verlierer war auch gespannt |
| 4 | `game_won_dominant` | Spiel gewonnen (Standard) |
| 5 | `bommerl_first` | Erstes Spiel der Session beendet |
| 6 | `bommerl_lead` | Ein Team führt ≥2 Bommerl-Vorsprung |
| 7 | `bommerl_even` | Bommerl-Stand ausgeglichen ≥1-1 |
| 8 | `maschine` | Runde mit Maschine (Spiel läuft noch) |
| 9 | `gegangen` | Runde mit Gegangen |
| 10 | `spannt_geht` | `is_spannt_played === true` |
| 11 | `gespannt_round` | Runde im Gespannt-Modus |
| 12 | `round_5_points` | 5 Punkte in einer Runde |
| 13 | `stiche_dominant` | Stiche eingetragen, ein Team ≥ 4 Stiche |
| 14 | `stiche_close` | Stiche eingetragen, beide Teams ≥ 1 Stich |
| 15 | `close_game` | Spielstand-Differenz ≤ 2, max. Score ≥ 4 |
| 16 | `dominant_lead` | Spielstand-Differenz ≥ 6 |
| 17 | `mixed` | Fallback |

`game_won_*`-Szenarien prüfen immer zuerst — sie haben die höchste Priorität.

### Template-Variablen

```js
{
  winnerTeam,    // "Sigi + Hannes"
  loserTeam,     // "Max + Josef"
  points,        // 3
  team1Name,     // "Sigi + Hannes"
  team2Name,     // "Max + Josef"
  team1Score,    // aktuell (nach Runde)
  team2Score,
  targetScore,
  team1Bommel,   // nach dieser Runde
  team2Bommel,
  totalBommel,   // team1Bommel + team2Bommel
  maxDeficit,    // für Comeback-Berechnung
  winnerTricks,  // falls Stiche eingetragen
  loserTricks,
  bommelLeader,  // Team mit mehr Bommerl
  bommelTrailer,
  bommelDiff,
}
```

### Comeback-Erkennung

```js
// roundScenarios.js
function calcMaxDeficit(rounds, winnerTeam) {
  // Alle Runden des aktiven Spiels durchlaufen
  // → max. Rückstand des späteren Gewinnerteams berechnen
}
```

Aktiviert `game_won_comeback` wenn `maxDeficit >= 6`.

### Hauptfunktion

```js
buildWattenCommentary(data, regPlayers, personality)
  → { segments, spokenText }
```

`data` enthält: `round`, `team1_score`, `team2_score`, `team1_score_before`, `team2_score_before`, `targetScore`, `team1_players`, `team2_players`, `team1Bommel`, `team2Bommel`, `gameJustCompleted`, `activeGameRounds`

### Reaktionswahrscheinlichkeit (Watten)

```js
function reactionChance(scenario) {
  // 0.85 für game_won_zu_null, game_won_comeback, maschine
  // 0.65 für game_won_gespannt_duel, game_won_dominant, round_5_points, bommerl_*
  // 0.40 für alle anderen
}
```

### Spieler-Reaktionen (Szenario-Mapping)

Watten-Szenarien werden auf bestehende `PLAYER_REACTIONS`-Schlüssel gemappt — keine Änderung an `playerPersonalities.js` nötig:

| Szenario | Sieger-Reaktion | Verlierer-Reaktion |
|---|---|---|
| `maschine` | `single_hero` | `single_disaster` |
| `gegangen` | `routine_win` | `routine_loss` |
| `game_won_zu_null` | `dramatic_win` | `dramatic_loss` |
| `game_won_comeback` | `comeback` | `single_disaster` |
| `game_won_gespannt_duel` | `close_win` | `close_loss` |
| `game_won_dominant` | `routine_win` | `routine_loss` |
| `bommerl_*` | `leader_extends` | `comeback` |
| `gespannt_round` | `close_game` | `close_game` |
| `round_5_points` | `single_hero` | `single_disaster` |
| `dominant_lead` | `leader_extends` | `comeback` |
| `mixed` | `mixed` | — |

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
