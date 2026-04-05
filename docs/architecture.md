# Architektur

## Überblick

Der Schafkopf Tracker ist eine klassische Client-Server-Architektur:

```
Browser (React + Vite)
        │  fetch() über HTTP
        ▼
Express-Server
        │  better-sqlite3
        ▼
SQLite-Datenbank
```

Es gibt drei Umgebungen:

| | Lokal | Dev (VM) | Prod (VM) |
|---|---|---|---|
| Frontend | Vite :5173 | Nginx → dist/ | Nginx → dist/ |
| Backend | Express :3001 | Express :3001 (PM2) | Express :3002 (PM2) |
| Datenbank | tracker-dev.db | tracker-dev.db | tracker.db |

Im lokalen Entwicklungsmodus proxied Vite alle `/api/*`-Anfragen automatisch an den Express-Server auf Port 3001. Im Produktionsbetrieb liefert Nginx die gebauten Vite-Assets aus (`dist/`) und proxied `/api` an den jeweiligen Express-Server.

> **Regel:** Neue Features werden ausschließlich auf Dev entwickelt und getestet. Prod enthält nur echte Spielstände.

---

## Datenbankschema

### Tabelle `sessions`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | TEXT PK | UUID |
| `name` | TEXT | Anzeigename der Runde |
| `game_type` | TEXT | Plugin-ID: `"schafkopf"`, `"watten"`, `"doppelkopf"`, `"skat"`, `"wizard"` |
| `players` | TEXT | JSON-Array von Spielernamen |
| `stake` | REAL | Grundeinsatz in Euro |
| `bock` | INTEGER | Aktueller Bock-Multiplikator ≥1 (Schafkopf/Doppelkopf) |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Archiviert wenn gesetzt |
| `game_count` | INTEGER | Zähler für Spiele/Runden |
| `schafkopf_options` | TEXT | JSON `{}` — reserviert für Schafkopf-Optionen |
| `doppelkopf_options` | TEXT | JSON `{ "solo_value": 3 }` — Doppelkopf Solo-Wert |
| `watten_team1_players` | TEXT \| NULL | JSON-Array Spielernamen Team 1 (nur Watten) |
| `watten_team2_players` | TEXT \| NULL | JSON-Array Spielernamen Team 2 (nur Watten) |
| `watten_target_score` | INTEGER \| NULL | Zielwert 13 oder 15 (nur Watten, Default 15) |
| `wizard_status` | TEXT \| NULL | `"completed"` wenn Wizard-Session beendet |
| `game_variant` | TEXT | Skat-Variante (nur Skat) |
| `skat_bock_level` | INTEGER | Skat-Bock-Level |

### Tabelle `players`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | TEXT PK | UUID |
| `name` | TEXT UNIQUE | Anzeigename |
| `avatar` | TEXT | Emoji-Zeichen (Standard: `🃏`) |
| `character_type` | TEXT | Spieler-Charakter für Reaktionen (`optimist`, `pessimist`, etc.) |
| `voice_name` | TEXT \| NULL | Name der System-TTS-Stimme |
| `created_at` | TEXT | ISO-Timestamp |

> **Hinweis:** `App.jsx` mappt beim Laden `voice_name → voice`, damit alle UI-Komponenten (`CommentaryOverlay`, `PlayerTooltip`) einheitlich `p.voice` verwenden können.

### Tabelle `games` (geteilt von Schafkopf, Doppelkopf, Skat)

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INTEGER PK | Auto-Increment |
| `session_id` | TEXT FK | Referenz auf `sessions.id` (CASCADE DELETE) |
| `seq` | INTEGER | Laufende Nummer innerhalb der Session |
| `type` | TEXT | Spieltyp (z.B. `"Normal"`, `"Solo"`, `"Sauspiel"`) |
| `player` | TEXT | Ansagender Spieler |
| `partner` | TEXT \| NULL | Partner (Sauspiel / Doppelkopf Normal) |
| `won` | INTEGER | 0 oder 1 (Boolean) |
| `schneider` | INTEGER | 0 oder 1 |
| `schwarz` | INTEGER | 0 oder 1 |
| `laufende` | INTEGER | Anzahl der Laufenden |
| `bock` | INTEGER | Bock-Wert zum Zeitpunkt des Spiels |
| `klopfer` | TEXT | JSON-Array von Spielernamen |
| `spielwert` | REAL | Berechneter Spielwert in Euro |
| `changes` | TEXT | JSON-Objekt `{ spielername: betrag }` |
| `kontra` | INTEGER | 0 oder 1 — Kontra-Ansage (Doppelkopf) |
| `ansage` | TEXT \| NULL | `"keine30"` / `"keine60"` / `"keine90"` / `"schwarz"` (Doppelkopf) |
| `re_sonderpunkte` | TEXT | JSON `{ fuchs, doppelkopf, karlchen }` — Spieler-Sonderpunkte |
| `kontra_sonderpunkte` | TEXT | JSON `{ fuchs, doppelkopf, karlchen }` — Gegner-Sonderpunkte |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Archiviert wenn gesetzt |

### Tabelle `wizard_rounds`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INTEGER PK | Auto-Increment |
| `session_id` | TEXT FK | Referenz auf `sessions.id` |
| `round_number` | INTEGER | Rundennummer (1-basiert, eindeutig pro Session) |
| `predictions` | TEXT | JSON `{ spielername: vorhersage }` |
| `tricks` | TEXT | JSON `{ spielername: tatsächliche_stiche }` |
| `scores` | TEXT | JSON `{ spielername: punkte }` — serverseitig berechnet |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Reserviert |

### Tabelle `watten_games` / `watten_rounds`

Siehe `docs/game-logic.md` → Watten-Abschnitt.

### Migrationen

Neue Spalten werden per `try/catch`-Pattern nachträglich hinzugefügt:

```js
try { db.exec('ALTER TABLE games ADD COLUMN kontra INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec("ALTER TABLE games ADD COLUMN ansage TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE games ADD COLUMN re_sonderpunkte TEXT NOT NULL DEFAULT '{}'"); } catch (e) {}
try { db.exec("ALTER TABLE games ADD COLUMN kontra_sonderpunkte TEXT NOT NULL DEFAULT '{}'"); } catch (e) {}
try { db.exec("ALTER TABLE sessions ADD COLUMN doppelkopf_options TEXT DEFAULT '{}'"); } catch (e) {}
```

---

## Plugin-Architektur

Alle Spiele sind Plugins, die über `createPlugin()` erzeugt und in `src/games/index.js` registriert werden. Die Reihenfolge der Keys bestimmt die Anzeigereihenfolge in der UI.

```js
// src/games/index.js
export const GAME_PLUGINS = {
  schafkopf: schafkopfPlugin,
  watten:    wattenPlugin,
  doppelkopf: doppelkopfPlugin,
  skat:      skatPlugin,
  wizard:    wizardPlugin,
};
```

### `createPlugin()` — Felder und Defaults

```js
createPlugin({
  // Pflicht
  id: string,
  label: string,
  description: string,
  defaultStake: number,

  // Optional mit Defaults
  showStake: false,
  playerCount: null,          // { min, max } — Validierung bei Session-Erstellung
  playerHint: null,           // Erklärungstext im Session-Erstellungsformular
  FormComponent: null,
  HistoryCardComponent: null,
  RulesComponent: null,
  buildCommentary: null,
  calcBalances: null,
  makeDefaultForm: null,
  getSessionMeta: (s) => `${s.game_count} Spiele`,
  getArchiveConfirm: () => "Runde ins Archiv verschieben?",
})
```

### Shared-Komponenten

| Datei | Beschreibung |
|---|---|
| `src/games/shared/createPlugin.js` | Factory mit Defaults |
| `src/games/shared/balanceCalculator.js` | Generischer `calcBalances` |
| `src/games/shared/HistoryCard.jsx` | Wiederverwendbare History-Karte |
| `src/games/shared/GameSessionContainer.jsx` | Generischer Session-Container (Schafkopf, Doppelkopf, Skat) |
| `src/games/shared/commentary.js` | `PERSONALITIES` + `pickRandom` + `fill` |
| `src/games/shared/playerPersonalities.js` | `PLAYER_PERSONALITIES` + `PLAYER_REACTIONS` (10 Charaktere) |
| `src/components/PlayerTooltip.jsx` | Avatar-Hover-Tooltip mit Persönlichkeit + Stimme |

### Session-Container-Entscheid

- **Schafkopf, Doppelkopf, Skat:** nutzen `GameSessionContainer` — standardisierter Container mit History, Form, Commentary, Rules-Toggle
- **Watten:** eigenes UI (`WattenSession.jsx`) — zu unterschiedliche Struktur (Teamspiel, Gesprächsrunden)
- **Wizard:** eigenes UI (`ScoreSheet.jsx`) — Score-Sheet-Logik mit Phasen (Vorhersage → Stiche → Speichern)

---

## Datenfluss: Spiel eintragen (Schafkopf / Doppelkopf)

```
1. User füllt GameForm aus
2. calcSpielwert() [Frontend, live] → zeigt Vorschau
3. Klick "Spiel eintragen"
   resolveGame() [Frontend] → { changes, spielwert }
4. POST /api/sessions/:id/games
5. Backend: INSERT INTO games, seq = MAX(seq)+1
6. Response: vollständiges Game-Objekt
7. onSessionUpdated() → history lokal aktualisiert, Scoreboard neu berechnet
8. CommentaryOverlay erscheint (falls aktiviert)
```

---

## View-Routing

Kein URL-Router — state-basiertes Routing in `App.jsx`:

```
view === "sessions"  → SessionList
view === "session"   → SessionView → GameSessionContainer (Schafkopf/Doppelkopf/Skat)
                                  → WizardScoreSheet (Wizard)
                                  → WattenSession (Watten)
view === "players"   → PlayerManager
view === "archive"   → ArchiveView
```

---

## Styling

Alle Styles in `src/components/styles.js` als Inline-Styles. Kein CSS-Framework.

| Farbe | Wert | Verwendung |
|---|---|---|
| Creme | `#fdf6e3` | Hintergrund |
| Dunkelbraun | `#2c1810` | Text, primäre Buttons |
| Gold | `#8b6914` | Akzente, Überschriften |
| Grün | `#2d6a4f` | Gewonnen, Bestätigung |
| Rot | `#9d0208` | Verloren, Löschen |
| Blau | `#1976d2` | Wizard-Aktionen |
