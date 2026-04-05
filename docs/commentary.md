# Kommentator-System

## Übersicht

Das Kommentator-System generiert nach jedem Schafkopf-Spiel, jeder Wizard-Runde, jeder Watten-Runde oder jedem Doppelkopf-Spiel automatisch textbasierte Kommentare und liest diese per Web Speech API vor. Es gibt keine externe KI-API — alles basiert auf lokalen Templates.

**Dateien:**
- `src/games/shared/commentary.js` — `PERSONALITIES`, `pickRandom`, `fill` (geteilt von allen Spielen)
- `src/games/shared/playerPersonalities.js` — `PLAYER_PERSONALITIES` (Charakter-Typen + Labels) + `PLAYER_REACTIONS` (Reaktionstexte nach Szenario-Key)
- `src/games/schafkopf/commentary.js` — Schafkopf-Templates + `buildFullCommentary`
- `src/games/wizard/commentary.js` — Wizard-Templates + `buildWizardCommentary`
- `src/games/watten/commentary.js` — Watten-Templates + `buildWattenCommentary`
- `src/games/doppelkopf/commentary.js` — Doppelkopf-Templates + `buildFullCommentary`
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

Reaktionen nutzen den `character_type` des registrierten Spielers — unabhängig von der Kommentator-Persönlichkeit. Ein Spieler mit `character_type: "stoische"` antwortet immer stoisch, egal welcher Kommentator aktiv ist.

Die 10 Charakter-Typen aus `PLAYER_PERSONALITIES`:

| Key | Label |
|---|---|
| `optimist` | Der Optimist |
| `pessimist` | Der Pessimist |
| `stratege` | Der Strateg |
| `joker` | Der Joker |
| `eitle` | Der Eitle |
| `stoische` | Der Stoische |
| `empoerte` | Die Empörte |
| `anfaenger` | Der Anfänger |
| `veteran` | Der Veteran |
| `chiller` | Der Chiller |

Reaktionen sind nach **Szenario-Keys** organisiert (nicht nach `won`/`lost`):

```js
PLAYER_REACTIONS[charType][scenarioKey] → string[]
// Beispiele für scenarioKey:
// "routine_win", "routine_loss", "dramatic_win", "dramatic_loss",
// "high_solo_win", "comeback", "close_win", "close_loss",
// "single_hero", "single_disaster", "leader_extends", ...
```

> **Achtung:** `PLAYER_REACTIONS` verwendet Charakter-Typen (`optimist`, `pessimist`, ...) als Keys — **nicht** die Kommentator-Persönlichkeiten (`dramatic`, `tagesschau`, ...). Diese zwei Key-Sets dürfen niemals verwechselt werden.

Reaktionen nennen bewusst **nicht** den eigenen Namen — das klingt natürlicher.

---

## CommentaryOverlay

Die gemeinsame UI-Komponente für alle Spiele. Das `buildFn`-Prop erlaubt die Übergabe unterschiedlicher Build-Funktionen:

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

**Voice-Lookup:** `registeredPlayers` enthält `p.voice` (nicht `p.voice_name`). Die Umwandlung erfolgt in `App.jsx` beim Laden der Spieler:
```js
players.map((p) => ({ ...p, voice: p.voice_name }))
```
`CommentaryOverlay`, `PlayerTooltip` und `PlayerBadge` lesen alle `p.voice` — dies ist konsistent, solange `App.jsx` korrekt mapped.

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

## Doppelkopf-Kommentator

### Dateien

- `src/games/doppelkopf/commentary.js` — Templates + `buildFullCommentary`

### Template-Struktur

Templates sind nach Persönlichkeit × Spieltyp × Ergebnis organisiert. Für jeden der 4 Spieltypen (`Normal`/`Solo`) × 2 Ergebnisse (`won`/`lost`) gibt es **5 Textvarianten** pro Persönlichkeit:

```js
COMMENTATOR_TEMPLATES = {
  dramatic: {
    Normal: { won: [...×5], lost: [...×5] },
    Solo:   { won: [...×5], lost: [...×5] },
  },
  tagesschau: { ... },
  bavarian: { ... },
  fan: { ... },
}
```

**Template-Platzhalter:**

| Platzhalter | Beschreibung |
|---|---|
| `{player}` | Ansagender Spieler / Solo-Spieler |
| `{partner}` | Partner (bei Normal) |

### Zusatztexte

```js
buildKontraNote(game, personality)  // angehängt wenn kontra oder ansage gesetzt
buildSonderNote(game, personality)  // angehängt wenn Sonderpunkte vorhanden
```

`buildKontraNote` nennt die angesagten Optionen (z.B. "Kontra + Keine 60"). `buildSonderNote` listet Fuchs, Doppelkopf und Karlchen beider Seiten auf.

### Reaktionswahrscheinlichkeit (Doppelkopf)

```js
const reactionChance = game.type === "Solo" ? 0.65 : game.kontra ? 0.40 : 0.20;
```

### Szenario-Mapping (Spieler-Reaktionen)

| Spielkontext | Szenario-Key |
|---|---|
| Solo gewonnen | `high_solo_win` |
| Solo verloren | `dramatic_loss` |
| Mit Kontra/Ansage | `dramatic_win` / `dramatic_loss` |
| Normal | `routine_win` / `routine_loss` |

---

## Charakter & Stimme testen

### PlayerTestOverlay

Im `PlayerManager.jsx` gibt es einen **"🎙️ Charakter & Stimme testen"**-Button im Anlege-/Bearbeiten-Formular.

- Öffnet `PlayerTestOverlay` (inline-Komponente, **kein** `CommentaryOverlay`)
- Nutzt den aktuellen Formular-Zustand (Avatar, Charakter, Stimme) — **vor dem Speichern** schon testbar
- Pool: alle Reaktionstexte des gewählten Charakters aus allen Szenarien (dedupliziert)
- **"🔄 Nochmal"**-Button: wählt anderen Text aus dem Pool, spricht ihn vor
- TTS: spricht mit der gewählten Stimme (`voice_name` aus dem Formular), kein Kommentator-Pitch/Rate

```js
// Textpool-Aufbau in PlayerManager.jsx
function buildAllTexts(characterType) {
  const pool = PLAYER_REACTIONS[characterType] ?? PLAYER_REACTIONS.optimist;
  return [...new Set(
    Object.values(pool).filter(Array.isArray).flat()
      .map((t) => (typeof t === "function" ? t() : t))
  )];
}
```

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
