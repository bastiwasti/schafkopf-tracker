# Frontend-Komponenten

## Komponenten-Übersicht

Das Frontend ist in funktionale React-Komponenten unterteilt, die alle über Inline-Styles aus `styles.js` gestaltet werden. Die Anwendung verwendet keinen URL-Router, sondern state-basiertes Routing in `App.jsx`.

---

## App.jsx

### Rolle

Hauptkomponente und zentraler View-Router.

### Zustands-Management

```javascript
{
  sessions: [],           // Alle aktiven Runden
  registeredPlayers: [],  // Alle registrierten Spieler
  activeSession: null,   // Aktuell angezeigte Runde
  view: "sessions"        // "sessions" | "session" | "players" | "archive"
}
```

### View-Logik

| View-State | Komponente | Beschreibung |
|---|---|---|
| `"sessions"` | `SessionList` | Rundenübersicht, neue Runde erstellen |
| `"session"` | `SessionView` | Spielansicht einer Runde |
| `"players"` | `PlayerManager` | Spieler-Registry verwalten |
| `"archive"` | `ArchiveView` | Archivierte Runden und Spiele |

### Callbacks

- `handleSessionSelect(id)` – Runde öffnen
- `handleSessionCreated(session)` – Neue Runde zur Liste hinzufügen
- `handleSessionDeleted(id)` – Runde aus Liste entfernen
- `handleSessionUpdated(updated)` – Runde aktualisieren
- `handleSessionRestored()` – Runden nach Archiv-Wiederherstellung neu laden

---

## SessionList.jsx

### Rolle

Übersicht über alle aktiven Runden + Formular für neue Runden.

### Unterkomponenten

- `QuickAddPlayer` – Schneller Player-Add im Runden-Erstellungs-Formular
- `NewSessionForm` – Formular für neue Runden

### Features

- Rundenliste mit Metadaten (Name, Spiel, Spieler, Spielanzahl)
- Runde direkt ins Archiv verschieben (📦-Button)
- Neue Runde erstellen:
  - Namen eingeben
  - Spieltyp auswählen (Plugin-basiert)
  - Spieler aus Registry auswählen
  - Schnellen Player-Add direkt im Formular
  - Einsatz definieren

### API-Calls

- `GET /api/sessions` – Runden laden (in App.jsx)
- `POST /api/sessions` – Neue Runde erstellen
- `PATCH /api/sessions/:id` – Runde archivieren

---

## SessionView.jsx

### Rolle

Hauptansicht für eine aktive Spielsession.

### Unterkomponenten

- `BockBar` – Bock-Multiplikator anzeigen/ändern
- `Scoreboard` – Kontostände aller Spieler
- `CommentaryOverlay` – Kommentator-Overlay (bedingt angezeigt)
- Plugin-Komponenten: `FormComponent`, `HistoryCardComponent`, `RulesComponent`

### Zustands-Management

```javascript
{
  showForm: false,              // Formular anzeigen?
  showRules: false,             // Regeln anzeigen?
  form: null,                   // Aktueller Form-State
  editingGame: null,            // Spiel wird bearbeitet?
  pendingCommentary: null,     // Kommentar-Overlay anzeigen?
  showCommentatorSettings: false, // Kommentator-Settings anzeigen?
}
```

### Haupt-Features

1. **Spielspiel eintragen**
   - Formular öffnen/schließen
   - Spieltyp, Spieler, Ergebnis auswählen
   - Live-Vorschau des Spielwerts
   - Spiel eintragen → API-Aufruf

2. **Spiel bearbeiten**
   - Klick auf Spiel in History
   - Formular mit vorhandenen Daten öffnen
   - Änderungen speichern

3. **Spiel archivieren**
   - Einzeln aus der History entfernen
   - Bleibt im Archiv einsehbar

4. **Rückgängig (Undo)**
   - Löscht das letzte aktive Spiel

5. **Bock ändern**
   - Direkt über die BockBar

6. **Kommentator-Settings**
   - Aktivieren/Deaktivieren
   - Persönlichkeit auswählen
   - Stimme auswählen

### API-Calls

- `PATCH /api/sessions/:id` – Bock ändern
- `POST /api/sessions/:id/games` – Spiel eintragen
- `PATCH /api/sessions/:id/games/:gameId` – Spiel bearbeiten/archivieren
- `DELETE /api/sessions/:id/games/last` – Rückgängig

---

## Scoreboard.jsx

### Rolle

Anzeige der Kontostände aller Spieler.

### Features

- Spieler-Karten mit Avatar, Name, Kontostand, Spielanzahl
- Farbige Kontostände (grün = positiv, rot = negativ)
- Kronen-Badge für führenden Spieler (bei positivem Kontostand)

### Daten-Fluss

```javascript
const balances = plugin.calcBalances(activeHistory, players);

// Für jeden Spieler:
<playerCard>
  <crownBadge if isLeader>👑</crownBadge>
  <avatar>{avatar}</avatar>
  <name>{name}</name>
  <balance color={val > 0 ? green : val < 0 ? red : gray}>
    {val >= 0 ? "+" : ""}{val.toFixed(2)} €
  </balance>
  <games>{gameCount} Spiele</games>
</playerCard>
```

---

## BockBar.jsx

### Rolle

Anzeige und Änderung des Bock-Multiplikators.

### Features

- Visualisierung der aktuellen Bock-Stufe
- Buttons zum Erhöhen/Verringern
- Direkter API-Aufruf bei Änderung

---

## PlayerManager.jsx

### Rolle

Verwaltung der Spieler-Registry.

### Unterkomponenten

- `PlayerForm` – Spieler anlegen/bearbeiten
- `VoicePicker` – System-Stimmen auswählen

### Features

1. **Spielerliste**
   - Alle Spieler mit Avatar, Name, Charakter, Stimme
   - Bearbeiten (✏️) und Löschen (🗑️)

2. **Neuen Spieler anlegen**
   - Name eingeben
   - Avatar auswählen
   - Charakter-Typ wählen (für Reaktionen)
   - Stimme auswählen (für TTS)

3. **Spieler bearbeiten**
   - Alle Felder editieren
   - Name muss eindeutig bleiben

### API-Calls

- `GET /api/players` – Spieler laden
- `POST /api/players` – Spieler anlegen
- `PATCH /api/players/:id` – Spieler bearbeiten
- `DELETE /api/players/:id` – Spieler löschen

---

## ArchiveView.jsx

### Rolle

Verwaltung von archivierten Runden und Spielen.

### Unterkomponenten

- `ArchivedSessionCard` – Archivierte Runde
- `ArchivedGameCard` – Archiviertes Spiel

### Features

1. **Archivierte Runden**
   - Gesamte Rundenarchiv-Übersicht
   - Wiederherstellen (↩) oder endgültig löschen (🗑)

2. **Archivierte Spiele**
   - Gruppen nach Session
   - Einzelne Spiele wiederherstellen oder löschen

3. **Laden**
   - Paralleles Laden von Sessions und Games

### API-Calls

- `GET /api/sessions/archived` – Archivierte Runden laden
- `GET /api/sessions/archived/games` – Archivierte Spiele laden
- `PATCH /api/sessions/:id` – Runde wiederherstellen (archived_at = null)
- `DELETE /api/sessions/:id` – Runde endgültig löschen
- `PATCH /api/sessions/:id/games/:gameId` – Spiel wiederherstellen/löschen

---

## CommentaryOverlay.jsx

### Rolle

Overlay für den automatischen Kommentar nach einem Spiel.

### Features

- Kompletter Kommentar mit allen Segmenten
- Kommentator-Avatar und -Label
- Spieler-Reaktionen (optional) mit Avataren
- Automatisches TTS-Playback
- Schließen via Button, Klick außerhalb, oder nach Playback-Ende

### TTS-Integration

```javascript
useEffect(() => {
  const utter = new SpeechSynthesisUtterance(spokenText);
  utter.voice = selectedVoice;
  utter.pitch = personality.pitch;
  utter.rate = personality.rate;
  utter.lang = "de-DE";
  utter.onend = onClose;
  window.speechSynthesis.speak(utter);

  return () => { window.speechSynthesis.cancel(); };
}, []);
```

---

## Game-Komponenten (Plugin-basiert)

### GameForm.jsx (Schafkopf)

**Rolle:** Formular zur Spieleingabe.

**Features:**
- Spieltyp auswählen (Sauspiel, Solo, Wenz, Touts)
- Spieler auswählen
- Gewinn/Verlust toggeln
- Flags setzen (Schneider, Schwarz)
- Laufende angeben
- Klopfer auswählen
- Live-Vorschau des Spielwerts

### HistoryCard.jsx (Schafkopf)

**Rolle:** Anzeige eines Spiels im Verlauf.

**Features:**
- Spiel-Round, Typ, Ergebnis
- Spieler, Partner (bei Sauspiel)
- Spielwert-Badge
- Bearbeiten (✏️) und Archivieren (📦)

---

## AvatarPicker.jsx

### Rolle

Emoji-Auswahl für Avatare.

### Features

- Grid mit 40+ Emojis
- Hover-Effekte
- Direkte Auswahl

---

## RulesBox.jsx

### Rolle

Anzeige der Spielregeln (Plugin-basiert).

### Features

- Klappbare Regel-Referenz
- Fokus auf aktuelle Session (Schafkopf)
- Tabelle mit Spieltypen und Multiplikatoren

---

## Hooks

### useCommentatorSettings()

**Rolle:** localStorage-basierte Persistenz der Kommentator-Einstellungen.

**Rückgabe:**
```javascript
{
  personality: "dramatic",
  voice: "Anna",
  enabled: true,
  setPersonality,
  setVoice,
  setEnabled
}
```

**Keys:**
- `schafkopf-commentary-personality`
- `schafkopf-commentary-voice`
- `schafkopf-commentary-enabled`

---

## Styling (styles.js)

Alle Styles sind in einem zentralen JavaScript-Objekt definiert:

```javascript
export default {
  // Layout
  container: { maxWidth: 480, margin: "0 auto", ... },
  header: { padding: "20px 0", ... },

  // Typography
  title: { fontSize: 32, fontWeight: 800, color: "#2c1810", ... },
  subtitle: { fontSize: 14, color: "#7a6840", ... },

  // Buttons
  btnPrimary: { background: "#2c1810", color: "#fdf6e3", ... },
  btnSecondary: { background: "#e8dcc4", ... },
  btnUndo: { background: "#9d0208", color: "#fdf6e3", ... },

  // ... viele weitere
};
```

### Farbpalette

| Farbe | Wert | Verwendung |
|---|---|---|
| Creme | `#fdf6e3` | Hintergrund |
| Dunkelbraun | `#2c1810` | Text, primäre Buttons |
| Gold | `#8b6914` | Akzente, Überschriften |
| Grün | `#2d6a4f` | Gewonnen, Bestätigung |
| Rot | `#9d0208` | Verloren, Löschen |

---

## Datenfluss-Beispiel: Spiel eintragen

```
1. User klickt auf "＋ Neues Spiel"
   → setShowForm(true)

2. User füllt Formular aus
   → setForm(formState)
   → Live-Berechnung: calcSpielwert(formState)

3. User klickt auf Submit
   → resolveGame(formState)
   → API: POST /api/sessions/:id/games

4. Response kommt zurück
   → onSessionUpdated({ ...session, history: [...history, newGame] })
   → setShowForm(false)

5. Wenn Kommentator aktiv:
   → setPendingCommentary(newGame)
   → CommentaryOverlay wird angezeigt
   → TTS-Playback startet

6. Nach Playback-Ende:
   → setPendingCommentary(null)
   → Overlay verschwindet
```
