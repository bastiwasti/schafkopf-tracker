# Schafkopf Tracker

Ein flexibler Spielrunden-Tracker mit Plugin-Architektur für verschiedene Kartenspiele.

## Unterstützte Spiele

- **Schafkopf** - Bayerisches Kartenspiel mit Bockrunden und Klopfern
- **Wizard** - Stich-basiertes Kartenspiel mit Vorhersage-Punkten

## Features

- 📊 Live-Scoreboard mit Punkteständen
- 🎙️ Kommentator mit verschiedenen Persönlichkeiten (dramatisch, Tagesschau, bayerisch, Fan)
- 🎭 Spieler-spezifische Charaktere (Optimist, Pessimist, Stratege, Joker, Eitle, Stoische, Empörte, Anfänger, Veteran, Chiller)
- 📝 Flexible Kommentar-Szenarien basierend auf Spieleregebnissen
- 🎤 Individuelle Stimmen pro Spieler für Text-to-Speech
- 📦 Archiv für beendete Runden
- 🎮 Plugin-System zum einfachen Hinzufügen neuer Spiele

## Projektstruktur

```
src/
├── games/
│   ├── index.js                    # Plugin-Registry
│   ├── shared/
│   │   └── commentary.js           # Geteilte Kommentator-Logik
│   │   └── playerPersonalities.js  # 10 Spieler-Charaktere mit 15 Szenarien
│   ├── schafkopf/
│   │   ├── plugin.js              # Schafkopf-Plugin-Konfiguration
│   │   ├── SchafkopfSession.jsx   # Komplette Schafkopf-UI
│   │   ├── commentary.js          # Schafkopf-spezifische Kommentare
│   │   ├── gameScenarios.js       # 15 Szenarien für Spieler-Reaktionen
│   │   ├── logic.js              # Spiellogik
│   │   ├── GameForm.jsx           # Spiel-Eingabeformular
│   │   └── HistoryCard.jsx        # Spiel-Historie-Karten
│   └── wizard/
│       ├── plugin.js              # Wizard-Plugin-Konfiguration
│       ├── ScoreSheet.jsx         # Komplette Wizard-UI
│       ├── commentary.js          # Wizard-spezifische Kommentare
│       ├── roundScenarios.js      # 15 Szenarien für Spieler-Reaktionen
│       ├── logic.js              # Spiellogik
│       └── RulesBox.jsx           # Regeln
├── components/
│   ├── SessionView.jsx            # Dünne Shell für Plugin-Komponente
│   ├── SessionList.jsx            # Runden-Liste mit Plugin-Integration
│   ├── CommentaryOverlay.jsx      # Kommentar-Overlay mit TTS
│   ├── CommentarySettingsPanel.jsx # Kommentator-Einstellungen
│   ├── BockBar.jsx               # Bockrunden-Anzeige
│   ├── Scoreboard.jsx             # Punktestände
│   └── ... weitere Komponenten
└── hooks/
    └── useCommentatorSettings.js  # Kommentator-Einstellungs-Hook
```

## Plugin-Architektur

Jedes Spiel muss ein Plugin exportieren, das folgende Struktur hat:

```javascript
const gamePlugin = {
  // Pflicht
  id: string,                    // Eindeutige ID (z.B. "schafkopf")
  label: string,                 // Anzeigename (z.B. "Schafkopf")
  description: string,            // Beschreibung
  defaultStake: number,          // Standard-Einsatz
  showStake: boolean,            // Einsatzfeld anzeigen?
  SessionComponent: Component,      // Komplette Spiel-UI-Komponente

  // Optional: Kommentator
  buildCommentary: fn | null,    // (event/round, regPlayers, personality) → { segments, spokenText }

  // Optional: SessionList-Integration
  getSessionMeta: fn,            // (session) → string, z.B. "12 Spiele" oder "3/15 Runden"
  getArchiveConfirm: fn,         // (session) → string | null (null = kein Archivieren möglich)

  // Optional: Runden-Erstellung
  SessionCreationHint: Component | null,  // Hinweis beim Erstellen (z.B. "15 Runden")
};
```

## Neues Spiel hinzufügen

1. **Plugin-Verzeichnis erstellen:**
   ```bash
   mkdir -p src/games/newgame
   ```

2. **Plugin konfigurieren (`src/games/newgame/plugin.js`):**
   ```javascript
   const newgamePlugin = {
     id: "newgame",
     label: "New Game",
     description: "Beschreibung deines Spiels",
     defaultStake: 1.0,
     showStake: true,
     SessionComponent: Session,
     // ... optionale Methoden
   };
   export default newgamePlugin;
   ```

3. **Session-Komponente erstellen (`src/games/newgame/Session.jsx`):**
   ```javascript
   export default function Session({ session, registeredPlayers, onBack, onSessionUpdated }) {
     // Deine Spiel-UI
     return <div>...</div>;
   }
   ```

4. **Plugin registrieren (`src/games/index.js`):**
   ```javascript
   import newgamePlugin from './newgame/plugin.js';
   export const GAME_PLUGINS = { schafkopf, wizard, newgame: newgamePlugin };
   ```

5. **Fertig!** Das Spiel erscheint automatisch in SessionList und SessionView.

## Spieler-Charaktere

10 verschiedene Charaktere mit je 15 Szenarien:

1. **Der Optimist** 🌟 - Immer positiv, sieht das Gute
2. **Der Pessimist** 🌧️ - Erwartet immer das Schlimmste
3. **Der Strateg** 🧠 - Analysiert, rational, kalkuliert
4. **Der Joker** 🤪 - Macht Witze, lockert auf
5. **Der Eitle** 🎩 - Nimmt alles persönlich, liebt Lob
6. **Der Stoische** 🪨 - Zeigt kaum Emotionen, ruhig
7. **Die Empörte** 😤 - Wird leicht wütend, findet alles unfair
8. **Der Anfänger** 🐣 - Unsicher, lernt noch, fragt oft
9. **Der Veteran** 🏆 - Hat alles schon gesehen, weise
10. **Der Chiller** 😎 - Geht locker, entspannt, kühl

### Schafkopf-Szenarien (15)

- routine_win / routine_loss
- close_win / close_loss
- dramatic_win / dramatic_loss
- bock_good_luck / bock_bad_luck
- high_solo_win / against_solo_win
- klopfer_luck / klopfer_bad_luck
- streak_end_win
- leader_gain / leader_loss

### Wizard-Szenarien (15)

- all_correct / all_wrong
- single_winner / single_loser
- close_game_decision / game_decided
- dramatic_zero / dramatic_max
- comeback_likely / comeback_unlikely
- all_zero / all_max
- tie_situation
- score_overtake / score_collapse

## Entwicklung

### Installieren

```bash
npm install
```

### Server starten

```bash
npm run dev
```

Dies startet gleichzeitig den Vite Dev Server (Port 5173) und den Express Backend Server.

### Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Datenbank

Das Projekt verwendet SQLite mit better-sqlite3. Die Datenbankdatei ist `data/schafkopf.db`.

## API-Endpunkte

### Sessions
- `GET /api/sessions` - Alle aktiven Runden
- `POST /api/sessions` - Neue Runde erstellen
- `GET /api/sessions/:id` - Runde abrufen
- `PATCH /api/sessions/:id` - Runde aktualisieren (z.B. archivieren)
- `DELETE /api/sessions/:id` - Runde löschen

### Spiele
- `GET /api/sessions/:id/games` - Alle Spiele einer Runde
- `POST /api/sessions/:id/games` - Neues Spiel erstellen
- `PATCH /api/sessions/:id/games/:gameId` - Spiel bearbeiten
- `DELETE /api/sessions/:id/games/last` - Letztes Spiel löschen
- `PATCH /api/sessions/:id/games/:gameId` - Spiel archivieren

### Wizard-Runden
- `GET /api/sessions/:id/wizard-rounds` - Alle Wizard-Runden
- `POST /api/sessions/:id/wizard-rounds` - Neue Wizard-Runde erstellen
- `PATCH /api/sessions/:id/wizard-rounds/:roundId` - Wizard-Runde bearbeiten
- `DELETE /api/sessions/:id/wizard-rounds/last` - Letzte Wizard-Runde löschen

### Spieler
- `GET /api/players` - Alle registrierten Spieler
- `POST /api/players` - Neuen Spieler erstellen
- `PATCH /api/players/:id` - Spieler aktualisieren
- `DELETE /api/players/:id` - Spieler löschen

## Technologie-Stack

- **Frontend:** React 19 + Vite 8
- **Backend:** Express 5
- **Datenbank:** SQLite (better-sqlite3)
- **Styling:** Inline-Styles (kein CSS-Framework)
- **Sprache:** JavaScript (ES Modules)

## Lizenz

MIT
