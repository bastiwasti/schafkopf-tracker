# Schafkopf Tracker — Dokumentation

Schafkopf Tracker ist eine Web-App zum Erfassen und Auswerten von Kartenspielrunden. Aktuell unterstützte Spiele: **Schafkopf** und **Wizard**. Die App läuft lokal im Browser und benötigt keinen externen Dienst.

## Inhaltsverzeichnis

| Datei | Inhalt |
|---|---|
| [README.md](./README.md) | Diese Datei — Überblick & Schnellstart |
| [architecture.md](./architecture.md) | Systemarchitektur, Datenbankschema, Datenfluss |
| [api.md](./api.md) | REST-API-Referenz (alle Endpunkte) |
| [game-logic.md](./game-logic.md) | Spielregeln, Wertberechnung, Plugin-System |
| [commentary.md](./commentary.md) | Kommentator-System, Persönlichkeiten, TTS |
| [frontend.md](./frontend.md) | Komponentenübersicht & UI-Struktur |
| [deployment.md](./deployment.md) | Hosting, Deployment-Prozess, CI/CD |

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
│       ├── games.js          # Schafkopf-Spiel-Endpunkte
│       ├── players.js        # Spieler-Endpunkte
│       └── wizard/
│           └── rounds.js     # Wizard-Runden-Endpunkte
├── src/
│   ├── App.jsx               # View-Router (sessions / session / players / archive)
│   ├── components/
│   │   ├── SessionList.jsx   # Rundenübersicht & neue Runde
│   │   ├── SessionView.jsx   # Spielansicht (Schafkopf)
│   │   ├── Scoreboard.jsx    # Kontostand-Anzeige (Schafkopf)
│   │   ├── BockBar.jsx       # Bock-Multiplikator
│   │   ├── PlayerManager.jsx # Spieler-Registry
│   │   ├── ArchiveView.jsx   # Archiv-Verwaltung
│   │   ├── CommentaryOverlay.jsx # Kommentator-Overlay (Schafkopf & Wizard)
│   │   ├── AvatarPicker.jsx  # Emoji-Auswahl
│   │   └── styles.js         # Zentrale Style-Definitionen
│   ├── games/
│   │   ├── index.js          # Plugin-Registry
│   │   ├── schafkopf/
│   │   │   ├── plugin.js     # Plugin-Definition
│   │   │   ├── logic.js      # Wertberechnung
│   │   │   ├── GameForm.jsx  # Spieleingabe
│   │   │   ├── HistoryCard.jsx # Spielverlauf-Karte
│   │   │   ├── commentary.js # Kommentator-Templates & PERSONALITIES
│   │   │   └── RulesBox.jsx  # Regelreferenz
│   │   └── wizard/
│   │       ├── plugin.js     # Plugin-Definition
│   │       ├── ScoreSheet.jsx # Haupt-UI (Score-Tabelle + Kommentator)
│   │       ├── RulesBox.jsx  # Regelreferenz
│   │       └── commentary.js # Wizard-spezifische Kommentator-Templates
│   └── hooks/
│       └── useCommentatorSettings.js # localStorage-Hook
├── data/
│   └── tracker.db            # SQLite-Datenbank (auto-erstellt)
└── docs/                     # Diese Dokumentation
```

---

## Kernkonzepte auf einen Blick

**Runden (Sessions):** Eine Runde bündelt mehrere Spiele zwischen denselben Spielern. Bei Schafkopf gibt es einen festen Einsatz und Bock-Multiplikator. Bei Wizard wird automatisch die korrekte Rundenanzahl (abhängig von Spielerzahl) berechnet.

**Spieler-Registry:** Spieler werden einmalig angelegt (Name, Avatar, Charakter-Typ, Stimme) und können dann beliebig vielen Runden zugeordnet werden. Der Charakter-Typ (`dramatic`, `tagesschau`, `bavarian`, `fan`) bestimmt, wie der Spieler im Kommentator-Overlay reagiert.

**Soft-Delete:** Schafkopf-Runden und einzelne Spiele werden zunächst archiviert (`archived_at`-Timestamp). Aus dem Archiv heraus kann endgültig gelöscht oder wiederhergestellt werden. Wizard-Runden haben kein Archiv (direktes Undo stattdessen).

**Plugin-Architektur:** Die Spiellogik ist in eigenständigen Plugins gekapselt (`src/games/`). Schafkopf und Wizard sind die aktuellen Plugins. Das System ist für weitere Spiele vorbereitet.

**Kommentator:** Nach jedem Spiel (Schafkopf) bzw. jeder Runde (Wizard) erscheint ein optionales Overlay mit Template-basiertem Kommentar, der per Web Speech API vorgelesen wird. Vier Persönlichkeiten und systemabhängige Stimmen sind wählbar. Spieler können eigene Charakter-Typen und Stimmen haben, die in ihren Reaktionen verwendet werden.

**Wizard Score Sheet:** Wizard hat ein eigenes Score-Sheet-UI mit zwei Eingabephasen pro Runde: erst Vorhersagen, dann Stiche. Die Punkte werden automatisch berechnet (korrekte Vorhersage: 20 + 10 × Stiche; falsche Vorhersage: −10 × |Differenz|).
