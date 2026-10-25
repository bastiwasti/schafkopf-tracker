# Graph Report - schafkopf-tracker  (2026-10-25)

## Corpus Check
- 402 files · ~91,109 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .css 2)

## Summary
- 772 nodes · 1316 edges · 33 communities (32 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 83 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Romme Commentary
- Schafkopf Game Logic & Scoring
- Schafkopf Game Logic & Scoring
- Schafkopf Game Logic & Scoring
- Romme Plugin & History
- Schafkopf Game Logic & Scoring
- Module Group 6
- Skat Game Logic & UI
- Schafkopf Game Logic & Scoring
- Wizard Game Module
- Kinderkarten Game Module
- Database Layer
- Watten Commentary & Scenarios
- Module Group 13
- Schafkopf Game Logic & Scoring
- Module Group 15
- Module Group 16
- Module Group 17
- Module Group 18
- Schafkopf Game Logic & Scoring
- Module Group 20
- Module Group 21
- Schafkopf Game Logic & Scoring
- Schafkopf Game Logic & Scoring
- Schafkopf Game Logic & Scoring
- Schafkopf Game Logic & Scoring
- Module Group 27
- Watten Session UI
- Wizard Game Module
- Schafkopf Game Logic & Scoring
- Module Group 31
- Module Group 32

## God Nodes (most connected - your core abstractions)
1. `styles` - 31 edges
2. `pickRandom()` - 24 edges
3. `react` - 23 edges
4. `GameSessionContainer()` - 20 edges
5. `Schafkopf Tracker — Agent Guide` - 18 edges
6. `Frontend-Komponenten` - 18 edges
7. `fill()` - 18 edges
8. `createPlugin()` - 17 edges
9. `Schafkopf Tracker — Agent Guide` - 16 edges
10. `New Game Implementation Guide` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Plugin Architecture` --references--> `GameSessionContainer()`  [INFERRED]
  AGENTS.md → src/games/shared/GameSessionContainer.jsx
- `Architektur-Überblick` --references--> `createPlugin()`  [INFERRED]
  docs/NEW_GAME_IMPLEMENTATION_GUIDE.md → src/games/shared/createPlugin.js
- `Schritt 7 — `src/games/newgame/NewGameSession.jsx`` --references--> `GameSessionContainer()`  [INFERRED]
  docs/NEW_GAME_IMPLEMENTATION_GUIDE.md → src/games/shared/GameSessionContainer.jsx
- ``createPlugin()` Defaults` --references--> `createPlugin()`  [INFERRED]
  docs/NEW_GAME_IMPLEMENTATION_GUIDE.md → src/games/shared/createPlugin.js
- `Schritt 10 — `src/games/index.js`` --references--> `SessionList()`  [INFERRED]
  docs/NEW_GAME_IMPLEMENTATION_GUIDE.md → src/components/SessionList.jsx

## Import Cycles
- 3-file cycle: `src/games/index.js -> src/games/romme/plugin.js -> src/games/romme/RommeSession.jsx -> src/games/index.js`
- 3-file cycle: `src/games/doppelkopf/DoppelkopfSession.jsx -> src/games/index.js -> src/games/doppelkopf/plugin.js -> src/games/doppelkopf/DoppelkopfSession.jsx`
- 3-file cycle: `src/games/index.js -> src/games/kinderkarten/plugin.js -> src/games/kinderkarten/KinderkartenSession.jsx -> src/games/index.js`
- 3-file cycle: `src/games/index.js -> src/games/schafkopf/plugin.js -> src/games/schafkopf/SchafkopfSession.jsx -> src/games/index.js`
- 3-file cycle: `src/games/index.js -> src/games/skat/plugin.js -> src/games/skat/SkatSession.jsx -> src/games/index.js`

## Communities (33 total, 1 thin omitted)

### Community 0 - "Romme Commentary"
Cohesion: 0.07
Nodes (39): Tabelle `players`, Automatisches Schließen, CommentaryOverlay, Segment-Rendering, App.jsx, WattenSession.jsx (`src/games/watten/WattenSession.jsx`), react, App() (+31 more)

### Community 1 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.07
Nodes (53): Shared-Komponenten, Zusatztexte, Übersicht, PlayerManager.jsx, buildAllTexts(), PlayerForm(), PlayerTestOverlay(), VoicePicker() (+45 more)

### Community 2 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.08
Nodes (32): `createPlugin()` — Felder und Defaults, Plugin-Architektur, Session-Container-Entscheid, Frontend, BockBar(), RulesBox(), DoppelkopfSession(), GAME_PLUGINS (+24 more)

### Community 3 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.04
Nodes (44): 1. PLAYERS (7 Tests), 2. SCHAFKOPF (5 Tests), 3. WIZARD (5 Tests), 4. WATTEN (5 Tests), 5. SKAT (5 Tests), 6. ROMME (5 Tests), 7. DOPPELKOPF (5 Tests), Cleanup (Dateien löschen) (+36 more)

### Community 4 - "Romme Plugin & History"
Cohesion: 0.09
Nodes (19): express, DATA_DIR, db, DB_FILES, __dirname, app, countStmts, __dirname (+11 more)

### Community 5 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.06
Nodes (34): API-Funktionen (src/games/doppelkopf/logic.js), API-Funktionen (src/games/schafkopf/logic.js), `calcBalances(history, players)`, `calcSpielwert(formState)`, `calcSpielwert({ type, kontra, ansage, bock, stake, soloValue })`, createPlugin() Factory, Doppelkopf, Gespannt-Modus (+26 more)

### Community 6 - "Module Group 6"
Cohesion: 0.06
Nodes (34): if, needs, permissions, runs-on, steps, env, IMAGE_NAME, REGISTRY (+26 more)

### Community 7 - "Skat Game Logic & UI"
Cohesion: 0.15
Nodes (25): buildCommentatorText(), buildFullCommentary(), buildRamschText(), COMMENTATOR_TEMPLATES, getNullGroup(), MODIFIERS, NULL_TEMPLATES, RAMSCH_TEMPLATES (+17 more)

### Community 8 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.07
Nodes (30): Charakter & Stimme testen, Comeback-Erkennung, Dateien, Dateien, Doppelkopf-Kommentator, Einstellungen (useCommentatorSettings), Hauptfunktion, Hauptfunktion (+22 more)

### Community 9 - "Wizard Game Module"
Cohesion: 0.12
Nodes (20): ANSAGEN, GameForm(), SonderpunkteSection(), ANSAGE_LABELS, HistoryCard(), ansagePts(), calcBalances(), calcSpielwert() (+12 more)

### Community 10 - "Kinderkarten Game Module"
Cohesion: 0.08
Nodes (25): close_game, comeback, first_round, ⚙️ GIF-Eigenschaften, 🎯 GIF-Empfehlungen, 🎭 GIF-Integration für Kindergarten-Kommentare, 📋 GIF-Suchbegriffe (pro Szenario), leader_change (+17 more)

### Community 11 - "Database Layer"
Cohesion: 0.08
Nodes (25): Architektur-Überblick, Backend, Checkliste, `createPlugin()` Defaults, Deployment, Fallstricke Commentary, Häufige Bugs, New Game Implementation Guide (+17 more)

### Community 12 - "Watten Commentary & Scenarios"
Cohesion: 0.09
Nodes (21): API-Calls, ArchiveView.jsx, AvatarPicker.jsx, BockBar.jsx, CommentaryOverlay.jsx, Frontend-Komponenten, Hooks, Phasen-Workflow (+13 more)

### Community 13 - "Module Group 13"
Cohesion: 0.10
Nodes (21): Container startet nicht, Datenbank, DB aus Container kopieren (Backup), Deploy-Status prüfen, Deployment, Deployment-Prozess, Dev-Datenbank zurücksetzen, docker-compose.yml (auf docker-host) (+13 more)

### Community 14 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.10
Nodes (20): API Reference, Architecture, Code Standards, Commands, Commentary System, Complete Documentation, Database Schema, Deployment (+12 more)

### Community 15 - "Module Group 15"
Cohesion: 0.11
Nodes (19): Ausführen, Beispiele, Checkliste für neue Tests, Commentary-Pattern, Grundstruktur, Hinweise, Kategorien, Naming Convention (+11 more)

### Community 16 - "Module Group 16"
Cohesion: 0.11
Nodes (18): runs-on, steps, jobs, graphify, name, permissions, contents, branches (+10 more)

### Community 17 - "Module Group 17"
Cohesion: 0.11
Nodes (17): 2a: Generische HistoryCard, 2b: Shared calcBalances, Context, Foundation für Cross-Game-Features, Kritische Dateien, Migrations-Reihenfolge (inkrementell), Neu erstellen: `src/games/shared/GameSessionContainer.jsx`, Neue Service-Module (+9 more)

### Community 18 - "Module Group 18"
Cohesion: 0.12
Nodes (16): scripts, build, dev, dev:clean, dev:test, lint, preview, reset:dev (+8 more)

### Community 19 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.12
Nodes (16): API Reference, Code Standards, Commentary System, Complete Documentation, Database Schema & Architecture, Deployment Process, Environment Separation (CRITICAL), Feature Implementation Guide (+8 more)

### Community 20 - "Module Group 20"
Cohesion: 0.17
Nodes (14): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @playwright/test@^1.59.1, @types/react-dom@^19.2.3 (+6 more)

### Community 21 - "Module Group 21"
Cohesion: 0.18
Nodes (13): dependencies, better-sqlite3@^12.8.0, concurrently@^9.2.1, express@^5.2.1, react@^19.2.4, react-dom@^19.2.4, name, private (+5 more)

### Community 22 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.15
Nodes (13): Architektur, Backup, Bekannte Fallstricke, CWD beim manuellen PM2-Start, Datenbank-Operationen, Datenbanken, Deployment (wir sind auf der VM), Dev/Prod Separation (+5 more)

### Community 23 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.15
Nodes (3): @playwright/test, PLAYERS, PLAYERS_4

### Community 24 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.17
Nodes (11): `DELETE /api/players/:id`, `DELETE /api/sessions/:id/games/:gameId`, `DELETE /api/sessions/:id/games/last`, `GET /api/players`, `PATCH /api/players/:id`, `PATCH /api/sessions/:id/games/:gameId`, `POST /api/players`, `POST /api/sessions/:id/games` (+3 more)

### Community 25 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.18
Nodes (11): Architektur, Datenbankschema, Datenfluss: Spiel eintragen (Schafkopf / Doppelkopf), Migrationen, Styling, Tabelle `games` (geteilt von Schafkopf, Doppelkopf, Skat), Tabelle `sessions`, Tabelle `watten_games` / `watten_rounds` (+3 more)

### Community 27 - "Module Group 27"
Cohesion: 0.25
Nodes (8): `DELETE /api/sessions/:id`, `GET /api/sessions`, `GET /api/sessions/archived`, `GET /api/sessions/archived/games`, `GET /api/sessions/:id`, `PATCH /api/sessions/:id`, `POST /api/sessions`, Runden (`/api/sessions`)

### Community 28 - "Watten Session UI"
Cohesion: 0.29
Nodes (7): `DELETE /api/sessions/:id/watten/games/last`, `DELETE /api/sessions/:id/watten/rounds/last`, `GET /api/sessions/:id/watten/games`, `GET /api/sessions/:id/watten/rounds`, `POST /api/sessions/:id/watten/games`, `POST /api/sessions/:id/watten/rounds`, Watten (`/api/sessions/:id/watten`)

### Community 29 - "Wizard Game Module"
Cohesion: 0.29
Nodes (7): `DELETE /api/sessions/:id/wizard-rounds/last`, `DELETE /api/sessions/:id/wizard-rounds/:roundId`, `GET /api/sessions/:id/wizard-rounds`, `GET /api/sessions/:id/wizard-rounds/archived`, `PATCH /api/sessions/:id/wizard-rounds/:roundId`, `POST /api/sessions/:id/wizard-rounds`, Wizard-Runden (`/api/sessions/:id/wizard-rounds`)

### Community 30 - "Schafkopf Game Logic & Scoring"
Cohesion: 0.29
Nodes (7): Inhaltsverzeichnis, Kernkonzepte auf einen Blick, Projektstruktur, Schafkopf Tracker — Dokumentation, Schnellstart, Tech-Stack, Umgebungen

### Community 31 - "Module Group 31"
Cohesion: 0.40
Nodes (4): vite@^8.0.1, @vitejs/plugin-react@^6.0.1, vite, @vitejs/plugin-react

### Community 32 - "Module Group 32"
Cohesion: 1.00
Nodes (2): @types/react@^19.2.14, @types/react

## Knowledge Gaps
- **1 thin communities (<2 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Romme Commentary` to `Schafkopf Game Logic & Scoring`, `Schafkopf Game Logic & Scoring`, `Module Group 21`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `pickRandom()` (e.g. with `Shared-Komponenten` and `Übersicht`) actually correct?**
  _`pickRandom()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Romme Commentary` be split into smaller, more focused modules?**
  _Cohesion score 0.07077625570776255 - nodes in this community are weakly interconnected._
- **Why does `createPlugin()` connect `Schafkopf Game Logic & Scoring` to `Schafkopf Game Logic & Scoring`, `Skat Game Logic & UI`, `Wizard Game Module`, `Database Layer`, `Module Group 17`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `GameSessionContainer()` (e.g. with `Plugin Architecture` and `Session-Container-Entscheid`) actually correct?**
  _`GameSessionContainer()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `Schafkopf Game Logic & Scoring` be split into smaller, more focused modules?**
  _Cohesion score 0.0710085933966531 - nodes in this community are weakly interconnected._
- **Why does `GameSessionContainer()` connect `Schafkopf Game Logic & Scoring` to `Romme Commentary`, `Module Group 17`, `Database Layer`, `Schafkopf Game Logic & Scoring`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._