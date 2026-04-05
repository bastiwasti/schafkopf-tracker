# Frontend-Komponenten

Das Frontend besteht aus funktionalen React-Komponenten mit Inline-Styles aus `styles.js`. Kein URL-Router — state-basiertes Routing in `App.jsx`.

---

## App.jsx

**Rolle:** Hauptkomponente und zentraler View-Router.

**State:**
```js
{
  sessions: [],           // Alle aktiven Runden
  registeredPlayers: [],  // Alle registrierten Spieler (mit voice: p.voice_name gemapped)
  activeSession: null,    // Aktuell angezeigte Runde
  view: "sessions"        // "sessions" | "session" | "players" | "archive"
}
```

Beim Laden der Spieler wird `voice_name` auf `voice` gemapped, damit alle Komponenten einheitlich `p.voice` lesen können:
```js
fetch("/api/players")
  .then(players => setRegisteredPlayers(players.map(p => ({ ...p, voice: p.voice_name }))))
```

**Views:**

| State | Komponente | Beschreibung |
|---|---|---|
| `"sessions"` | `SessionList` | Rundenübersicht, neue Runde erstellen |
| `"session"` | `SessionView` | Schafkopf-Spielansicht |
| `"players"` | `PlayerManager` | Spieler-Registry |
| `"archive"` | `ArchiveView` | Archivierte Runden und Spiele |

Wizard-Sessions öffnen ebenfalls `SessionView`, das intern auf `WizardScoreSheet` delegiert. Watten-Sessions öffnen `SessionView`, das intern auf `WattenSession` delegiert.

---

## SessionList.jsx

**Rolle:** Rundenübersicht + Formular für neue Runden.

**Features:**
- Rundenliste mit Metadaten (Name, Spieltyp, Spieler, Spielanzahl)
- Runde direkt ins Archiv verschieben (📦)
- Neue Runde erstellen:
  - Namen eingeben
  - Spieltyp aus Plugin-Registry wählen (Schafkopf, Watten, Doppelkopf, Skat, Wizard — in dieser Reihenfolge)
  - Spieler aus Registry auswählen (Quick-Add direkt im Formular)
  - `playerHint` des Plugins wird als Hinweistext unter dem Spieler-Selector angezeigt
  - Einsatz festlegen (wenn `plugin.showStake === true`)
  - Bei Watten: Team-Konfiguration (je 2 Spieler pro Team) + Zielwert (13/15)
  - Bei Doppelkopf: Einsatz + Solo-Wert (Default 3 €, gespeichert in `doppelkopf_options`)

**API-Calls:** `GET /api/sessions`, `POST /api/sessions`, `PATCH /api/sessions/:id`

---

## SessionView.jsx

**Rolle:** Spielansicht für eine aktive Session. Unterscheidet intern zwischen Schafkopf und Wizard.

**Schafkopf-Modus** (`game_type !== "wizard"`):
- `BockBar` — Bock-Multiplikator
- `Scoreboard` — Kontostände
- Plugin-`FormComponent`, -`HistoryCardComponent`, -`RulesComponent`
- Kommentator-Overlay + 🎙️-Settings-Button

**Wizard-Modus** (`game_type === "wizard"`):
- Rendert direkt `<WizardScoreSheet>` (das komplette Wizard-UI)
- Keine eigene Scoreboard/Form-Logik in SessionView

**Watten-Modus** (`game_type === "watten"`):
- Rendert direkt `<WattenSession>` (das komplette Watten-UI)
- Keine eigene Scoreboard/Form-Logik in SessionView

**Gemeinsam:** ← Runden-Button, Session-Name, Kommentator-Settings (Schafkopf-only)

**State (Schafkopf):**
```js
{
  showForm: false,
  showRules: false,
  form: null,
  editingGame: null,
  pendingCommentary: null,
  showCommentatorSettings: false,
}
```

**API-Calls (Schafkopf):**
- `PATCH /api/sessions/:id` — Bock ändern
- `POST /api/sessions/:id/games` — Spiel eintragen
- `PATCH /api/sessions/:id/games/:gameId` — bearbeiten/archivieren
- `DELETE /api/sessions/:id/games/last` — Undo

---

## WizardScoreSheet.jsx (`src/games/wizard/ScoreSheet.jsx`)

**Rolle:** Vollständige Wizard-Spielansicht — Scoreboard, Score-Tabelle, Eingabe-Workflow, Kommentator.

### Scoreboard

Zeigt alle Spieler mit Avatar, Name und Gesamtpunkten (Summe aller `scores`-Werte aus `history`). Führender Spieler bekommt 👑.

### Score-Tabelle

Kompaktes Grid-Layout: `28px (R) + N × 1fr (Spieler) + 76px (Aktionen)`.

- **Gespeicherte Runden:** `Vorhersage/Stiche` (z.B. `2/1`) + farbiger Punktestand
- **Prediction-Phase:** Dropdown für Vorhersage (aktiv), Dropdown für Stiche (deaktiviert)
- **Tricks-Phase:** Dropdown für Vorhersage (deaktiviert), Dropdown für Stiche (aktiv)
- **Noch nicht gestartet:** `–`

### Phasen-Workflow

```js
roundPhases: { [roundNum]: 'prediction' | 'tricks' | 'completed' }
roundsData:  { [roundNum]: { predictions, tricks } }
```

Nur die nächste ausstehende Runde (`roundNum === currentRound`) zeigt den "Starten"-Button.

### State
```js
{
  showRules: false,
  showCommentatorSettings: false,
  pendingCommentary: null,
  editingRound: null,
  predictions: {},      // Legacy, wird durch roundsData ersetzt
  tricks: {},           // Legacy
  roundsData: {},       // { [roundNum]: { predictions, tricks } }
  roundPhases: {},      // { [roundNum]: phase }
}
```

### Synchronisation beim Mount

```js
useEffect(() => {
  fetch(`/api/sessions/${session.id}/wizard-rounds`)
    .then(r => r.json())
    .then(rounds => {
      if (rounds.length > 0) onSessionUpdated({ ...session, history: rounds });
    });
}, [session.id]);
```

Notwendig, da `GET /api/sessions/:id` keine Wizard-Runden zurückgibt.

### API-Calls
- `GET /api/sessions/:id/wizard-rounds` — beim Mount
- `POST /api/sessions/:id/wizard-rounds` — neue Runde
- `PATCH /api/sessions/:id/wizard-rounds/:id` — Runde bearbeiten
- `DELETE /api/sessions/:id/wizard-rounds/last` — Undo

---

## WattenSession.jsx (`src/games/watten/WattenSession.jsx`)

**Rolle:** Vollständige Watten-Spielansicht — Scoreboard, Runden-Historie, Spiel-Verwaltung, Kommentator.

**Sub-Komponenten:**
- `WattenScoreboard` — Fortschrittsbalken beider Teams mit Bommerl-Counter
- `WattenRoundForm` — Formular für neue Runde (Gewinner-Team, Punkte, Maschine, Gegangen, Stiche)
- `WattenSessionHistory` — Accordion-Liste aller abgeschlossenen Spiele

**State:**
```js
{
  showForm: false,
  rounds: { all: [], byGame: {} },
  games: { active: null, completed: [], all: [] },
  form: { winning_team, points, is_machine, is_gegangen, tricks_team1, tricks_team2 },
  expandedGameId: null,
  pendingCommentary: null,
  showCommentatorSettings: false,
}
```

**Gespannt-Logik:**
```js
const isTeam1Gespannt = team1_score >= (targetScore || 15) - 2;
const isTeam2Gespannt = team2_score >= (targetScore || 15) - 2;
const isGespannt = isTeam1Gespannt || isTeam2Gespannt;
```

**Spiel-Verwaltung:**
- "＋ Neues Spiel" — öffnet Runden-Formular (oder startet neues Spiel wenn aktuelles beendet)
- "↩ Rückgängig" — `DELETE /api/sessions/:id/watten/rounds/last`
- Automatischer Spiel-Abschluss wenn Server zurückmeldet dass `targetScore` erreicht

**Commentary:** Wird direkt nach `POST /rounds` ausgelöst, VOR dem Reload. Scores werden client-seitig vorberechnet damit Commentary sofort mit korrekten Werten läuft.

**API-Calls:**
- `GET /api/sessions/:id/watten/rounds`
- `GET /api/sessions/:id/watten/games`
- `POST /api/sessions/:id/watten/rounds`
- `DELETE /api/sessions/:id/watten/rounds/last`
- `POST /api/sessions/:id/watten/games`

---

## WattenRoundForm.jsx (`src/games/watten/WattenRoundForm.jsx`)

**Rolle:** Formular zum Eintragen einer neuen Watten-Runde.

**Features:**
- Gewinner-Team Auswahl (Chip-Buttons mit Spielernamen)
- Punkte-Auswahl (2–5), automatisch gesperrt und auf 3 gesetzt wenn `isTeamGespannt`
- Gespannt-Banner (gelb) wenn ein Team gespannt ist
- Maschine-Checkbox (immer klickbar)
- Gegangen-Checkbox (gesperrt wenn gespannt)
- Stiche-Eingabe (optional, beide Felder verknüpft: Team1 + Team2 = 5)

**`useEffect` für Gespannt-Auto-Punkte:**
```js
useEffect(() => {
  if (isTeamGespannt && form.points !== 3) {
    onFormChange({ ...form, points: 3 });
  }
}, [isTeamGespannt, form.points]);
```

---

## WattenScoreboard.jsx (`src/games/watten/WattenScoreboard.jsx`)

**Rolle:** Fortschrittsanzeige für beide Teams.

**Features:**
- Team-Name + Bommerl-Counter (🔴N)
- Punktestand `X / targetScore`
- Fortschrittsbalken (wird gold wenn gespannt, grün wenn gewonnen)
- `isGespannt`-Markierung (🧱) am Team-Namen

---

## WattenSessionHistory.jsx (`src/games/watten/WattenSessionHistory.jsx`)

**Rolle:** Accordion-Liste aller abgeschlossenen Spiele der Session.

**Features:**
- Pro Spiel: Gewinner-Team, Endstand, Bommerl-Markierung
- Ausklappbar: Runden-Details pro Spiel
- Bommerl-Gesamtübersicht am Ende

---

## CommentaryOverlay.jsx

**Rolle:** Overlay nach einem Spiel/einer Runde mit Kommentar-Text und TTS.

**Props:**
```js
{
  game,                    // Spiel- oder Runden-Objekt
  registeredPlayers,       // für Avatar/Charakter-Lookup
  commentatorPersonality,  // "dramatic" | "tagesschau" | "bavarian" | "fan"
  commentatorVoice,        // Stimmenname oder null
  onClose,                 // Callback
  buildFn,                 // optional: buildWizardCommentary oder default buildFullCommentary
}
```

**Rendering:**
- Kommentator-Header mit Icon + Label
- Segment 0 (Kommentator): kursiv, etwas größer
- Segment 1+ (Spieler): Avatar links, normaler Text
- "✕ Schließen"-Button

**TTS:** Alle Segmente als ein einziger Utterance via `speechSynthesis.speak()`.

---

## PlayerTooltip.jsx (`src/components/PlayerTooltip.jsx`)

**Rolle:** Tooltip-Wrapper um einen Spieler-Avatar, erscheint bei Hover.

**Props:** `{ player, registeredPlayers }`

**Verhalten:**
- Wenn Spieler nicht in `registeredPlayers` gefunden: nur Avatar anzeigen (kein Tooltip)
- Bei Hover: `position:fixed`-Tooltip unterhalb des Avatars (verhindert Clipping durch overflow-hidden)
- Zeigt: `PLAYER_PERSONALITIES[character_type].label` + Stimme (`p.voice`)

**Verwendet in:** `Scoreboard.jsx` (Schafkopf) und `wizard/ScoreSheet.jsx` (beide Scoreboards haben jetzt Avatar-Hover-Tooltips)

> Liest `PLAYER_PERSONALITIES` für den Label — **nicht** die Kommentator-`PERSONALITIES`-Map.

---

## Scoreboard.jsx

**Rolle:** Kontostand-Anzeige (Schafkopf/Doppelkopf).

- Spieler-Karten: Avatar (mit `PlayerTooltip`), Name, Kontostand (±€), Spielanzahl
- Grün = positiv, Rot = negativ
- 👑 für führenden Spieler (wenn Kontostand > 0)

---

## BockBar.jsx

**Rolle:** Bock-Multiplikator anzeigen und ändern (Schafkopf).

- Visualisierung der Bock-Stufe
- Buttons +/−, sofortiger API-Aufruf

---

## PlayerManager.jsx

**Rolle:** Spieler-Registry verwalten.

**Features:**
- Spielerliste mit Avatar, Name, Charakter-Typ, Stimme
- Neuen Spieler anlegen: Name, Avatar-Picker, Charakter-Chips, Stimmen-Dropdown
- **"🎙️ Charakter & Stimme testen"**-Button: öffnet `PlayerTestOverlay` mit aktuellem Formular-Zustand (vor dem Speichern testbar)
- Bestehende Spieler bearbeiten oder löschen

**PlayerTestOverlay** (inline, nicht `CommentaryOverlay`):
- Zeigt zufälligen Text aus dem Reaktions-Pool des gewählten Charakters
- **"🔄 Nochmal"**: wählt anderen Text, spricht ihn mit gewählter Stimme vor
- Pool: alle Texte aus `PLAYER_REACTIONS[characterType]` über alle Szenarien (dedupliziert)

**API-Calls:** `GET /api/players`, `POST /api/players`, `PATCH /api/players/:id`, `DELETE /api/players/:id`

---

## ArchiveView.jsx

**Rolle:** Archivierte Schafkopf-Runden und Einzelspiele verwalten.

- Archivierte Runden: Wiederherstellen (↩) oder endgültig löschen (🗑)
- Archivierte Einzelspiele: nach Session gruppiert, einzeln wiederherstellen oder löschen

**API-Calls:**
- `GET /api/sessions/archived`
- `GET /api/sessions/archived/games`
- `PATCH /api/sessions/:id` — Wiederherstellen
- `DELETE /api/sessions/:id` — Endgültig löschen

---

## AvatarPicker.jsx

Emoji-Grid mit 40+ Emojis zur Avatar-Auswahl.

---

## Hooks

### useCommentatorSettings()

localStorage-Persistenz der Kommentator-Einstellungen. Wird in `SessionView.jsx` (Schafkopf) und `ScoreSheet.jsx` (Wizard) verwendet — gleiche Keys, geteilte Einstellungen.

```js
const { personality, voice, enabled, setPersonality, setVoice, setEnabled }
  = useCommentatorSettings();
```

**localStorage-Keys:** `sk_commentator_personality`, `sk_commentator_voice`, `sk_commentator_enabled`

---

## Styling (styles.js)

Zentrale Inline-Style-Definitionen. Wichtige Kategorien:

| Kategorie | Keys (Beispiele) |
|---|---|
| Layout | `container`, `header`, `actions` |
| Scoreboard | `scoreboard`, `playerCard`, `leaderCard`, `crownBadge` |
| Buttons | `btnPrimary`, `btnSecondary`, `btnUndo`, `btnGear` |
| Formulare | `formCard`, `formTitle`, `label`, `input` |
| History | `historySection`, `historyTitle`, `historyCard` |
| Commentary | `commentaryOverlay`, `commentaryCard`, `commentaryBubble` |
| Kommentator-Settings | `commentatorSettingsPanel`, `personalityChip`, `personalityChipActive`, `voiceSelect` |

> **Hinweis:** `btnPrimary` und `btnSecondary` haben `minWidth: 130`. Für kleine Kontexte (z.B. Score-Tabellen-Buttons) muss `minWidth: 0` überschrieben werden.

**Farbpalette:**

| Farbe | Wert | Verwendung |
|---|---|---|
| Creme | `#fdf6e3` | Hintergrund |
| Dunkelbraun | `#2c1810` | Text, primäre Buttons |
| Gold | `#8b6914` | Akzente, Überschriften, Rahmen |
| Grün | `#2d6a4f` | Gewonnen, Bestätigung |
| Rot | `#9d0208` | Verloren, Löschen, Undo |
| Blau | `#1976d2` | Wizard-Aktionen |
