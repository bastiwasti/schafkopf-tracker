# Skat Implementation Plan

## 📋 Zusammenfassung

Implementierung von **Skat 3er** (klassischer Skat mit DSV-Regeln) im Schafkopf Tracker.

### Spielart
- **Skat 3er** (klassischer Skat mit Reiz- und Contra-Spielen)
- Spieleranzahl: 3 (fest)
- Punktesystem: Grand 24, Kreuz 12, Pik 11, Herz 10
- Punktzählung: Buben + Trumpf-Asse (im Grand)
- Boni: Schneider (<31 Augen → ×2), Schwarz (0 Augen → ×3)
- Kontra-Spiele: Gewinner ×2, Verlierer (RE) ×2, Gegenpartei BOCK → ×4
- Aufschreiben: 3 Spalten (Spieler A, B, C), positive/negative Werte
- Bockrunden: 2x, 4x, 8x, 16x, 32x, 64x

**Erweiterungen (später):**
- Skat 4er (mit 4 Spielern, gleiche Regeln)
- Ramsch 3er/5er (separates Spiel)
- Solo (separates Spiel)

---

## 🗄️ Datenbank-Struktur

### sessions Tabelle (erweitern)

```sql
ALTER TABLE sessions ADD COLUMN game_variant TEXT DEFAULT 'skat_3er';
ALTER TABLE sessions ADD COLUMN bock_level INTEGER DEFAULT 1;
```

### skat_games Tabelle (neu)

```sql
CREATE TABLE IF NOT EXISTS skat_games (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  archived_at TEXT,

  -- Spiel-Typ
  game_type TEXT NOT NULL,              -- "null", "farbe", "grand", "kontra"

  -- Spieler-Eingaben
  declarer TEXT NOT NULL,             -- Alleinspieler (Name)
  partner TEXT,                         -- Partner-Name (bei Farb/Grand)
  contra TEXT,                          -- Kontra-Spieler (bei Kontra)

  -- Ergebnisse
  won BOOLEAN,
  schneider BOOLEAN,
  schwarz BOOLEAN,
  laufende INTEGER DEFAULT 0,          -- 0-4 (Grand), 0-2 (Farbe)
  klopfer TEXT,                         -- JSON-Array von Spielernamen
  bock INTEGER DEFAULT 1,
  kontra_multiplier INTEGER DEFAULT 1, -- 1 (normal), 2 (gewinnt doch), 3 (RE), 4 (RE+BOCK)
  points INTEGER,                       -- Gesamtpunkte für den Alleinspieler

  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_skat_games_session ON skat_games(session_id);
CREATE INDEX IF NOT EXISTS idx_skat_games_created ON skat_games(created_at);
```

---

## 🧮 Spiellogik

### Grundwerte & Kartenwerte

```javascript
const CARD_VALUES = {
  grand: { grand: 24, kreuz: 12, pik: 11, herz: 10 },
  farbe: { grand: 20, kreuz: 10, pik: 9, herz: 8 },
  null: { grand: 23, kreuz: 11, pik: 10, herz: 9 },
};

const getTrumpfCount = (gameType, laufende) => {
  if (gameType !== "grand") return laufende;
  // Grand: Buben + Trumpf-Asse
  return laufende + 4; // 4 Buben sind Trumpf im Grand
};
```

### Basiswert-Berechnung

```javascript
function calculateBasePoints(gameType, laufende) {
  const values = CARD_VALUES[gameType];
  let baseValue = values.grand;

  const trumpfCount = getTrumpfCount(gameType, laufende);
  baseValue += trumpfCount;

  return baseValue;
}
```

### Schneider/Schwarz-Multiplikator

```javascript
function getSchneiderMultiplier(schneider, schwarz) {
  if (schwarz) return 3; // Schwarz: ×3
  if (schneider) return 2; // Schneider: ×2
  return 1;
}
```

### Spielwert-Berechnung (ohne Kontra)

```javascript
function calculateGameValue(gameType, laufende, schneider, schwarz, bock = 1) {
  const baseValue = calculateBasePoints(gameType, laufende);
  const schneiderMultiplier = getSchneiderMultiplier(schneider, schwarz);
  const bockMultiplier = Math.pow(2, bock - 1); // 2^(bock-1): 1, 2, 4, 8, 16, 32, 64

  return baseValue * schneiderMultiplier * bockMultiplier;
}
```

### Kontra-Spiel-Berechnung

```javascript
function calculateKontraGameValue(gameType, laufende, schneider, schwarz, kontraMultiplier, bock = 1) {
  const baseValue = calculateBasePoints(gameType, laufende);
  const schneiderMultiplier = getSchneiderMultiplier(schneider, schwarz);
  const bockMultiplier = Math.pow(2, bock - 1);

  return baseValue * schneiderMultiplier * kontraMultiplier * bockMultiplier;
}
```

### Punkte pro Spieler

```javascript
function calculatePlayerPoints(game, players) {
  const { game_type, declarer, partner, contra, won, points, kontra_multiplier } = game;
  const pointsPerPlayer = {};

  players.forEach(player => {
    if (player === declarer) {
      // Alleinspieler
      if (won) {
        pointsPerPlayer[player] = points; // Positive Punkte
      } else {
        pointsPerPlayer[player] = -points; // Negative Punkte
      }
    } else if (player === partner) {
      // Mitspieler (gewinnt mit)
      if (won) {
        pointsPerPlayer[player] = points;
      } else {
        pointsPerPlayer[player] = -points;
      }
    } else if (player === contra) {
      // Kontra-Spieler (bei Kontra-Spielen)
      if (game_type === "kontra" && won) {
        // Kontra-Spiel gewonnen: Gewinner ×2
        pointsPerPlayer[player] = points * 2;
      } else {
        // Verlierer: -points
        pointsPerPlayer[player] = -points;
      }
    } else {
      // Nicht beteiligter Spieler
      pointsPerPlayer[player] = 0;
    }
  });

  return pointsPerPlayer;
}
```

### Balances-Berechnung

```javascript
function calculateBalances(games, players) {
  const balances = {};
  players.forEach(p => balances[p] = 0);

  games.forEach(game => {
    const pointsPerPlayer = calculatePlayerPoints(game, players);
    Object.entries(pointsPerPlayer).forEach(([player, points]) => {
      balances[player] += points;
    });
  });

  return balances;
}
```

---

## 🎨 UI-Komponenten

### src/games/skat/plugin.js

```javascript
import { buildSkatCommentary } from './commentary.js';
import SkatSession from './SkatSession.jsx';

const skatPlugin = {
  id: "skat",
  label: "Skat",
  description: "Klassischer Skat · 3 Spieler · DSV-Regeln",
  defaultStake: 0.50,
  showStake: true,
  SessionComponent: SkatSession,
  buildCommentary: buildSkatCommentary,
  getSessionMeta: (s) => `${s.game_count} Spiele`,
  getArchiveConfirm: (s) => "Runde ins Archiv verschieben?",
  SessionCreationHint: null, // Kein spezieller Hinweis nötig
};

export default skatPlugin;
```

### src/games/skat/SkatSession.jsx

Hauptkomponente für Skat:
- Scoreboard (balances)
- Spiel-Eingabeformular
- Historie-Karten (Aufschreiben-Tabellenform)
- Bockrunden-Anzeige
- Regeln-Link
- Kommentare-Integration (optional)

### src/components/GameCard.jsx

Spezifische Karte für Skat-Spiele:
- Zeigt Spieltyp (Grand/Farbe/Null/Kontra)
- Zeigt Kontra-Logik (falls Kontra-Spiel)
- Zeigt Schneider/Schwarz
- Zeigt Laufende
- Zeigt Punkte
- Archiv-Button
- Edit-Button

### src/games/skat/RulesBox.jsx (optional)

Zeigt DSV-Skat-Regeln:
- Punktzählung
- Spieltypen
- Boni (Schneider/Schwarz)
- Kontra-Spiel-Logik

---

## 🗣️ Backend-Implementierung

### server/routes/games/skat.js

```javascript
import express from 'express';
import db from '../../db.js';

const router = express.Router();

// Spiel erstellen
router.post('/:sessionId', async (req, res) => {
  const { game_type, declarer, partner, contra, won, schneider, schwarz, laufende, kontra_multiplier, bock } = req.body;

  // Spielwert berechnen
  let points;
  if (game_type === "kontra") {
    points = calculateKontraGameValue(game_type, laufende, schneider, schwarz, kontra_multiplier, bock);
  } else {
    points = calculateGameValue(game_type, laufende, schneider, schwarz, bock);
  }

  const game = {
    id: crypto.randomUUID(),
    session_id: req.params.sessionId,
    seq: getNextSeq(req.params.sessionId),
    created_at: new Date().toISOString(),
    game_type,
    declarer,
    partner: partner ?? null,
    contra: contra ?? null,
    won,
    schneider,
    schwarz,
    laufende,
    kontra_multiplier: kontra_multiplier ?? 1,
    bock,
    points,
  };

  const stmt = db.prepare(`
    INSERT INTO skat_games (
      id, session_id, seq, created_at,
      game_type, declarer, partner, contra,
      won, schneider, schwarz, laufende,
      kontra_multiplier, bock, points
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(game);

  // Session game_count aktualisieren
  const gameCount = db.prepare('SELECT COUNT(*) as count FROM skat_games WHERE session_id = ?')
    .get(req.params.sessionId).count;
  db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?')
    .run(gameCount, req.params.sessionId);

  res.json(game);
});

// Spiele abrufen
router.get('/:sessionId', (req, res) => {
  const games = db.prepare(`
    SELECT * FROM skat_games
    WHERE session_id = ?
    ORDER BY seq
  `).all(req.params.sessionId);

  res.json(games);
});

// Spiel bearbeiten
router.patch('/:sessionId/:gameId', async (req, res) => {
  const { id } = req.params;
  const { game_type, declarer, partner, contra, won, schneider, schwarz, laufende, kontra_multiplier, bock } = req.body;

  // Spielwert neu berechnen
  let points;
  if (game_type === "kontra") {
    points = calculateKontraGameValue(game_type, laufende, schneider, schwarz, kontra_multiplier, bock);
  } else {
    points = calculateGameValue(game_type, laufende, schneider, schwarz, bock);
  }

  db.prepare(`
    UPDATE skat_games SET
      game_type = ?, declarer = ?, partner = ?, contra = ?,
      won = ?, schneider = ?, schwarz = ?, laufende = ?,
      kontra_multiplier = ?, bock = ?, points = ?
    WHERE id = ?
  `).run(game_type, declarer, partner, contra, won, schneider, schwarz, laufende, kontra_multiplier, bock, points, id);

  res.json({ success: true });
});

// Letztes Spiel löschen
router.delete('/:sessionId/last', (req, res) => {
  const sessionId = req.params.sessionId;

  // Letztes Spiel finden
  const lastGame = db.prepare(`
    SELECT id FROM skat_games
    WHERE session_id = ? AND archived_at IS NULL
    ORDER BY seq DESC LIMIT 1
  `).get(sessionId);

  if (lastGame) {
    db.prepare('DELETE FROM skat_games WHERE id = ?').run(lastGame.id);

    // Session game_count aktualisieren
    const gameCount = db.prepare('SELECT COUNT(*) as count FROM skat_games WHERE session_id = ?')
      .get(sessionId).count;
    db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?')
      .run(gameCount, sessionId);
  }

  res.json({ success: true });
});

// Bockrunde ändern
router.patch('/:sessionId/bock', (req, res) => {
  const { bock } = req.body;
  db.prepare('UPDATE sessions SET bock_level = ? WHERE id = ?')
    .run(bock, req.params.sessionId);
  res.json({ success: true });
});

// Helper: Nächste Sequenz
function getNextSeq(sessionId) {
  const result = db.prepare(`
    SELECT COALESCE(MAX(seq), 0) + 1 as next_seq
    FROM skat_games
    WHERE session_id = ?
  `).get(sessionId);
  return result?.next_seq ?? 1;
}

export default router;
```

### server/index.js (erweitern)

```javascript
import skatGames from './routes/games/skat.js';

app.use('/api/sessions/:sessionId/skat', skatGames);
```

---

## 🎮 Frontend-Implementierung

### src/games/skat/SkatSession.jsx

```javascript
import { useState } from "react";
import { GAME_PLUGINS } from "../index.js";
import Scoreboard from "../../components/Scoreboard.jsx";
import CommentarySettingsPanel from "../../components/CommentarySettingsPanel.jsx";
import CommentaryOverlay from "../../components/CommentaryOverlay.jsx";
import useCommentatorSettings from "../../hooks/useCommentatorSettings.js";
import styles from "../../components/styles.js";

// Importiere Spiel-spezifische Komponenten
import GameForm from "./GameForm.jsx";
import GameCard from "./GameCard.jsx";

export default function SkatSession({ session, registeredPlayers = [], onBack, onSessionUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [pendingCommentary, setPendingCommentary] = useState(null);
  const [showCommentatorSettings, setShowCommentatorSettings] = useState(false);

  const { personality, voice, enabled, setPersonality, setVoice, setEnabled } = useCommentatorSettings();

  const plugin = GAME_PLUGINS[session.game_type];
  const { players, history, bock_level, stake } = session;

  const activeHistory = history.filter((g) => !g.archived_at);

  // Balances berechnen (aus logic.js importieren)
  const balances = calculateBalances(activeHistory, players);

  const handleBockChange = async (newBock) => {
    const res = await fetch(`/api/sessions/${session.id}/skat/bock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bock: newBock }),
    });
    if (res.ok) onSessionUpdated({ ...session, bock_level: newBock });
  };

  const handleAddGame = async () => {
    // Spiel-Eingabe validieren und absenden
    const res = await fetch(`/api/sessions/${session.id}/skat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ /* Spiel-Daten */ }),
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

  const handleEditGame = (game) => {
    setEditingGame(game);
    setShowForm(true);
  };

  const handleUpdateGame = async () => {
    const res = await fetch(`/api/sessions/${session.id}/skat/${editingGame.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ /* aktualisierte Daten */ }),
    });

    if (res.ok) {
      const updated = await res.json();
      onSessionUpdated({ ...session, history: history.map(g => g.id === updated.id ? updated : g) });
      setShowForm(false);
      setEditingGame(null);
    }
  };

  const handleArchiveGame = async (gameId) => {
    const res = await fetch(`/api/sessions/${session.id}/skat/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: new Date().toISOString() }),
    });

    if (res.ok) {
      const updated = await res.json();
      onSessionUpdated({ ...session, history: history.map(g => g.id === updated.id ? updated : g) });
    }
  };

  const handleUndo = async () => {
    const res = await fetch(`/api/sessions/${session.id}/skat/last`, {
      method: "DELETE",
    });

    if (res.ok) {
      const lastActive = [...activeHistory].pop();
      if (lastActive) {
        onSessionUpdated({
          ...session,
          history: history.filter(g => g.id !== lastActive.id),
        });
      }
    }
  };

  const toggleForm = () => {
    if (showForm) {
      setShowForm(false);
      setEditingGame(null);
    } else {
      setShowForm(true);
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

      {/* Bockrunden-Anzeige */}
      {bock_level > 1 && (
        <div style={{
          background: "#9d0208",
          color: "#fdf6e3",
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 14,
        }}>
          BOCK ×{bock_level}
        </div>
      )}

      <Scoreboard
        players={players}
        balances={balances}
        history={activeHistory}
        registeredPlayers={registeredPlayers}
      />

      <div style={styles.actions}>
        <button style={styles.btnPrimary} onClick={toggleForm}>
          {showForm ? "✕ Abbrechen" : "＋ Neues Spiel"}
        </button>
        {activeHistory.length > 0 && !showForm && (
          <button style={styles.btnUndo} onClick={handleUndo}>↩ Rückgängig</button>
        )}
      </div>

      {showForm && (
        <GameForm
          form={editingGame}
          onFormChange={() => {}}
          players={players}
          stake={stake}
          bock={editingGame ? editingGame.bock : bock_level}
          onSubmit={handleUpdateGame}
          onCancel={toggleForm}
          submitLabel={editingGame ? "✓ Änderungen speichern" : undefined}
        />
      )}

      {/* Historie in Aufschreiben-Tabellenform */}
      <div style={styles.historySection}>
        <h3 style={styles.historyTitle}>Aufschreiben</h3>
        {activeHistory.length === 0 && (
          <p style={styles.emptyMsg}>Noch keine Spiele eingetragen.</p>
        )}
        {activeHistory.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: `80px repeat(${players.length}, 1fr)`,
            gap: "2px",
            border: "1px solid #8b6914",
            borderRadius: 8,
            padding: 8,
            background: "#fdf6e3",
            fontFamily: "monospace",
            fontSize: 13,
          }}>
            {/* Header */}
            <div style={{ fontWeight: "bold", padding: "4px", textAlign: "center" }}>R</div>
            {players.map(p => (
              <div key={p} style={{ fontWeight: "bold", padding: "4px", textAlign: "center" }}>
                {p}
              </div>
            ))}
            {/* Spielzeilen */}
            {[...activeHistory].reverse().map((game, i) => (
              <>
                <div key={game.id} style={{ padding: "4px", textAlign: "center" }}>
                  {game.seq}
                </div>
                {players.map(p => {
                  const points = calculatePlayerPoints(game, [p])[p];
                  const color = points > 0 ? "#2d6a4f" : points < 0 ? "#9d0208" : "#555";
                  const isDeclarerOrPartner = game.won && (p === game.declarer || p === game.partner);
                  return (
                    <div key={p} style={{
                      padding: "4px",
                      textAlign: "center",
                      color,
                      fontWeight: isDeclarerOrPartner ? "bold" : "normal",
                    }}>
                      {points > 0 ? "+" : ""}{points}
                    </div>
                  );
                })}
                <GameCard
                  game={game}
                  players={players}
                  onEdit={handleEditGame}
                  onArchive={handleArchiveGame}
                />
              </>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
```

---

## 🗣️ GameForm.jsx

Spiel-Eingabeformular für Skat:
- Spieltyp-Auswahl (Null/Farbe/Grand/Kontra)
- Declarer-Auswahl
- Partner-Auswahl (bei Farb/Grand)
- Kontra-Spieler-Auswahl (bei Kontra)
- Checkboxen: Gewonnen, Schneider, Schwarz
- Laufende-Slider (0-4 bei Grand, 0-2 bei Farbe)
- Kontra-Multiplikator-Auswahl (bei Kontra)

---

## 🗣️ GameCard.jsx

Historie-Karte für Skat:
- Zeigt Spieltyp (Grand/Farbe/Null/Kontra)
- Zeigt Kontra-Logik (falls Kontra-Spiel)
- Zeigt Schneider/Schwarz
- Zeigt Laufende
- Zeigt Punkte
- Archiv-Button
- Edit-Button

---

## 🎙️ Kommentator-Integration (optional)

### src/games/skat/commentary.js

```javascript
import { PERSONALITIES, pickRandom, fill } from '../shared/commentary.js';

export const SKAT_COMMENTATOR = {
  bayerisch: {
    grand: [
      "Grand gespielt! {declarer} gewinnt mit {points} Punkten!",
      "Hocho! Grand mit {points} Punkten!",
      "Des war a schenes Grand-Spiel!",
    ],
    kontra: [
      "Kontra! {declarer} kontert, aber {declarer} gewinnt!",
      "Des war a harter Kontra-Spiels!",
      "Ned des Guten, aber {declarer} gewinnt!",
    ],
  },
  traditionell: {
    grand: [
      "Grand-Spiel gespielt. {declarer} gewinnt mit {points} Punkten.",
      "Ergebnis: {points} Punkte für {declarer}.",
    ],
    kontra: [
      "Kontra-Spiel. {declarer} gewinnt mit {points} Punkten.",
      "Ergebnis: {points} Punkte für {declarer}.",
    ],
  },
  erzähler: {
    grand: [
      "Ein Grand wie im Märchenbuch! {declarer} gewinnt mit {points} Punkten!",
      "So ein Spiel bleibt unvergessen! {points} Punkte für {declarer}!",
    ],
    kontra: [
      "Der Bär weicht! {contra} kontert, aber {declarer} gewinnt!",
      "Wie im alten Skat-Club! {points} Punkte für {declarer}!",
    ],
  },
  schalkig: {
    grand: [
      "Grand, grand! {declarer} holt {points} Punkte ab!",
      "Nicht schlecht für {declarer}! {points} Punkte!",
    ],
    kontra: [
      "Kontra! {declarer} lacht zuletzt! {points} Punkte für {declarer}!",
      "Pech für {contra}! {points} Punkte für {declarer}!",
    ],
  },
};

export function buildSkatCommentary(game, regPlayers, personality) {
  const { game_type, declarer, partner, contra, won, points } = game;
  const pers = PERSONALITIES[personality] ?? PERSONALITIES.dramatic;
  const templates = SKAT_COMMENTATOR[personality] ?? SKAT_COMMENTATOR.bayerisch;

  let mainTemplates;
  if (game_type === "kontra") {
    mainTemplates = templates.kontra;
  } else {
    mainTemplates = templates.grand;
  }

  const segments = [
    {
      avatar: pers.icon,
      name: "Kommentator",
      label: pers.label,
      text: fill(pickRandom(mainTemplates), {
        declarer,
        contra: contra ?? "niemand",
        partner: partner ?? "niemand",
        points,
      }),
    },
  ];

  return { segments, spokenText: segments.map(s => s.text).join(" — ") };
}
```

---

## 🗣️ SkatLogik.js

Alle Spielberechnungen:
- `calculateBasePoints()`
- `calculateGameValue()`
- `calculateKontraGameValue()`
- `calculatePlayerPoints()`
- `calculateBalances()`

---

## 🎯 Ziel

Implementierung eines vollständigen Skat 3er Spiels mit:
- Klassischer Skat nach DSV-Regeln
- Alle Spieltypen (Null/Farbe/Grand/Kontra)
- Bockrunden
- Kontra-Spiel-Logik (×2, ×3, ×4)
- Aufschreiben-Tabellenform
- Kommentator-Integration (optional)
- Erweiterbar auf Skat 4er

---

## 📝 Implementierungsreihenfolge

1. **Datenbank vorbereiten**
   - ALTER TABLE statements für sessions
   - CREATE TABLE statements für skat_games
   - Indizes erstellen

2. **Backend-Infrastruktur**
   - server/routes/games/skat.js erstellen
   - server/index.js erweitern

3. **Backend-Logik**
   - Spielberechnungen implementieren
   - API-Endpunkte implementieren

4. **Plugin-Konfiguration**
   - src/games/skat/plugin.js erstellen
   - In src/games/index.js registrieren

5. **Frontend-Komponenten**
   - src/games/skat/SkatSession.jsx
   - src/games/skat/GameForm.jsx
   - src/games/skat/GameCard.jsx
   - src/games/skat/logic.js
   - src/components/GameCard.jsx

6. **Kommentator-Integration** (optional)
   - src/games/skat/commentary.js
   - src/games/skat/plugin.js erweitern

7. **Frontend-Integration**
   - src/components/SessionList.jsx erweitern (Skat-Variante)

8. **Testing**
   - Backend-Tests
   - Frontend-Tests
   - Integration-Tests
   - Edge-Cases

---

## ✅ Testing-Checkliste

### Backend-Tests
- [ ] Skat-Spiel erstellen (alle Spieltypen)
- [ ] Skat-Spiele abrufen
- [ ] Skat-Spiel bearbeiten
- [ ] Letztes Skat-Spiel löschen
- [ ] Bockrunde ändern
- [ ] Balances werden korrekt berechnet
- [ ] Kontra-Spiele werden korrekt berechnet

### Frontend-Tests
- [ ] Session wird korrekt angezeigt
- [ ] Scoreboard zeigt korrekte Daten
- [ ] Spiel-Formular validiert Eingaben
- [ ] Historie zeigt Aufschreiben-Tabellen
- [ ] Bockrunden-Anzeige funktioniert
- [ ] Kontra-Spiele werden korrekt dargestellt
- [ ] Aktionen funktionieren (Neues Spiel, Rückgängig, Archivieren)

### Integration-Tests
- [ ] Plugin wird in SessionList angezeigt
- [ ] Skat-Variante kann ausgewählt werden
- [ ] getSessionMeta zeigt korrekte Metadaten
- [ ] getArchiveConfirm zeigt korrekten Dialog
- [ ] Session lässt sich öffnen und bearbeiten

### Edge-Cases
- [ ] Leere Session wird korrekt behandelt
- [ ] Letztes Spiel löschen bei leerer Session
- [ ] Kontra-Spiel ohne Gewinner (Unentschieden)
- [ ] Bockrunde mit maximaler Stufe (64x)
