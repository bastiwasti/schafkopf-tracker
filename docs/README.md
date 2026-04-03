# Schafkopf Tracker — Dokumentation

Schafkopf Tracker ist eine Web-App zum Erfassen und Auswerten von Schafkopf-Runden. Sie läuft lokal im Browser und benötigt keinen externen Dienst.

## Inhaltsverzeichnis

| Datei | Inhalt |
|---|---|
| [README.md](./README.md) | Diese Datei — Überblick & Schnellstart |
| [architecture.md](./architecture.md) | Systemarchitektur, Datenbankschema, Datenfluss |
| [api.md](./api.md) | REST-API-Referenz (alle Endpunkte) |
| [game-logic.md](./game-logic.md) | Spielregeln, Wertberechnung, Plugin-System |
| [commentary.md](./commentary.md) | Kommentator-System, Persönlichkeiten, TTS |
| [frontend.md](./frontend.md) | Komponentenübersicht & UI-Struktur |

---

## Schnellstart

```bash
npm install
npm run dev
```

Die App öffnet sich unter `http://localhost:5173`, der API-Server läuft auf Port `3001`.

---

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Frontend | React 19, Vite |
| Backend | Express 5, Node.js |
| Datenbank | SQLite 3 (better-sqlite3) |
| Styling | Inline-CSS (styles.js), Playfair Display |
| TTS | Web Speech API (browsernativ, kein API-Key) |

---

## Projektstruktur

```
schafkopf-tracker/
├── server/
│   ├── index.js              # Express-Einstiegspunkt, Port 3001
│   ├── db.js                 # SQLite-Schema & Migrationen
│   └── routes/
│       ├── sessions.js       # Runden-Endpunkte
│       ├── games.js          # Spiel-Endpunkte
│       └── players.js        # Spieler-Endpunkte
├── src/
│   ├── App.jsx               # View-Router (sessions / session / players / archive)
│   ├── components/
│   │   ├── SessionList.jsx   # Rundenübersicht & neue Runde
│   │   ├── SessionView.jsx   # Spielansicht & Formular
│   │   ├── Scoreboard.jsx    # Kontostand-Anzeige
│   │   ├── BockBar.jsx       # Bock-Multiplikator
│   │   ├── PlayerManager.jsx # Spieler-Registry
│   │   ├── ArchiveView.jsx   # Archiv-Verwaltung
│   │   ├── CommentaryOverlay.jsx # Kommentator-Overlay
│   │   ├── AvatarPicker.jsx  # Emoji-Auswahl
│   │   └── styles.js         # Zentrale Style-Definitionen
│   ├── games/
│   │   ├── index.js          # Plugin-Registry
│   │   └── schafkopf/
│   │       ├── plugin.js     # Plugin-Definition
│   │       ├── logic.js      # Wertberechnung
│   │       ├── GameForm.jsx  # Spieleingabe
│   │       ├── HistoryCard.jsx # Spielverlauf-Karte
│   │       ├── commentary.js # Kommentator-Templates
│   │       └── RulesBox.jsx  # Regelreferenz
│   └── hooks/
│       └── useCommentatorSettings.js # localStorage-Hook
├── data/
│   └── tracker.db            # SQLite-Datenbank (auto-erstellt)
└── docs/                     # Diese Dokumentation
```

---

## Kernkonzepte auf einen Blick

**Runden (Sessions):** Eine Runde bündelt mehrere Spiele zwischen denselben Spielern mit einem festen Einsatz. Sie kann ins Archiv verschoben oder endgültig gelöscht werden.

**Spieler-Registry:** Spieler werden einmalig angelegt (Name, Avatar, Charakter-Typ, Stimme) und können dann beliebig vielen Runden zugeordnet werden.

**Soft-Delete:** Runden und einzelne Spiele werden zunächst archiviert (`archived_at`-Timestamp). Aus dem Archiv heraus kann endgültig gelöscht oder wiederhergestellt werden.

**Plugin-Architektur:** Die Spiellogik ist in eigenständigen Plugins gekapselt (`src/games/`). Schafkopf ist das einzige aktuelle Plugin, das System ist aber für weitere Spiele vorbereitet.

**Kommentator:** Nach jedem Spiel erscheint ein optionales Overlay mit Template-basiertem Kommentar, der per Web Speech API vorgelesen wird. Vier Persönlichkeiten und systemabhängige Stimmen sind wählbar.
