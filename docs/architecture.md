# Architektur

## Überblick

Der Schafkopf Tracker ist eine klassische Client-Server-Architektur:

```
Browser (React + Vite)
        │  fetch() über HTTP
        ▼
Express-Server (Port 3001)
        │  better-sqlite3
        ▼
SQLite-Datenbank (data/tracker.db)
```

Im Entwicklungsmodus proxied Vite alle `/api/*`-Anfragen automatisch an den Express-Server. Im Produktionsbetrieb liefert Express die gebauten Vite-Assets aus.

---

## Datenbankschema

### Tabelle `sessions`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | TEXT PK | UUID |
| `name` | TEXT | Anzeigename der Runde |
| `game_type` | TEXT | Plugin-ID (z. B. `"schafkopf"`) |
| `players` | TEXT | JSON-Array von Spielernamen |
| `stake` | REAL | Grundeinsatz in Euro |
| `bock` | INTEGER | Aktueller Bock-Multiplikator (≥1) |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Archiviert wenn gesetzt |

### Tabelle `players`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | TEXT PK | UUID |
| `name` | TEXT UNIQUE | Anzeigename |
| `avatar` | TEXT | Emoji-Zeichen (Standard: `🃏`) |
| `character_type` | TEXT | Kommentator-Persönlichkeit des Spielers |
| `voice_name` | TEXT \| NULL | Name der System-Stimme für TTS |
| `created_at` | TEXT | ISO-Timestamp |

### Tabelle `games`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INTEGER PK | Auto-Increment |
| `session_id` | TEXT FK | Referenz auf `sessions.id` (CASCADE DELETE) |
| `seq` | INTEGER | Laufende Nummer innerhalb der Runde |
| `type` | TEXT | Spieltyp: `Sauspiel`, `Solo`, `Wenz`, `Solo Tout`, `Wenz Tout` |
| `player` | TEXT | Ansagender Spieler |
| `partner` | TEXT \| NULL | Partner (nur bei Sauspiel) |
| `won` | INTEGER | 0 oder 1 (Boolean) |
| `schneider` | INTEGER | 0 oder 1 |
| `schwarz` | INTEGER | 0 oder 1 |
| `laufende` | INTEGER | Anzahl der Laufenden |
| `bock` | INTEGER | Bock-Wert zum Zeitpunkt des Spiels |
| `klopfer` | TEXT | JSON-Array von Spielernamen |
| `spielwert` | REAL | Berechneter Spielwert in Euro |
| `changes` | TEXT | JSON-Objekt `{spielername: betrag}` |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Archiviert wenn gesetzt |

### Migrationen

Neue Spalten werden per `try/catch`-Pattern nachträglich hinzugefügt (SQLite unterstützt kein `IF NOT EXISTS` bei `ALTER TABLE`):

```js
try { db.exec('ALTER TABLE sessions ADD COLUMN archived_at TEXT'); } catch (e) {}
```

---

## Datenfluss: Spiel eintragen

```
1. User füllt GameForm aus
        │
2. calcSpielwert() [Frontend, live]
   → Zeigt Vorschau in Echtzeit
        │
3. Klick auf "Spiel eintragen"
   resolveGame() [Frontend]
   → Berechnet { changes, spielwert }
        │
4. POST /api/sessions/:id/games
   Body: { type, player, partner, won,
           schneider, schwarz, laufende,
           bock, klopfer, spielwert, changes }
        │
5. Backend: INSERT INTO games
   seq = MAX(seq)+1 für diese Session
        │
6. Response: vollständiges Game-Objekt
        │
7. onSessionUpdated() [App.jsx]
   → history wird lokal aktualisiert
   → Scoreboard neu berechnet (calcBalances)
        │
8. CommentaryOverlay erscheint (falls aktiviert)
   buildFullCommentary() → Text + Segmente
   SpeechSynthesisUtterance → TTS
```

---

## Soft-Delete (Archiv-Pattern)

Weder Runden noch Spiele werden sofort gelöscht. Stattdessen wird ein `archived_at`-Timestamp gesetzt:

```
Aktiv:      archived_at IS NULL
Archiviert: archived_at = "2025-04-03T10:00:00.000Z"
```

**Runden archivieren:** `PATCH /api/sessions/:id` mit `{ archived_at: <iso> }`  
**Runden wiederherstellen:** `PATCH /api/sessions/:id` mit `{ archived_at: null }`  
**Endgültig löschen:** `DELETE /api/sessions/:id` (löscht auch alle Spiele via CASCADE)

Einzelne Spiele funktionieren analog über `PATCH /api/sessions/:id/games/:gameId`.

Die **Kontostand-Berechnung** (`calcBalances`) und der **Spielverlauf** ignorieren archivierte Spiele konsequent (`history.filter(g => !g.archived_at)`).

---

## Plugin-Architektur

Das Spiellogik-System ist plugin-basiert, sodass zukünftig weitere Kartenspiele ergänzt werden können.

```js
// src/games/index.js
export const GAME_PLUGINS = {
  schafkopf: schafkopfPlugin,
  // weiteres Spiel: meinePlugin,
};
```

Jedes Plugin exportiert ein Objekt mit:

```js
{
  id: string,
  label: string,
  description: string,
  defaultStake: number,

  // Logik-Funktionen
  makeDefaultForm: (players) => formState,
  calcSpielwert: (formState) => number,
  resolveGame: (formState) => { changes, spielwert },
  calcBalances: (history, players) => { [name]: number },

  // React-Komponenten
  FormComponent,
  HistoryCardComponent,
  RulesComponent,
}
```

`SessionView` und `SessionList` arbeiten ausschließlich gegen diese Plugin-Schnittstelle und kennen kein spielspezifisches Detail.

---

## View-Routing

Die App verwendet keinen URL-Router, sondern einfaches State-basiertes Routing in `App.jsx`:

```
view === "sessions"  → SessionList
view === "session"   → SessionView
view === "players"   → PlayerManager
view === "archive"   → ArchiveView
```

Navigiert wird durch Callbacks (`onManagePlayers`, `onBack`, etc.), die den `view`-State in `App.jsx` setzen.

---

## Styling

Alle Styles sind in `src/components/styles.js` als einzelnes JavaScript-Objekt definiert und werden als Inline-Styles über `style={styles.xyz}` angewendet. Es gibt kein CSS-Framework und keine CSS-Dateien (abgesehen von einer minimalen `index.css` für box-sizing/reset).

**Farbpalette:**
| Variable | Wert | Verwendung |
|---|---|---|
| Creme | `#fdf6e3` | Hintergrund |
| Dunkelbraun | `#2c1810` | Text, primäre Buttons |
| Gold | `#8b6914` | Akzente, Überschriften |
| Grün | `#2d6a4f` | Gewonnen, Bestätigung |
| Rot | `#9d0208` | Verloren, Löschen |
