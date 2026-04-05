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
| `game_type` | TEXT | Plugin-ID: `"schafkopf"`, `"wizard"` oder `"watten"` |
| `players` | TEXT | JSON-Array von Spielernamen |
| `stake` | REAL | Grundeinsatz in Euro (nur Schafkopf relevant) |
| `bock` | INTEGER | Aktueller Bock-Multiplikator ≥1 (nur Schafkopf) |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Archiviert wenn gesetzt (nur Schafkopf) |
| `game_count` | INTEGER | Zähler für Spiele/Runden |
| `watten_team1_players` | TEXT \| NULL | JSON-Array Spielernamen Team 1 (nur Watten) |
| `watten_team2_players` | TEXT \| NULL | JSON-Array Spielernamen Team 2 (nur Watten) |
| `watten_target_score` | INTEGER \| NULL | Zielwert 13 oder 15 (nur Watten, Default 15) |

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

### Tabelle `watten_games`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INTEGER PK | Auto-Increment |
| `session_id` | TEXT FK | Referenz auf `sessions.id` (CASCADE DELETE) |
| `game_number` | INTEGER | Laufende Spielnummer innerhalb der Session |
| `winner_team` | TEXT | `"team1"` oder `"team2"` |
| `final_score_team1` | INTEGER | Endstand Team 1 |
| `final_score_team2` | INTEGER | Endstand Team 2 |
| `is_completed` | BOOLEAN | 0 = aktiv, 1 = abgeschlossen |
| `bommerl_team` | TEXT \| NULL | Team das den Bommerl (Niederlage) bekam |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Soft-Delete |

### Tabelle `watten_rounds`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | INTEGER PK | Auto-Increment |
| `session_id` | TEXT FK | Referenz auf `sessions.id` (CASCADE DELETE) |
| `game_id` | INTEGER FK | Referenz auf `watten_games.id` (CASCADE DELETE) |
| `round_number` | INTEGER | Laufende Nummer über alle Runden der Session |
| `winning_team` | TEXT | `"team1"` oder `"team2"` |
| `points` | INTEGER | Punkte dieser Runde (2–5, bei Gespannt fix 3) |
| `is_machine` | BOOLEAN | Maschine (alle 3 kritischen Karten) |
| `is_spannt_played` | BOOLEAN | Reserviert (derzeit nicht genutzt) |
| `is_gegangen` | BOOLEAN | Gegangen (Team hat aufgegeben) |
| `tricks_team1` | INTEGER | Stiche Team 1 (optional, 0–5) |
| `tricks_team2` | INTEGER | Stiche Team 2 (optional, 0–5) |
| `created_at` | TEXT | ISO-Timestamp |
| `archived_at` | TEXT \| NULL | Soft-Delete |

### Migrationen

Neue Spalten werden per `try/catch`-Pattern nachträglich hinzugefügt (SQLite unterstützt kein `IF NOT EXISTS` bei `ALTER TABLE`):

```js
try { db.exec('ALTER TABLE sessions ADD COLUMN archived_at TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE sessions ADD COLUMN wizard_status TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE games ADD COLUMN archived_at TEXT'); } catch (e) {}
try { db.exec("ALTER TABLE players ADD COLUMN character_type TEXT DEFAULT 'dramatic'"); } catch (e) {}
try { db.exec('ALTER TABLE players ADD COLUMN voice_name TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE wizard_rounds ADD COLUMN archived_at TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE sessions ADD COLUMN game_count INTEGER DEFAULT 0'); } catch (e) {}
// Watten-Migrations
try { db.exec('ALTER TABLE sessions ADD COLUMN watten_target_score INTEGER DEFAULT 15'); } catch (e) {}
try { db.exec('ALTER TABLE sessions ADD COLUMN watten_team1_players TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE sessions ADD COLUMN watten_team2_players TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE watten_games ADD COLUMN is_completed BOOLEAN DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE watten_games ADD COLUMN bommerl_team TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE watten_rounds ADD COLUMN is_gegangen BOOLEAN DEFAULT 0'); } catch (e) {}
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
  watten: wattenPlugin,
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

### Watten-Plugin

Schlankes Plugin — die gesamte UI-Logik liegt in `WattenSession.jsx` und seinen Sub-Komponenten. Das Plugin liefert hauptsächlich Metadaten und Session-Erstellungs-Konfiguration (Team-Auswahl statt einfacher Spieler-Auswahl):

```js
{
  id: "watten",
  label: "Watten",
  description: "...",
  defaultStake: 0,
  requiresTeams: true,  // Erfordert Team-Konfiguration in SessionList
}
```

`SessionView.jsx` erkennt `game_type === "watten"` und rendert direkt `<WattenSession>`.

**Backend-Routen:** `server/routes/watten/games.js` — enthält alle Watten-Endpunkte für Runden und Spiele. Automatische Game-Verwaltung: Neue Runde erstellt automatisch ein aktives Spiel falls keines existiert. Wenn `targetScore` erreicht, wird das Spiel automatisch abgeschlossen.

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
