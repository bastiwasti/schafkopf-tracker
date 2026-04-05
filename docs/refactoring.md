# Refactoring Plan: Modulare Spielarchitektur

## Context

Die Codebasis hat 4 Kartenspiele (Schafkopf, Skat, Wizard, Watten) mit erheblicher Duplikation in:
- **Session-Komponenten**: SchafkopfSession, SkatSession, WattenSession sind ~95% identisch (~30KB doppelter Code)
- **Game Forms**: GameForm (Schafkopf/Skat) und WattenRoundForm folgen gleichem Muster
- **History Cards**: HistoryCard (Schafkopf) und GameCard (Skat) fast identisch
- **Backend-Routes**: Rohes SQL direkt in Routes, keine Service-Schicht

**Ziel:** Neue Spiele einfach anschließen können, übergreifende Features (z.B. Leaderboard) ermöglichen.
**Vorgehen:** Inkrementell, Spiel für Spiel, Tests nach jedem Schritt. Skat ist WIP.

---

## Phase 1: Plugin-Interface standardisieren

**Ziel:** Klarer Vertrag, den neue Spiele erfüllen müssen.

### Änderungen

**`src/games/index.js`** — `createPlugin()` Factory-Funktion hinzufügen:
```js
export function createPlugin(config) {
  return {
    showStake: false,
    playerCount: null,
    FormComponent: null,
    HistoryCardComponent: null,
    RulesComponent: null,
    getSessionMeta: (s) => `${s.game_count} ${s.game_count === 1 ? 'Spiel' : 'Spiele'}`,
    getArchiveConfirm: () => 'Runde ins Archiv verschieben?',
    buildCommentary: null,
    calcBalances: null,
    ...config, // Game-specific overrides
  };
}
```

**Alle `plugin.js` Dateien** — Auf `createPlugin()` umstellen:
- `src/games/schafkopf/plugin.js`
- `src/games/skat/plugin.js`
- `src/games/wizard/plugin.js`
- `src/games/watten/plugin.js`

**Ergebnis:** Neues Spiel braucht nur `id, label, description, defaultStake, SessionComponent`.

---

## Phase 2: Shared Frontend-Komponenten

**Ziel:** Duplizierten UI-Code extrahieren.

### 2a: Generische HistoryCard

**Neu erstellen:** `src/games/shared/HistoryCard.jsx`
```jsx
// Props: game, getTypeLabel, getDetails, extraBadges, onEdit, onArchive
// Rendert generisches Karten-Layout mit game-spezifischen Label/Detail-Funktionen
```

**Schafkopf** `src/games/schafkopf/HistoryCard.jsx` → verwendet `SharedHistoryCard` mit schafkopf-spezifischen Extraktions-Funktionen  
**Skat** `src/games/skat/GameCard.jsx` → verwendet `SharedHistoryCard` mit skat-spezifischen Funktionen

### 2b: Shared calcBalances

**Neu erstellen:** `src/games/shared/balanceCalculator.js`
```js
export function calcBalances(history, players, extractor) {
  const balances = {};
  players.forEach(p => (balances[p] = 0));
  history.forEach(game => {
    const points = extractor(game);
    Object.entries(points).forEach(([p, pts]) => {
      if (p in balances) balances[p] += pts;
    });
  });
  return balances;
}
```

Schafkopf, Skat, Wizard — eigene `calcBalances` ersetzen durch thin wrapper.

---

## Phase 3: GameSessionContainer

**Ziel:** Die drei fast-identischen Session-Komponenten zusammenführen.

### Neu erstellen: `src/games/shared/GameSessionContainer.jsx`

Verwaltet generisch:
- State: `showForm`, `editingGame`, `pendingCommentary`
- Commentary-Settings via `useCommentatorSettings()`
- Callbacks als Props: `onLoadHistory`, `onAddGame`, `onUpdateGame`, `onArchiveGame`, `onUndo`
- Rendert: Scoreboard, HistorySection, Form, CommentaryOverlay

```jsx
export default function GameSessionContainer({
  session,
  registeredPlayers,
  onBack,
  onSessionUpdated,
  // API callbacks (game-specific)
  fetchHistory,      // async (sessionId) => games[]
  submitGame,        // async (sessionId, formData) => game
  updateGame,        // async (sessionId, gameId, formData) => game
  archiveGame,       // async (sessionId, gameId) => void
  undoGame,          // async (sessionId) => void
  // Components
  FormComponent,
  HistoryComponent,
  ScoreboardComponent,
  RulesComponent,
  // Plugin functions
  calcBalances,
  buildCommentary,
  makeDefaultForm,
})
```

### Migrations-Reihenfolge (inkrementell)

1. **Schafkopf** — `SchafkopfSession.jsx` auf `GameSessionContainer` umstellen, testen
2. **Skat** — `SkatSession.jsx` auf `GameSessionContainer` umstellen, testen
3. **Watten** — `WattenSession.jsx` auf `GameSessionContainer` umstellen (team-aware props)
4. **Wizard** — bleibt `ScoreSheet.jsx` (legitimerweise anders: Grid-basierte Rundenanzeige)

---

## Phase 4: Backend Service-Schicht

**Ziel:** SQL/Berechnungen aus Routes in Service-Module extrahieren.

### Neue Service-Module

**`server/services/schafkopf.js`** — extrahiert aus `server/routes/games.js`
- `getGames(sessionId)`
- `addGame(sessionId, data)`
- `updateGame(sessionId, gameId, data)`
- `archiveGame(sessionId, gameId)`
- `undoLastGame(sessionId)`

**`server/services/skat.js`** — extrahiert aus `server/routes/games/skat.js`
- Gleiche Struktur, Skat-spezifische Berechnungen (Punkteformel aktuell dupliziert in POST+PATCH → fixieren)

**`server/services/wizard.js`** — extrahiert aus `server/routes/wizard/rounds.js`
- Scoring-Logik (prediction vs tricks) nur an einer Stelle

**`server/services/watten.js`** — extrahiert aus `server/routes/watten/games.js`
- Rundenlogik, Spielstand-Berechnung, Win-Condition

**`server/services/sessions.js`** — extrahiert aus `server/routes/sessions.js`
- `getSessions()`, `getSession(id)`, `createSession(data)`, `updateSession(id, data)`
- `getGameCount(sessionId, gameType)` — übergreifend nutzbar

### Routes werden zu thin wrapper
```js
// Vorher: 50 Zeilen mit SQL in der Route
// Nachher:
router.post('/', (req, res) => {
  const game = schafkopfService.addGame(req.params.id, req.body);
  res.json(game);
});
```

### Foundation für Cross-Game-Features
Mit Service-Schicht kann später einfach hinzugefügt werden:
- `GET /api/stats/leaderboard` — nutzt alle Service-Module
- `GET /api/stats/player/:name` — übergreifende Spielerstatistik

---

## Kritische Dateien

| Datei | Aktion |
|-------|--------|
| `src/games/index.js` | `createPlugin()` hinzufügen |
| `src/games/*/plugin.js` (4x) | Auf `createPlugin()` umstellen |
| `src/games/shared/HistoryCard.jsx` | Neu erstellen |
| `src/games/shared/balanceCalculator.js` | Neu erstellen |
| `src/games/shared/GameSessionContainer.jsx` | Neu erstellen (größte Arbeit) |
| `src/games/schafkopf/SchafkopfSession.jsx` | Auf Container umstellen |
| `src/games/skat/SkatSession.jsx` | Auf Container umstellen |
| `src/games/watten/WattenSession.jsx` | Auf Container umstellen |
| `server/services/` (5 neue Dateien) | Neu erstellen |
| `server/routes/games.js` | Routes → Service Calls |
| `server/routes/games/skat.js` | Routes → Service Calls |
| `server/routes/wizard/rounds.js` | Routes → Service Calls |
| `server/routes/watten/games.js` | Routes → Service Calls |

---

## Verification

Nach jeder Phase:
1. `npm run dev` — App läuft, alle 4 Spiele öffnen sich
2. Schafkopf: Spiel eingeben, History zeigt, Undo funktioniert, Commentary spielt
3. Wizard: Runde eingeben, Scoreboard aktualisiert
4. Watten: Runde eingeben, Gespannt/Maschine funktionieren
5. `npm test` — alle Playwright-Tests grün

Nach Phase 3 zusätzlich:
- Neues Dummy-Spiel in `src/games/demo/plugin.js` registrieren → muss ohne Änderungen an SessionList/SessionView funktionieren

---

## Was NICHT refactort wird

- `src/games/wizard/ScoreSheet.jsx` — legitimerweise einzigartiges Grid-UI
- `src/games/*/commentary.js` — gut architektiert, 0 Duplikation
- `src/games/*/logic.js` — spielspezifisch, soll isoliert bleiben
- `src/games/*/RulesBox.jsx` — spielspezifische Inhalte
- DB-Schema (`server/db.js`) — keine Breaking Changes
