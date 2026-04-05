# New Game Implementation Guide

Schritt-für-Schritt-Anleitung für die Implementierung eines neuen Spiels im Schafkopf Tracker. Basiert auf der Doppelkopf-Implementierung (April 2026) — alle Fallstricke sind hier dokumentiert.

---

## Architektur-Überblick

Jedes Spiel ist ein **Plugin** — ein Objekt mit einer festen Schnittstelle, das über `createPlugin()` erzeugt wird. Plugins werden in `src/games/index.js` als `GAME_PLUGINS` exportiert. Die Reihenfolge der Keys im Objekt bestimmt die Anzeigereihenfolge in der UI.

```
src/games/
  index.js                  ← Plugin-Registry (Reihenfolge = UI-Reihenfolge)
  shared/
    createPlugin.js         ← Factory mit Defaults für alle optionalen Felder
    balanceCalculator.js    ← Generischer calcBalances
    HistoryCard.jsx         ← Wiederverwendbare History-Karte
    GameSessionContainer.jsx← Generischer Session-Container (Schafkopf, Skat, Doppelkopf)
    commentary.js           ← PERSONALITIES + Hilfsfunktionen für Kommentartexte
    playerPersonalities.js  ← PLAYER_PERSONALITIES + PLAYER_REACTIONS (10 Spieler-Charaktere)
  newgame/
    plugin.js
    logic.js
    GameForm.jsx
    HistoryCard.jsx
    RulesBox.jsx            ← EIGENE Datei, NICHT shared (spielspezifisch!)
    NewGameSession.jsx
    commentary.js
```

---

## Schritt 1 — DB-Migration (`server/db.js`)

Die bestehende `games`-Tabelle wird von allen Spielen (Schafkopf, Skat, Doppelkopf) geteilt. Neue Spalten werden als `ALTER TABLE` mit `DEFAULT` hinzugefügt.

```js
// Am Ende der bestehenden Migrations-Blöcke in server/db.js:
try { db.exec('ALTER TABLE games ADD COLUMN my_field INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec("ALTER TABLE games ADD COLUMN my_json TEXT NOT NULL DEFAULT '{}'"); } catch (e) {}
```

Wenn das neue Spiel **session-spezifische Konfiguration** braucht (z.B. variabler Solo-Wert), wird eine JSON-Spalte auf `sessions` angelegt:

```js
try { db.exec("ALTER TABLE sessions ADD COLUMN newgame_options TEXT DEFAULT '{}'"); } catch (e) {}
```

**Wichtig:** Immer `try/catch`, da die Migrations-DB schon existieren kann. Nie `DEFAULT NULL` für JSON-Felder — immer `DEFAULT '{}'` oder einen sinnvollen Wert.

---

## Schritt 2 — Backend: `server/routes/games.js`

`parseGame` am Anfang der Datei um die neuen Felder erweitern:

```js
const parseGame = (g) => ({
  ...g,
  won: Boolean(g.won),
  // ...bestehende Felder...
  my_json_field: JSON.parse(g.my_json_field || '{}'),
});
```

Im `POST`-Handler die neuen Felder aus `req.body` lesen und in die INSERT-Query aufnehmen:

```js
const { ..., my_field, my_json_field } = req.body;
// INSERT ... VALUES (?, ..., ?, ?)
// Bindings: ..., my_field ?? 0, JSON.stringify(my_json_field ?? {})
```

Dasselbe im `PATCH`-Handler, damit Bearbeitungen alle Felder korrekt überschreiben.

### Session-Optionen

Falls du eine `newgame_options`-Spalte auf `sessions` angelegt hast:

In `server/routes/sessions.js`, POST-Handler, neuen Branch hinzufügen:

```js
} else if (game_type === 'newgame') {
  db.prepare(`INSERT INTO sessions (id, name, game_type, players, stake, bock, newgame_options, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`)
    .run(id, name, game_type, JSON.stringify(players), stake, JSON.stringify(newgame_options || {}), new Date().toISOString());
}
```

In **allen** GET-Handlern das Parsen ergänzen:

```js
newgame_options: JSON.parse(s.newgame_options || '{}'),
```

### Player-API: `server/routes/players.js`

**Bekannter Bug:** Der `POST /api/players`-Handler hat historisch nur `id, name, avatar` gespeichert — `character_type` und `voice_name` wurden ignoriert. Sicherstellen dass der Handler alle Felder enthält:

```js
router.post('/', (req, res) => {
  const { id, name, avatar = '🃏', character_type = 'optimist', voice_name = null } = req.body;
  db.prepare('INSERT INTO players (id, name, avatar, character_type, voice_name, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, name.trim(), avatar, character_type, voice_name, new Date().toISOString());
  // ...
});
```

Wenn dieser Bug vorhanden war und behoben wurde: bestehende Spieler müssen einmalig über "Bearbeiten → Speichern" in der UI aktualisiert werden.

---

## Schritt 3 — `src/games/newgame/logic.js`

```js
export const GAME_TYPES = [
  { name: "Normal", isSolo: false },
  { name: "Solo",   isSolo: true },
];

export function calcSpielwert({ type, kontra, bock, stake }) {
  return (stake + (kontra ? stake : 0)) * bock;
}

export function resolveGame({ type, player, won, bock, players, stake, ...rest }) {
  const rate = calcSpielwert({ type, kontra: rest.kontra, bock, stake });
  const changes = {};
  players.forEach((p) => (changes[p] = 0));
  // ... Verteilung je nach Spieltyp
  return { changes, spielwert: rate };
}

// Shared calcBalances nutzen — kein eigenes schreiben
import { calcBalances as sharedCalcBalances } from "../shared/balanceCalculator.js";
export function calcBalances(history, players) {
  return sharedCalcBalances(history, players, (g) => g.changes);
}
```

**Null-Sum prüfen:** Bei jedem Spiel muss die Summe aller `changes`-Werte = 0 sein. Bei Doppelkopf Normal war ein `* 2` im Code, das die Beträge verdoppelt hat — Zahlen auf Papier durchrechnen, bevor man den Code schreibt.

---

## Schritt 4 — `src/games/newgame/GameForm.jsx`

Props: `form, onFormChange, players, stake, bock, soloValue, onSubmit, onCancel, submitLabel`

```jsx
export default function GameForm({ form, onFormChange, players, stake, bock, soloValue = 3, onSubmit, onCancel, submitLabel }) {
  // Live-Spielwert-Preview
  const preview = resolveGame({ ...form, bock, players, stake, soloValue });
  // ...
}
```

**Validierung im UI statt im Backend:** Constraints wie "Karlchen ist exklusiv (entweder Team A oder Team B)" oder "Fuchs max. 2 verteilt auf beide Teams" müssen im Formular abgebildet sein — disabled Buttons, berechnete Maxima.

---

## Schritt 5 — `src/games/newgame/HistoryCard.jsx`

Nutzt `SharedHistoryCard` aus `../shared/HistoryCard.jsx`:

```jsx
import SharedHistoryCard from "../shared/HistoryCard.jsx";

export default function HistoryCard({ game: g, players, onEdit, onArchive }) {
  const badges = [
    g.my_flag && "Mein Badge",
    // ...
  ].filter(Boolean);

  return (
    <SharedHistoryCard
      seq={g.seq}
      typeLabel={g.type}
      valueBadge={`${(g.spielwert || 0).toFixed(2)} €`}
      won={g.won}
      mainPlayer={g.player}
      badges={badges}
      changes={g.changes}
      formatChange={(v) => `${v >= 0 ? "+" : ""}${(v || 0).toFixed(2)}€`}
      onEdit={onEdit ? () => onEdit(g) : null}
      onArchive={onArchive ? () => onArchive(g.id) : null}
    />
  );
}
```

---

## Schritt 6 — `src/games/newgame/RulesBox.jsx`

**Jedes Spiel hat seine eigene `RulesBox.jsx`** — es gibt keine shared RulesBox. Die Datei liegt direkt im Spiel-Ordner, nicht in `src/components/`.

```jsx
import styles from "../../components/styles.js";

export default function RulesBox() {
  return (
    <div style={styles.rulesBox}>
      <h3 style={styles.rulesTitle}>Newgame-Regeln</h3>
      <div style={styles.rulesContent}>
        {/* spielspezifische Regeln */}
      </div>
    </div>
  );
}
```

---

## Schritt 7 — `src/games/newgame/NewGameSession.jsx`

Nutzt `GameSessionContainer` aus `../shared/GameSessionContainer.jsx`:

```jsx
import GameSessionContainer from "../shared/GameSessionContainer.jsx";
import { resolveGame, calcBalances } from "./logic.js";
import GameForm from "./GameForm.jsx";
import HistoryCard from "./HistoryCard.jsx";
import RulesBox from "./RulesBox.jsx";

export default function NewGameSession({ session, registeredPlayers, onBack, onSessionUpdated }) {
  const players = session.players;
  const { stake, bock } = session;
  // Session-spezifische Optionen auslesen:
  const { solo_value: soloValue = 3 } = session.newgame_options ?? {};

  const onSubmitGame = async (form, { bock, stake }) => {
    const { changes, spielwert } = resolveGame({ ...form, bock, players, stake, soloValue });
    const payload = {
      type: form.type,
      player: form.player,
      won: form.won,
      bock,
      spielwert,
      changes,
      schneider: false, schwarz: false, laufende: 0, klopfer: [],
      // ...newgame-spezifische Felder
    };
    const res = await fetch(`/api/sessions/${session.id}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok ? res.json() : null;
  };

  const makeDefaultForm = (players) => ({
    type: "Normal",
    player: players[0] ?? "",
    won: true,
    // ...
  });

  const makeEditForm = (game) => ({
    type: game.type,
    player: game.player,
    won: game.won,
    // ...
  });

  const topSlot = (
    <div style={{ /* Spielwert-Info-Zeile */ }}>
      Normal: {stake.toFixed(2)} € · Solo: {soloValue.toFixed(2)} €
    </div>
  );

  return (
    <GameSessionContainer
      session={session}
      registeredPlayers={registeredPlayers}
      onSessionUpdated={onSessionUpdated}
      initialHistory={session.history ?? []}
      onSubmitGame={onSubmitGame}
      onUpdateGame={/* PATCH-Handler */}
      onArchiveGame={/* Archive-Handler */}
      onUndoGame={/* Undo-Handler */}
      makeDefaultForm={makeDefaultForm}
      makeEditForm={makeEditForm}
      calcBalances={calcBalances}
      buildCommentary={plugin.buildCommentary}
      FormComponent={GameForm}
      HistoryCardComponent={HistoryCard}
      RulesComponent={RulesBox}
      topSlot={topSlot}
      gameContext={{ bock, stake, soloValue }}
    />
  );
}
```

---

## Schritt 8 — `src/games/newgame/commentary.js`

### Struktur

```js
import { PERSONALITIES, pickRandom, fill } from "../shared/commentary.js";
import { PLAYER_PERSONALITIES, PLAYER_REACTIONS } from "../shared/playerPersonalities.js";

const COMMENTATOR_TEMPLATES = {
  dramatic: { Normal: { won: [...], lost: [...] }, Solo: { won: [...], lost: [...] } },
  tagesschau: { /* ... */ },
  bavarian: { /* ... */ },
  fan: { /* ... */ },
};

export function buildFullCommentary(game, regPlayers = [], personality = "dramatic", sessionHistory = []) {
  const pers = PERSONALITIES[personality] ?? PERSONALITIES.dramatic;
  const text = buildCommentatorText(game, personality);
  const segments = [{ avatar: pers.icon, name: "Kommentator", label: pers.label, text }];

  // Spieler-Reaktion
  const reactionChance = game.type === "Solo" ? 0.65 : 0.20;
  if (Math.random() < reactionChance) {
    const reactingPlayer = game.player; // oder zufällig aus Beteiligten
    const regPlayer = (regPlayers ?? []).find((p) => p.name === reactingPlayer);
    const charType = regPlayer?.character_type ?? "optimist";
    const reactionPool = PLAYER_REACTIONS[charType] ?? PLAYER_REACTIONS.optimist;

    // Szenario aus Spielkontext ableiten (NICHT won/lost direkt verwenden):
    let scenarioKey;
    if (game.type === "Solo") {
      scenarioKey = game.won ? "high_solo_win" : "dramatic_loss";
    } else {
      scenarioKey = game.won ? "routine_win" : "routine_loss";
    }

    const pool = reactionPool[scenarioKey] ?? (game.won ? reactionPool.routine_win : reactionPool.routine_loss) ?? [];
    if (pool.length > 0) {
      const reaction = pickRandom(pool);
      segments.push({
        avatar: regPlayer?.avatar ?? "🃏",
        name: reactingPlayer,
        label: PLAYER_PERSONALITIES[charType]?.label ?? "",
        text: typeof reaction === "function" ? reaction() : reaction,
      });
    }
  }

  return { segments };
}
```

### Fallstricke Commentary

**1. Kommentator-Typen ≠ Spieler-Typen**

| Kommentator-Persönlichkeiten | Spieler-Charaktere |
|---|---|
| `dramatic`, `tagesschau`, `bavarian`, `fan` | `optimist`, `pessimist`, `stratege`, `joker`, `eitle`, `stoische`, `empoerte`, `anfaenger`, `veteran`, `chiller` |
| In `PERSONALITIES` (commentary.js) | In `PLAYER_PERSONALITIES` (playerPersonalities.js) |
| Für Kommentator-Templates | Für Spieler-Reaktionen |

**PLAYER_REACTIONS immer aus `playerPersonalities.js` importieren** — nie eigene mit Kommentator-Typ-Keys anlegen. Das ist der häufigste Fehler bei neuen Spielen.

**2. Szenario-Keys in PLAYER_REACTIONS**

Die Keys in `PLAYER_REACTIONS` sind Szenarien, nicht `won`/`lost`:

```js
// FALSCH:
const pool = PLAYER_REACTIONS[charType].won;

// RICHTIG:
const scenarioKey = game.won ? "routine_win" : "routine_loss";
const pool = PLAYER_REACTIONS[charType][scenarioKey];
```

Verfügbare Szenario-Keys: `routine_win`, `routine_loss`, `close_win`, `close_loss`, `dramatic_win`, `dramatic_loss`, `high_solo_win`, `against_solo_win`, `bock_good_luck`.

**3. Spieler sagen ihren eigenen Namen nicht**

Spieler stehen links als Badge im Overlay — der Name muss nicht nochmal im Text vorkommen:

```js
// FALSCH:
() => `${name}: "Das war mein Spiel!"`,

// RICHTIG:
() => "Das war mein Spiel!",
```

**4. Sonderpunkte im Spielwert berücksichtigen**

Der `spielwert` im Kommentar-Kontext sollte die Sonderpunkte enthalten, falls sie die Abrechnung beeinflussen.

---

## Schritt 9 — `src/games/newgame/plugin.js`

```js
import { createPlugin } from "../shared/createPlugin.js";
import { calcSpielwert, resolveGame, calcBalances } from "./logic.js";
import GameForm from "./GameForm.jsx";
import HistoryCard from "./HistoryCard.jsx";
import RulesBox from "./RulesBox.jsx";      // EIGENE RulesBox, nicht shared!
import NewGameSession from "./NewGameSession.jsx";
import { buildFullCommentary } from "./commentary.js";

function makeDefaultForm(players) {
  return {
    type: "Normal",
    player: players[0] ?? "",
    won: true,
  };
}

const newgamePlugin = createPlugin({
  id: "newgame",
  label: "New Game",
  description: "Kurze Beschreibung · X Spieler · Y Cent",
  defaultStake: 1.00,
  showStake: true,
  playerCount: { min: 4, max: 4 },
  playerHint: "Hinweistext für die Session-Erstellung (z.B. Teameinteilung erklären).",
  gameTypes: GAME_TYPES,
  makeDefaultForm,
  calcSpielwert,
  resolveGame,
  calcBalances,
  FormComponent: GameForm,
  HistoryCardComponent: HistoryCard,
  RulesComponent: RulesBox,
  SessionComponent: NewGameSession,
  buildCommentary: buildFullCommentary,
});

export default newgamePlugin;
```

### `createPlugin()` Defaults

Felder die **nicht** gesetzt werden müssen (haben Defaults):

| Feld | Default |
|---|---|
| `showStake` | `false` |
| `playerCount` | `null` (keine Einschränkung) |
| `playerHint` | `null` |
| `FormComponent` | `null` |
| `HistoryCardComponent` | `null` |
| `RulesComponent` | `null` |
| `buildCommentary` | `null` |
| `calcBalances` | `null` |
| `makeDefaultForm` | `null` |
| `getSessionMeta` | `(s) => "${s.game_count} Spiele"` |
| `getArchiveConfirm` | `() => "Runde ins Archiv verschieben?"` |

---

## Schritt 10 — `src/games/index.js`

```js
import schafkopfPlugin from "./schafkopf/plugin.js";
import wattenPlugin from "./watten/plugin.js";
import doppelkopfPlugin from "./doppelkopf/plugin.js";
import skatPlugin from "./skat/plugin.js";
import wizardPlugin from "./wizard/plugin.js";
import newgamePlugin from "./newgame/plugin.js";  // ← hinzufügen

export { createPlugin } from "./shared/createPlugin.js";

export const GAME_PLUGINS = {
  schafkopf: schafkopfPlugin,
  watten: wattenPlugin,
  doppelkopf: doppelkopfPlugin,
  newgame: newgamePlugin,  // ← Position = Anzeigereihenfolge in der UI
  skat: skatPlugin,
  wizard: wizardPlugin,
};
```

`SessionList.jsx` und `SessionList`-Erstellung iterieren über `Object.values(GAME_PLUGINS)` — das neue Spiel erscheint automatisch als wählbarer Spieltyp.

---

## Schritt 11 — Tests

Tests **einen nach dem anderen** implementieren, nie alle auf einmal (Memory-Constraint).

Referenz-Testdatei: `tests/specs/watten.spec.js`

```js
import { test, expect } from '@playwright/test';

test('Normalspiel gewonnen — Balances korrekt', async ({ request }) => {
  const sessionId = crypto.randomUUID();
  await request.post('/api/sessions', {
    data: { id: sessionId, name: 'Test', game_type: 'newgame', players: ['A','B','C','D'], stake: 1 }
  });
  // ... Spiel eintragen, Balances prüfen
});
```

### Spieler-Persönlichkeits-Test

Nach dem Muster in `tests/specs/player-personality-tooltip.spec.js`:

```js
// 1. Spieler mit character_type anlegen (via request.post)
// 2. Gespeicherten character_type im API-Response verifizieren
// 3. Session erstellen, in UI öffnen
// 4. Avatar im Scoreboard hovern
// 5. Tooltip-Label mit PLAYER_PERSONALITIES[charType].label vergleichen
```

### Playwright-Fallstricke

**API-Calls in Tests:** Immer `request`-Fixture verwenden (nicht `page.evaluate` mit fetch). `page.evaluate` funktioniert nur, nachdem die Page navigiert wurde — relative URLs schlagen vorher fehl.

**Testserver-Caching:** Playwright startet den Testserver (`npm run dev:test`, Port 3003) einmal und behält ihn (`reuseExistingServer: true`). Nach Backend-Änderungen muss der Testserver neu gestartet werden:

```bash
lsof -ti:3003 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Locator-Strategie für Scoreboard-Karten:**

```js
// Spielername-div finden → eine Ebene hoch = playerCard
const playerCard = page.getByText(player.name, { exact: true }).locator('..');
// Avatar hovern (erster div = PlayerTooltip-Wrapper, kein crownBadge bei 0-Balance)
await playerCard.locator('div').first().hover();
```

---

## Deployment

```bash
npm run build
pm2 restart schafkopf-prod
```

Nach DB-/Backend-Änderungen zusätzlich den Dev-Server neustarten:

```bash
pm2 restart schafkopf-dev
```

---

## Checkliste

### Backend
- [ ] DB-Migrationen in `server/db.js` (try/catch, sinnvolle DEFAULTs)
- [ ] `parseGame` in `server/routes/games.js` (JSON.parse für alle JSON-Felder)
- [ ] POST + PATCH in `server/routes/games.js` (alle neuen Felder speichern)
- [ ] Falls Session-Optionen: `server/routes/sessions.js` POST + alle GETs
- [ ] `POST /api/players` speichert `character_type` und `voice_name`

### Frontend
- [ ] `logic.js`: `resolveGame`, `calcSpielwert`, `calcBalances` (Null-Sum prüfen!)
- [ ] `GameForm.jsx`: Live-Preview, spielspezifische Constraints im UI
- [ ] `HistoryCard.jsx`: nutzt `SharedHistoryCard`
- [ ] `RulesBox.jsx`: eigene Datei im Spiel-Ordner, korrekte Regeln
- [ ] `NewGameSession.jsx`: nutzt `GameSessionContainer`, liest Session-Optionen
- [ ] `commentary.js`: `PLAYER_REACTIONS` aus shared, Szenario-Keys korrekt
- [ ] `plugin.js`: `createPlugin()` mit allen relevanten Feldern
- [ ] `src/games/index.js`: Plugin in korrekter Reihenfolge eingetragen

### Tests
- [ ] Normalspiel gewonnen/verloren (Balances)
- [ ] Solo-Spiel (falls vorhanden)
- [ ] Spieler-Persönlichkeit wird gespeichert und im Tooltip angezeigt
- [ ] Bestehende Tests noch grün: `npm run test:e2e`

---

## Häufige Bugs

| Symptom | Ursache | Fix |
|---|---|---|
| Tooltip zeigt Kommentator-Persönlichkeit statt Spieler-Persönlichkeit | Scoreboard nutzt lokale Map mit Kommentator-Typ-Keys | `PLAYER_PERSONALITIES` aus shared importieren |
| Spieler-Reaktion zeigt immer gleichen Charakter | `PLAYER_REACTIONS` im Spiel selbst definiert, Keys sind Kommentator-Typen | Import aus `playerPersonalities.js` |
| `character_type` wird nicht gespeichert | `POST /api/players` hatte keine `character_type`-Spalte im INSERT | Alle Felder in INSERT aufnehmen |
| Spielwert-Beträge verdoppelt | `* 2` fälschlicherweise auf beide Team-Seiten | Null-Sum-Check: Summe aller changes = 0 |
| Sonderpunkte gehen nicht in Spielwert ein | `return { changes, spielwert: rate }` statt `spielwert: rate + sonderUnit * net` | `spielwert` vollständig berechnen |
| Tests finden Session nicht | `page.evaluate` vor `page.goto` — relative URLs scheitern | `request`-Fixture verwenden |
| Tests nutzen alte Server-Version | Testserver (Port 3003) cached Backend-Code | Prozess killen und neu starten |
| RulesBox zeigt Regeln eines anderen Spiels | Shared `RulesBox` aus `../../components/` importiert | Eigene `./RulesBox.jsx` im Spiel-Ordner erstellen |
