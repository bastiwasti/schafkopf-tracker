# Schafkopf Tracker — Agent Guide

**Important instructions for every agent at session start.**

## Project Overview

Web-App für Kartenspielrunden mit Plugin-Architektur. Unterstützt Schafkopf, Doppelkopf, Skat, Wizard, Watten, Romme und Kinderkarten.

## Architecture

- **Monorepo**: `server/` (Express) + `src/` (React + Vite)
- **Backend**: Express 5, Node.js, SQLite 3 (better-sqlite3)
- **Frontend**: React 19, Vite 8, Inline Styles (kein CSS-Framework)
- **Database**: SQLite mit WAL-Modus, 3 separate DBs (prod/dev/test)
- **Communication**: Frontend → REST API → SQLite ← Backend

## Environment Separation

| Environment | URL | Port | Database | Purpose |
|-------------|-----|------|-----------|---------|
| **Lokal** | localhost:5173 | 3001 | tracker-dev.db | Entwicklung auf Dev-VM |
| **Prod** | schafkopf.eventig.app | 3002 | tracker.db | Echte Spiele (Docker) |

**KRITISCH:**
- Prod läuft in einem **Docker Container** auf docker-host (192.168.178.160)
- Deployment ist **vollautomatisch** via GitHub Actions + Watchtower
- **NIE direkt auf docker-host eingreifen** außer bei Notfällen
- Entwicklung findet ausschließlich auf der **Dev-VM (192.168.178.192)** statt

## Deployment

**Vollautomatische Pipeline:**
```
git push  →  GitHub Actions (lint + E2E)  →  ghcr.io  →  Watchtower  →  schafkopf.eventig.app
```

**Pre-Push Hook** (lokal konfiguriert in `.git/hooks/pre-push`):
```bash
npm test   # läuft lint + alle E2E Tests vor jedem Push
```

Der Push wird abgebrochen wenn Tests fehlschlagen — CI sollte damit nie mehr fehlschlagen.

**Deploy-Status prüfen:**
```bash
# GitHub Actions
# github.com/bastiwasti/schafkopf-tracker/actions

# Watchtower-Logs
ssh sebastian@192.168.178.160 "docker logs watchtower --tail 50"

# Manueller Deploy (Notfall)
ssh sebastian@192.168.178.160 "cd /opt/apps/schafkopf-tracker && docker compose pull && docker compose up -d --force-recreate"
```

Siehe `docs/deployment.md` für vollständige Deployment-Dokumentation.

## Testing

**Alle Tests ausführen (lint + E2E):**
```bash
npm test
```

**Nur E2E Tests (ohne Lint):**
```bash
npm run test:e2e
npm run test:e2e:clean    # Mit frischer Test-DB
npm run test:e2e:ui       # Mit interaktivem UI
npm run test:e2e:debug    # Debug-Modus
```

**Einzelne Tests:**
```bash
npm run test:e2e -- --grep "Testname"
npm run test:e2e -- tests/specs/schafkopf.spec.js
```

**Neue Tests implementieren — WICHTIG:**
- **Immer einen Test nach dem anderen.** Erst Test schreiben, grün machen, dann nächsten.
- Commentary-Overlays nach jeder Runde schließen bevor der Test weiterläuft
- Siehe `docs/testing.md` für vollständigen Implementierungs-Workflow

## Structure

```
schafkopf-tracker/
├── server/                 # Express Backend
│   ├── index.js           # Main entry point (0.0.0.0, statische Files in Prod)
│   ├── db.js              # SQLite Schema & Migrationen
│   └── routes/            # API Endpoints
│       ├── sessions.js
│       ├── games.js        # Schafkopf & Doppelkopf
│       ├── players.js
│       ├── wizard/rounds.js
│       ├── watten/games.js
│       ├── romme/rounds.js
│       ├── kinderkarten/rounds.js
│       └── skat/          # Skat-Endpunkte
├── src/                   # React Frontend
│   ├── App.jsx            # View Router
│   ├── components/        # Shared UI Komponenten
│   ├── games/            # Game Plugins
│   │   ├── schafkopf/
│   │   ├── doppelkopf/
│   │   ├── skat/
│   │   ├── wizard/
│   │   ├── watten/
│   │   ├── romme/
│   │   ├── kinderkarten/
│   │   └── shared/        # GameSessionContainer (generischer Container)
│   └── hooks/            # React Hooks
├── data/                 # SQLite Datenbanken
│   ├── tracker.db        # Production (Docker Volume, nicht lokal)
│   ├── tracker-dev.db    # Development (git-ignored)
│   └── tracker-test.db   # E2E Tests (auto-reset, git-ignored)
├── Dockerfile            # Multi-Stage Build (node:22-alpine)
├── .github/workflows/
│   └── ci.yml            # CI/CD Pipeline
├── tests/                # Playwright E2E Tests
└── docs/                 # Vollständige Dokumentation
```

## Plugin Architecture

Alle Spiellogik ist plugin-basiert in `src/games/`. Neues Spiel hinzufügen: `docs/NEW_GAME_IMPLEMENTATION_GUIDE.md` lesen.

Der generische `GameSessionContainer` (`src/games/shared/`) übernimmt History, Form-State, Commentary und Rules-Toggle. Spiel-spezifische Logik kommt als Props (Wizard und Watten nutzen ihn **nicht** — sie haben eigene UIs).

## Key Patterns

### Neue Features implementieren

1. **Identify impact:**
   - Nur Frontend? → React Components editieren
   - Nur Backend? → Express Routes editieren
   - Beide? → Beide Layer editieren
   - DB-Änderung? → `server/db.js` mit Migrationen updaten (immer `try/catch` für `ALTER TABLE`)

2. **Implement changes:**
   - Bestehenden Code-Style folgen
   - Inline Styles aus `src/components/styles.js` verwenden

3. **Lokal testen:**
   ```bash
   npm run dev
   # Browser: localhost:5173
   ```

4. **Tests laufen lassen:**
   ```bash
   npm test
   ```

5. **Push (Pre-Push Hook läuft Tests automatisch):**
   ```bash
   git add .
   git commit -m "feat: beschreibung"
   git push origin master
   # → GitHub Actions baut Docker Image → Watchtower deployed
   ```

### Code Standards

- Inline Styles aus `src/components/styles.js` verwenden
- React Hooks Patterns folgen
- async/await für API-Calls
- Datenbank-Migrationen backward-kompatibel halten (`try { ALTER TABLE } catch { /* expected */ }`)
- E2E Tests für neue Features schreiben
- **Git-Operationen**: Commits nur nach expliziter Anfrage des Users

## Commands

```bash
# Development
npm install                      # Dependencies installieren
npm run dev                      # Local dev (Vite :5173 + Express :3001)
npm run dev:clean                # Mit sauberer Dev-DB

# Testing
npm test                         # Lint + alle E2E Tests (Standard)
npm run test:e2e                 # Nur E2E Tests
npm run test:e2e:clean           # Mit frischer Test-DB
npm run test:e2e:ui              # Mit UI
npm run test:e2e:debug           # Debug-Modus

# Lint
npm run lint                     # ESLint prüfen

# Build (nur für Docker, nicht manuell nötig)
npm run build                    # Vite Frontend bauen
```

## Database Schema

- **sessions** - Game rounds mit Spielern und Spieltyp
- **players** - Registrierte Spieler mit Avataren/Charakteren
- **games** - Schafkopf/Doppelkopf Spiele mit Scores
- **wizard_rounds** - Wizard Vorhersagen/Stiche/Scores
- **watten_games** / **watten_rounds** - Watten Spiele und Runden
- **skat_games** - Skat Spiele
- **romme_rounds** - Romme Runden
- **kinderkarten_rounds** - Kinderkarten Runden

Siehe `docs/architecture.md` für vollständiges Schema.

## API Reference

Siehe `docs/api.md` für vollständige API-Dokumentation.

**Sessions:** `GET/POST /api/sessions`, `GET/PATCH/DELETE /api/sessions/:id`

**Spiel-Endpunkte:**
- `/api/sessions/:id/games` — Schafkopf/Doppelkopf
- `/api/sessions/:id/wizard-rounds` — Wizard
- `/api/sessions/:id/watten` — Watten
- `/api/sessions/:id/skat-games` — Skat
- `/api/sessions/:id/romme-rounds` — Romme
- `/api/sessions/:id/kinderkarten-rounds` — Kinderkarten

**Players:** `GET/POST /api/players`, `PATCH/DELETE /api/players/:id`

## Commentary System

Siehe `docs/commentary.md` für:
- 4 Kommentator-Persönlichkeiten (dramatisch, Tagesschau, bayerisch, Fan)
- 10 Spieler-Charakter-Typen mit je 15 Szenarien
- TTS Integration mit Web Speech API
- Template-basierte Kommentar-Generierung

## Troubleshooting

**Prod zeigt alten Stand nach Push:**
1. GitHub Actions prüfen: `github.com/bastiwasti/schafkopf-tracker/actions`
2. Watchtower-Logs: `ssh sebastian@192.168.178.160 "docker logs watchtower --tail 50"`
3. Manuell deployen: `ssh sebastian@192.168.178.160 "cd /opt/apps/schafkopf-tracker && docker compose pull && docker compose up -d --force-recreate"`
4. Browser-Cache: `Ctrl + Shift + R`

**API antwortet nicht (Prod):**
```bash
ssh sebastian@192.168.178.160 "docker logs schafkopf-tracker --tail 50"
ssh sebastian@192.168.178.160 "docker ps | grep schafkopf"
```

**Build-Probleme lokal:**
```bash
rm -rf node_modules/.vite
npm install
```

## Complete Documentation

- **[Architecture](./docs/architecture.md)** - Systemarchitektur, DB-Schema, Datenfluss
- **[API Reference](./docs/api.md)** - Vollständige REST API Dokumentation
- **[Game Logic](./docs/game-logic.md)** - Spielregeln, Scoring, Plugin-System
- **[Commentary](./docs/commentary.md)** - Kommentator-System, Persönlichkeiten, TTS
- **[Frontend](./docs/frontend.md)** - Komponentenübersicht, UI-Struktur
- **[Testing](./docs/testing.md)** - E2E-Test-Setup, Spec-Dateien, Playwright-Konfiguration
- **[Deployment](./docs/deployment.md)** - Docker, GitHub Actions, Watchtower, Cloudflare
- **[New Game Guide](./docs/NEW_GAME_IMPLEMENTATION_GUIDE.md)** - Neues Spiel hinzufügen

## Tech Stack

- **Frontend:** React 19, Vite 8
- **Backend:** Express 5, Node.js
- **Database:** SQLite 3 (better-sqlite3)
- **Styling:** Inline Styles (kein CSS-Framework)
- **Testing:** Playwright E2E + ESLint
- **CI/CD:** GitHub Actions → ghcr.io → Watchtower
- **Hosting:** Docker auf Proxmox VM, Cloudflare Tunnel, Traefik
- **Language:** JavaScript (ES Modules)

## Session Start Checklist

Als Agent beim Session-Start:

1. ✅ Arbeitsverzeichnis bestätigen (`pwd` → `/home/sebastian/projects/schafkopf-tracker`)
2. ✅ Lokal entwickeln auf Dev-VM (192.168.178.192) — nie direkt auf docker-host
3. ✅ `npm test` vor Commits laufen lassen
4. ✅ DB-Migrationen backward-kompatibel halten
5. ✅ Neue Features: E2E Test schreiben
6. ✅ Commits nur nach expliziter Anfrage des Users
