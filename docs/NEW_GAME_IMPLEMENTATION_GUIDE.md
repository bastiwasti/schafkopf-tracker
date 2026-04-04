# New Game Implementation Guide

Dieses Dokument bietet eine umfassende Checkliste und Anleitung für die Implementierung neuer Spiele im Schafkopf Tracker.

## 📋 Vorbereitungs-Checkliste

Bevor du mit der Implementation beginnst, sammle folgende Informationen:

### Grundlegende Spielinformationen

- [ ] **Spielname** (deutscher und englischer Name)
- [ ] **Beschreibung** (kurze Zusammenfassung, 1-2 Sätze)
- [ ] **Spieleranzahl** (min/max, empfohlen)
- [ ] **Spieltyp** (Stich-basiert, Punkte-basiert, etc.)
- [ ] **Spieldauer** (durchschnittliche Spielzeit)
- [ ] **Siedauer** (wie viele Runden/Spiele typischerweise)

### Spielmechanik

- [ ] **Punkteberechnung** (Algorithmus für Gewinner/Verlierer)
  - [ ] Wie werden Punkte berechnet?
  - [ ] Gibt es Negative-Punkte?
  - [ ] Sonderregeln (Boni, Mali, etc.)

- [ ] **Siegbedingungen** (wann gewinnt jemand?)
  - [ ] Gibt es einen absoluten Sieger?
  - [ ] Gibt es mehrere Runden mit Gesamtsieg?

- [ ] **Spielstatus** (aktiv, beendet, pausiert)
  - [ ] Kann eine Session zwischendurch beendet werden?
  - [ ] Kann man nach einer Session weitermachen?

- [ ] **Sonderfunktionen** (wenn vorhanden)
  - [ ] Bockrunden (wie Schafkopf)?
  - [ ] Klopfer (wie Schafkopf)?
  - [ ] Archivierung (individuelle Spiele)?

### Datenbank-Schema

- [ ] **Session-Tabelle** (welche Felder werden benötigt?)
  - [ ] `game_type`: string (z.B. "newgame")
  - [ ] `name`: string (Session-Name)
  - [ ] `players`: Array<string> (Spielernamen)
  - [ ] `game_count`: number (Anzahl Spiele/Runden)
  - [ ] `status`: string (z.B. "active", "completed", "paused")
  - [ ] Felder für Spiel-spezifische Daten

- [ ] **Game/Round-Tabelle** (welche Felder werden benötigt?)
  - [ ] `session_id`: string (Referenz auf Session)
  - [ ] `seq`: number (Reihenfolge)
  - [ ] Felder für Spieler-Eingaben
  - [ ] Felder für Punkteberechnung
  - [ ] `archived_at`: string (für Archivierung)
  - ] Felder für Spiel-spezifische Daten

- [ ] **Indizes** (für Performance)
  - [ ] `session_id` Index
  - [ ] Andere benötigte Indizes?

### API-Endpunkte

- [ ] **Session-Management**
  - [ ] `POST /api/sessions` - Session erstellen
  - [ ] `GET /api/sessions/:id` - Session abrufen
  - [ ] `PATCH /api/sessions/:id` - Session aktualisieren (Status ändern)
  - [ ] `DELETE /api/sessions/:id` - Session löschen

- [ ] **Game/Round-Management**
  - [ ] `POST /api/sessions/:id/games` (oder `.../rounds`)
  - [ ] `GET /api/sessions/:id/games` (oder `.../rounds`)
  - [ ] `PATCH /api/sessions/:id/games/:gameId` - Spiel/Runde bearbeiten
  - [ ] `DELETE /api/sessions/:id/games/last` (oder `.../rounds/last`)

### UI-Komponenten

- [ ] **SessionView** - Hauptkomponente für das Spiel
  - [ ] Scoreboard/Punktestände anzeigen
  - [ ] Spiel/Runde eingeben
  - [ ] Historie anzeigen
  - [ ] Regeln anzeigen (optional)
  - [ ] Aktionen (Neues Spiel, Rückgängig, Archivieren)

- [ ] **SessionList-Integration**
  - [ ] SessionCreationHint (Hinweis beim Erstellen)
  - [ ] getSessionMeta (Anzeige in Session-Liste)
  - [ ] getArchiveConfirm (Archivierungs-Logik)

- [ ] **Plugin-Konfiguration**
  - [ ] `id`: string
  - [ ] `label`: string
  - [ ] `description`: string
  - [ ] `defaultStake`: number
  - [ ] `showStake`: boolean
  - [ ] `SessionComponent`: Component

### Kommentator-Integration

- [ ] **Szenarien definieren** (optional)
  - [ ] Welche Szenarien sind sinnvoll?
  - [ ] Welche Charaktere passen gut?
  - [ ] `analyzeScenario` Funktion implementieren

- [ ] **Kommentator-Templates** (optional)
  - [ ] Welche Persönlichkeiten passen zum Spiel?
  - [ ] Templates für die wichtigsten Ereignisse
  - [ ] `buildCommentary` Funktion implementieren

## 📦 Implementierungs-Schritte

### Schritt 1: Plugin-Struktur anlegen

```bash
mkdir -p src/games/newgame
```

**Dateien erstellen:**

1. **`src/games/newgame/plugin.js`**
   ```javascript
   const newgamePlugin = {
     id: "newgame",
     label: "New Game",
     description: "Kurze Beschreibung deines Spiels",
     defaultStake: 1.0,
     showStake: true,
     SessionComponent: Session,
     // Optional:
     buildCommentary: buildNewGameCommentary,
     getSessionMeta: (s) => `${s.game_count} Spiele`,
     getArchiveConfirm: (s) => "Session ins Archiv verschieben?",
     SessionCreationHint: NewGameCreationHint,
   };
   export default newgamePlugin;
   ```

2. **`src/games/newgame/logic.js`** (Spiellogik)
   ```javascript
   export function calculateScore(inputs) {
     // Berechne Punkte basierend auf Spielereingaben
     return { scores, winner };
   }
   
   export function validateGame(inputs) {
     // Validiere Eingaben
     return { valid, errors };
   }
   ```

3. **`src/games/newgame/Session.jsx`** (Hauptkomponente)
   ```javascript
   export default function Session({ session, registeredPlayers, onBack, onSessionUpdated }) {
     // Deine Spiel-UI
     return (
       <div>
         {/* Scoreboard, Form, History, etc. */}
       </div>
     );
   }
   ```

4. **`src/games/newgame/RulesBox.jsx`** (optional)
   ```javascript
   export default function RulesBox() {
     return (
       <div>
         {/* Deine Spielregeln */}
       </div>
     );
   }
   ```

5. **`src/games/newgame/scenarios.js`** (optional)
   ```javascript
   export const GAME_SCENARIOS = [
     "routine_win",
     "dramatic_win",
     // ...
   ];
   
   export function analyzeGameScenario(game, players, balances) {
     // Analysiere Spielsituation
     return "routine_win";
   }
   ```

6. **`src/games/newgame/commentary.js`** (optional)
   ```javascript
   import { PERSONALITIES } from '../shared/commentary.js';
   
   export function buildNewGameCommentary(game, regPlayers, personality) {
     // Generiere Kommentare
     return { segments, spokenText };
   }
   ```

### Schritt 2: Backend implementieren

**`server/routes/games/newgame.js` erstellen:**

```javascript
import express from 'express';
import db from '../../db.js';

const router = express.Router();

// Session erstellen
router.post('/', (req, res) => {
  const session = {
    id: crypto.randomUUID(),
    ...req.body,
    created_at: new Date().toISOString(),
  };
  
  const stmt = db.prepare(`
    INSERT INTO sessions (id, name, game_type, players, ...)
    VALUES (?, ?, ?, ?, ...)
  `);
  
  stmt.run(session);
  res.json(session);
});

// Spiele/Runden abrufen
router.get('/:sessionId', (req, res) => {
  const stmt = db.prepare(`
    SELECT * FROM newgame_games
    WHERE session_id = ?
    ORDER BY seq
  `);
  
  const games = stmt.all(req.params.sessionId);
  res.json(games);
});

// Spiel/Runde erstellen
router.post('/:sessionId', (req, res) => {
  const game = {
    id: crypto.randomUUID(),
    session_id: req.params.sessionId,
    ...req.body,
    created_at: new Date().toISOString(),
  };
  
  const stmt = db.prepare(`
    INSERT INTO newgame_games (id, session_id, ...)
    VALUES (?, ?, ...)
  `);
  
  stmt.run(game);
  res.json(game);
});

// Spiel/Runde bearbeiten
router.patch('/:sessionId/:gameId', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare(`
    UPDATE newgame_games
    SET ... = ?
    WHERE id = ?
  `);
  
  stmt.run({ ...req.body, id });
  
  // Session neu laden (für balances)
  const updated = db.prepare(`
    SELECT * FROM newgame_games
    WHERE session_id = ?
    ORDER BY seq
  `).all(req.params.sessionId);
  
  // TODO: balances neu berechnen
  // const updatedSession = { ...session, game_count: updated.length };
  // db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?').run(...);
  
  res.json({ success: true });
});

// Letztes Spiel/Runde löschen
router.delete('/:sessionId/last', (req, res) => {
  const stmt = db.prepare(`
    DELETE FROM newgame_games
    WHERE session_id = ?
    ORDER BY seq DESC
    LIMIT 1
  `);
  
  stmt.run(req.params.sessionId);
  
  const updated = db.prepare(`
    SELECT * FROM newgame_games
    WHERE session_id = ?
    ORDER BY seq
  `).all(req.params.sessionId);
  
  // TODO: Session aktualisieren
  // const updatedSession = { ...session, game_count: updated.length };
  // db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?').run(...);
  
  res.json({ success: true });
});

export default router;
```

**In `server/index.js` registrieren:**

```javascript
import newgameGames from './routes/games/newgame.js';

app.use('/api/sessions/:sessionId/newgame', newgameGames);
// oder
app.use('/api/sessions/:sessionId/games', newgameGames); // wenn Name "games"
```

**Datenbank-Migration hinzufügen (falls nötig):**

In `server/db.js`:
```javascript
// Neue Tabellen beim Initialisieren erstellen
db.exec(`
  CREATE TABLE IF NOT EXISTS newgame_games (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    seq INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    -- Spiel-spezifische Felder
    archived_at TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );
`);
```

### Schritt 3: Frontend-Komponenten implementieren

**`src/games/newgame/Session.jsx`** implementieren:

```javascript
import { useState } from "react";
import { GAME_PLUGINS } from "../index.js";
import Scoreboard from "../../components/Scoreboard.jsx";
import CommentarySettingsPanel from "../../components/CommentarySettingsPanel.jsx";
import CommentaryOverlay from "../../components/CommentaryOverlay.jsx";
import useCommentatorSettings from "../../hooks/useCommentatorSettings.js";
import styles from "../../components/styles.js";

// Importiere deine Spiel-spezifischen Komponenten
// import GameForm from "./GameForm.jsx";
// import HistoryCard from "./HistoryCard.jsx";
import RulesBox from "./RulesBox.jsx";
// import { calculateScore } from "./logic.js";

export default function Session({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [pendingCommentary, setPendingCommentary] = useState(null);
  const [showCommentatorSettings, setShowCommentatorSettings] = useState(false);

  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } = useCommentatorSettings();

  const plugin = GAME_PLUGINS[session.game_type];
  const { players, history } = session;

  // TODO: Balances berechnen basierend auf deinem Spiel
  // const balances = calculateBalances(history, players);

  const handleAddGame = async () => {
    // TODO: Spiel-Eingabe validieren und absenden
    const res = await fetch(`/api/sessions/${session.id}/newgame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ /* deine Spiel-Daten */ }),
    });

    if (res.ok) {
      const newGame = await res.json();
      onSessionUpdated({ ...session, history: [...history, newGame] });
      setShowForm(false);
      
      if (enabled && plugin.buildCommentary) {
        setPendingCommentary(newGame);
      }
    }
  };

  return (
    <>
      {pendingCommentary && (
        <CommentaryOverlay
          game={pendingCommentary}
          buildFn={plugin.buildCommentary}
          registeredPlayers={registeredPlayers}
          commentatorPersonality={personality}
          commentatorVoice={voice}
          onClose={() => setPendingCommentary(null)}
        />
      )}

      {showCommentatorSettings && (
        <CommentarySettingsPanel
          personality={personality} voice={voice} enabled={enabled}
          onPersonality={setPersonality} onVoice={setVoice} onEnabled={setEnabled}
        />
      )}

      {/* TODO: Scoreboard implementieren */}
      <div style={styles.scoreboard}>
        {/* Deine Scoreboard-Komponente */}
      </div>

      <div style={styles.actions}>
        <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Abbrechen" : "＋ Neues Spiel"}
        </button>
        <button style={styles.btnSecondary} onClick={() => setShowRules(!showRules)}>
          {showRules ? "✕ Regeln ausblenden" : "📜 Regeln"}
        </button>
        {history.length > 0 && !showForm && (
          <button style={styles.btnUndo}>↩ Rückgängig</button>
        )}
      </div>

      {showRules && (
        <RulesBox />
      )}

      {showForm && (
        // TODO: Spiel-Formular implementieren
        <div>Game Form Component</div>
      )}

      {/* TODO: History implementieren */}
      <div style={styles.historySection}>
        <h3 style={styles.historyTitle}>Spielverlauf</h3>
        {history.map(game => (
          // TODO: HistoryCard implementieren
          <div key={game.id}>{/* */}</div>
        ))}
      </div>
    </>
  );
}
```

### Schritt 4: Plugin registrieren

In `src/games/index.js`:

```javascript
import newgamePlugin from './newgame/plugin.js';

export const GAME_PLUGINS = {
  schafkopf,
  wizard,
  newgame: newgamePlugin,  // <-- Füge dies hinzu
};
```

## 🎯 Best Practices

### Synergien nutzen

**1. Shared Commentary nutzen:**
```javascript
import { PERSONALITIES, pickRandom, fill } from '../shared/commentary.js';

// Nutze PERSONALITIES für Kommentator-Persönlichkeiten
// Nutze pickRandom und fill für Template-Logik
```

**2. Player Personalities nutzen (optional):**
```javascript
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from '../shared/playerPersonalities.js';

// Nutze PLAYER_REACTIONS für Spieler-Reaktionen
// Definiere deine eigenen Szenarien in scenarios.js
```

**3. Externe Komponenten nutzen:**
```javascript
import Scoreboard from "../../components/Scoreboard.jsx";
import CommentarySettingsPanel from "../../components/CommentarySettingsPanel.jsx";
import CommentaryOverlay from "../../components/CommentaryOverlay.jsx";

// Vermeide Duplikation, nutze die shared Komponenten
```

### Code-Style

**1. Konsistente Struktur:**
- Nutze die gleiche Ordnerstruktur wie andere Spiele
- `plugin.js`, `Session.jsx`, `RulesBox.jsx`, `logic.js`, `commentary.js` (optional), `scenarios.js` (optional)

**2. Naming Konventionen:**
- Funktionen: `camelCase`
- Komponenten: `PascalCase`
- Konstanten: `UPPER_SNAKE_CASE`

**3. Imports:**
- Relative Imports für sibling-Dateien
- Absolute Imports für shared-Komponenten

### Interface-Konformität

**1. Plugin-Struktur:**
```javascript
const plugin = {
  // Pflicht
  id: string,
  label: string,
  description: string,
  defaultStake: number,
  showStake: boolean,
  SessionComponent: Component,

  // Optional
  buildCommentary: fn | null,
  getSessionMeta: fn | undefined,
  getArchiveConfirm: fn | undefined,
  SessionCreationHint: Component | null,
};
```

**2. Session-Component Props:**
```javascript
function Session({ 
  session,           // Session-Objekt
  registeredPlayers,  // Array von Spielern
  onBack,           // Callback: zurück zu SessionList
  onSessionUpdated, // Callback: Session aktualisieren
})
```

### Performance-Optimierung

**1. Datenbank-Optimierung:**
- Erstelle Indizes für häufige Queries
- Nutze Prepared Statements
- Minimiere N+1 Queries

**2. React-Optimierung:**
- Nutze `useMemo` für aufwändige Berechnungen
- Nutze `useCallback` für Callback-Funktionen
- Vermeide unnötige Re-Renders

## 🐛 Häufige Fehler vermeiden

### 1. Duplicate Imports
**Falsch:**
```javascript
import Scoreboard from "../../components/Scoreboard.jsx";
import Scoreboard from "./Scoreboard.jsx";  // Duplikat!
```

**Richtig:**
```javascript
import Scoreboard from "../../components/Scoreboard.jsx";  // Einmal importieren
```

### 2. Falsche Props-Namen
**Falsch:**
```javascript
props.onSessionUpdated(updated);  // Falscher Prop-Name
```

**Richtig:**
```javascript
props.onSessionUpdated({ ...session, history: [...history, newGame] });  // Vollständiges Session-Objekt
```

### 3. Fehlende Fallbacks
**Falsch:**
```javascript
const charType = reg?.character_type;  // undefined ist möglich!
const pool = PLAYER_REACTIONS[charType]["routine_win"];  // Crashing!
```

**Richtig:**
```javascript
const charType = reg?.character_type ?? "optimist";  // Fallback
const pool = PLAYER_REACTIONS[charType]?.["routine_win"]
          ?? PLAYER_REACTIONS.optimist["routine_win"];  // Double Fallback
```

### 4. Fehlende Error-Handling
**Falsch:**
```javascript
const res = await fetch(`/api/sessions/${id}/newgame`);
onSessionUpdated({ ...session, history: [...history, await res.json()] });
```

**Richtig:**
```javascript
const res = await fetch(`/api/sessions/${id}/newgame`);
if (res.ok) {
  const newGame = await res.json();
  onSessionUpdated({ ...session, history: [...history, newGame] });
} else {
  console.error("Failed to add game");
  // TODO: Fehler anzeigen
}
```

## ✅ Testing-Checkliste

Bevor du das neue Spiel als "fertig" markierst:

### Backend-Tests
- [ ] Session erstellen erfolgreich
- [ ] Spiele/Runden abrufen erfolgreich
- [ ] Spiel/Runde bearbeiten erfolgreich
- [ ] Letztes Spiel/Runde löschen erfolgreich
- [ ] Balances werden korrekt berechnet
- [ ] Archivierung funktioniert

### Frontend-Tests
- [ ] Session wird korrekt angezeigt
- [ ] Scoreboard zeigt korrekte Daten
- [ ] Spiel-Formular validiert Eingaben
- [ ] History zeigt korrekte Reihenfolge
- [ ] Aktionen funktionieren (Neues Spiel, Rückgängig, Archivieren)
- [ ] Regeln werden korrekt angezeigt
- [ ] Kommentator funktioniert (wenn implementiert)

### Integration-Tests
- [ ] Plugin wird in SessionList angezeigt
- [ ] SessionCreationHint wird beim Erstellen angezeigt
- [ ] getSessionMeta zeigt korrekte Metadaten
- [ ] getArchiveConfirm zeigt korrekten Dialog
- [ ] Session lässt sich öffnen und bearbeiten
- [ ] Zurück-Button funktioniert

### Edge-Cases
- [ ] Leere Session wird korrekt behandelt
- [ ] Letztes Spiel löschen bei leerer Session
- [ ] Kommenater-Settings funktionieren
- [ ] Archivierung kann nicht rückgängig gemacht werden (wenn gewünscht)

## 📚 Referenzen

### Bestehende Spiele als Referenz
- **Schafkopf**: `src/games/schafkopf/` - Vollständiges Beispiel mit allen Features
- **Wizard**: `src/games/wizard/` - Beispiel mit simpler Struktur

### Shared-Komponenten
- **SessionView**: `src/components/SessionView.jsx` - Wie SessionComponents eingebunden werden
- **SessionList**: `src/components/SessionList.jsx` - Wie Plugins integriert werden
- **CommentarySettingsPanel**: `src/components/CommentarySettingsPanel.jsx` - Wie Kommentator-Settings funktionieren
- **CommentaryOverlay**: `src/components/CommentaryOverlay.jsx` - Wie TTS funktioniert

### Shared-Logik
- **Commentary**: `src/games/shared/commentary.js` - PERSONALITIES, pickRandom, fill
- **Player Personalities**: `src/games/shared/playerPersonalities.js` - 10 Charaktere mit Szenarien
