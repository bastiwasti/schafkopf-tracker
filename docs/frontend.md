# Frontend-Komponenten

Das Frontend besteht aus funktionalen React-Komponenten mit Inline-Styles aus `styles.js`. Kein URL-Router — state-basiertes Routing in `App.jsx`.

---

## App.jsx

**Rolle:** Hauptkomponente und zentraler View-Router.

**State:**
```js
{
  sessions: [],           // Alle aktiven Runden
  registeredPlayers: [],  // Alle registrierten Spieler
  activeSession: null,    // Aktuell angezeigte Runde
  view: "sessions"        // "sessions" | "session" | "players" | "archive"
}
```

**Views:**

| State | Komponente | Beschreibung |
|---|---|---|
| `"sessions"` | `SessionList` | Rundenübersicht, neue Runde erstellen |
| `"session"` | `SessionView` | Schafkopf-Spielansicht |
| `"players"` | `PlayerManager` | Spieler-Registry |
| `"archive"` | `ArchiveView` | Archivierte Runden und Spiele |

Wizard-Sessions öffnen ebenfalls `SessionView`, das intern auf `WizardScoreSheet` delegiert.

---

## SessionList.jsx

**Rolle:** Rundenübersicht + Formular für neue Runden.

**Features:**
- Rundenliste mit Metadaten (Name, Spieltyp, Spieler, Spielanzahl)
- Runde direkt ins Archiv verschieben (📦)
- Neue Runde erstellen:
  - Namen eingeben
  - Spieltyp aus Plugin-Registry wählen (Schafkopf oder Wizard)
  - Spieler aus Registry auswählen (Quick-Add direkt im Formular)
  - Einsatz festlegen (für Schafkopf)

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

## Scoreboard.jsx

**Rolle:** Kontostand-Anzeige (Schafkopf).

- Spieler-Karten: Avatar, Name, Kontostand (±€), Spielanzahl
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
- Bestehende Spieler bearbeiten oder löschen

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
