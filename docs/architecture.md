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

Im Entwicklungsmodus proxied Vite alle `/api/*`-Anfragen automatisch an den Express-Server. Im Produktionsbetrieb liefert Nginx die gebauten Vite-Assets aus (`dist/`) und proxied `/api` an den Express-Server.

---

## Datenbankschema

### Tabelle `sessions`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | TEXT PK | UUID |
| `name` | TEXT | Anzeigename der Runde |
| `game_type` | TEXT | Plugin-ID: `"schafkopf"` oder `"wizard"` |
| `players` | TEXT | JSON-Array von Spielernamen |
| `stake` | REAL | Grundeinsatz in Euro (nur Schafkopf relevant) |
| `bock` | INTEGER | Aktueller Bock-Multiplikator ≥1 (nur Schafkopf) |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Archiviert wenn gesetzt (nur Schafkopf) |

### Tabelle `players`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | TEXT PK | UUID |
| `name` | TEXT UNIQUE | Anzeigename |
| `avatar` | TEXT | Emoji-Zeichen (Standard: `🃏`) |
| `character_type` | TEXT | Kommentator-Persönlichkeit des Spielers für Reaktionen |
| `voice_name` | TEXT \| NULL | Name der System-TTS-Stimme |
| `created_at` | TEXT | ISO-Timestamp |

### Tabelle `games` (Schafkopf)

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INTEGER PK | Auto-Increment |
| `session_id` | TEXT FK | Referenz auf `sessions.id` (CASCADE DELETE) |
| `seq` | INTEGER | Laufende Nummer innerhalb der Session |
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
| `changes` | TEXT | JSON-Objekt `{ spielername: betrag }` |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Archiviert wenn gesetzt |

### Tabelle `wizard_rounds`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INTEGER PK | Auto-Increment |
| `session_id` | TEXT FK | Referenz auf `sessions.id` |
| `round_number` | INTEGER | Rundennummer (1-basiert, eindeutig pro Session) |
| `predictions` | TEXT | JSON-Objekt `{ spielername: vorhersage }` |
| `tricks` | TEXT | JSON-Objekt `{ spielername: tatsächliche_stiche }` |
| `scores` | TEXT | JSON-Objekt `{ spielername: punkte }` — vom Server berechnet |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Reserviert (derzeit nicht genutzt) |

### Migrationen

Neue Spalten werden per `try/catch`-Pattern nachträglich hinzugefügt (SQLite unterstützt kein `IF NOT EXISTS` bei `ALTER TABLE`):

```js
try { db.exec('ALTER TABLE sessions ADD COLUMN archived_at TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE players ADD COLUMN character_type TEXT DEFAULT "dramatic"'); } catch (e) {}
try { db.exec('ALTER TABLE players ADD COLUMN voice_name TEXT'); } catch (e) {}
```

---

## Datenfluss: Schafkopf-Spiel eintragen

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
   buildFullCommentary() → Segmente + spokenText
   SpeechSynthesisUtterance → TTS
```

## Datenfluss: Wizard-Runde eintragen

```
1. User klickt "Starten" für die nächste Runde
   → Phase: 'prediction'

2. User trägt Vorhersagen ein (Dropdowns)
   → roundsData[roundNum].predictions

3. User klickt "Weiter →"
   → Phase: 'tricks'

4. User trägt tatsächliche Stiche ein
   → roundsData[roundNum].tricks

5. User klickt "✓ Speichern"
   POST /api/sessions/:id/wizard-rounds
   Body: { predictions, tricks }
        │
6. Backend: Scores berechnen, INSERT INTO wizard_rounds
   round_number = MAX(round_number)+1
        │
7. Response: vollständiges Round-Objekt mit scores
        │
8. onSessionUpdated() [App.jsx]
   → history wird lokal aktualisiert
   → Scoreboard neu berechnet (Summe aller scores)
        │
9. CommentaryOverlay erscheint (falls aktiviert)
   buildWizardCommentary() → Segmente + spokenText
   SpeechSynthesisUtterance → TTS
```

---

## Wizard-Synchronisation

Der `GET /api/sessions/:id`-Endpunkt gibt nur `games` (Schafkopf), nicht `wizard_rounds` zurück. Deshalb lädt `ScoreSheet.jsx` beim Mount die eigenen Runden separat:

```js
useEffect(() => {
  fetch(`/api/sessions/${session.id}/wizard-rounds`)
    .then(r => r.json())
    .then(rounds => {
      if (rounds.length > 0) onSessionUpdated({ ...session, history: rounds });
    });
}, [session.id]);
```

Das stellt sicher, dass `round_number` mit dem tatsächlichen DB-Stand übereinstimmt und neue Runden korrekt nummeriert werden.

---

## Soft-Delete (Archiv-Pattern)

Nur bei Schafkopf verwendet. Weder Runden noch Spiele werden sofort gelöscht:

```
Aktiv:      archived_at IS NULL
Archiviert: archived_at = "2025-04-03T10:00:00.000Z"
```

**Runden archivieren:** `PATCH /api/sessions/:id` mit `{ archived_at: <iso> }`  
**Runden wiederherstellen:** `PATCH /api/sessions/:id` mit `{ archived_at: null }`  
**Endgültig löschen:** `DELETE /api/sessions/:id` (löscht auch alle Spiele via CASCADE)

Einzelne Spiele funktionieren analog über `PATCH /api/sessions/:id/games/:gameId`.

Die **Kontostand-Berechnung** (`calcBalances`) und der **Spielverlauf** ignorieren archivierte Spiele (`history.filter(g => !g.archived_at)`).

Wizard verwendet **kein Soft-Delete** — dort gibt es nur Undo (löscht die letzte Runde direkt via `DELETE /api/sessions/:id/wizard-rounds/last`).

---

## Plugin-Architektur

Das Spiellogik-System ist plugin-basiert. Aktuell registrierte Plugins:

```js
// src/games/index.js
export const GAME_PLUGINS = {
  schafkopf: schafkopfPlugin,
  wizard: wizardPlugin,
};
```

### Schafkopf-Plugin

Vollständiges Plugin mit eigener Logik, Formular, History-Karte, Regelbox und Kommentator.

```js
{
  id: "schafkopf",
  label: "Schafkopf",
  makeDefaultForm, calcSpielwert, resolveGame, calcBalances,
  FormComponent, HistoryCardComponent, RulesComponent,
}
```

### Wizard-Plugin

Schlankes Plugin — die Spiellogik liegt im Backend (`server/routes/wizard/rounds.js`) und in `ScoreSheet.jsx`. Das Plugin liefert hauptsächlich Metadaten:

```js
{
  id: "wizard",
  label: "Wizard",
  description: "...",
  defaultStake: 0,
  // Keine FormComponent, HistoryCardComponent — UI liegt in ScoreSheet.jsx
}
```

`SessionView.jsx` erkennt `game_type === "wizard"` und rendert statt der Schafkopf-UI direkt `<WizardScoreSheet>`.

---

## View-Routing

Die App verwendet keinen URL-Router, sondern einfaches State-basiertes Routing in `App.jsx`:

```
view === "sessions"  → SessionList
view === "session"   → SessionView (Schafkopf) oder WizardScoreSheet
view === "players"   → PlayerManager
view === "archive"   → ArchiveView
```

---

## Styling

Alle Styles sind in `src/components/styles.js` als einzelnes JavaScript-Objekt definiert und werden als Inline-Styles angewendet. Kein CSS-Framework, keine CSS-Dateien (abgesehen von einer minimalen `index.css`).

**Farbpalette:**

| Farbe | Wert | Verwendung |
|---|---|---|
| Creme | `#fdf6e3` | Hintergrund |
| Dunkelbraun | `#2c1810` | Text, primäre Buttons |
| Gold | `#8b6914` | Akzente, Überschriften |
| Grün | `#2d6a4f` | Gewonnen, Bestätigung |
| Rot | `#9d0208` | Verloren, Löschen |
| Blau | `#1976d2` | Wizard-Aktionen (Starten) |
