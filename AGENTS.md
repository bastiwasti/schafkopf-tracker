# Schafkopf Tracker — Agent Guide

**Important instructions for every agent at session start.**

## Project Overview

Web-App für Kartenspielrunden mit Plugin-Architektur. Unterstützt Schafkopf und Wizard.

## Architecture

- **Monorepo**: `server/` (Express) + `src/` (React + Vite)
- **Backend**: Express 5, Node.js, SQLite 3 (better-sqlite3)
- **Frontend**: React 19, Vite 8, Inline Styles (kein CSS-Framework)
- **Database**: SQLite mit WAL-Modus, 3 separate DBs (prod/dev/test)
- **Communication**: Frontend → REST API → SQLite ← Backend

## Environment Separation (CRITICAL)

| Environment | URL | Port | Database | Purpose |
|-------------|-----|------|-----------|---------|
| **Local** | localhost:5173 | 3001 | tracker-dev.db | Entwicklung |
| **Dev** | dev.schafkopf.eventig.app | 3001 | tracker-dev.db | Feature-Tests |
| **Prod** | schafkopf.eventig.app | 3002 | tracker.db | Echte Spiele |

**CRITICAL:**
- Dev und Prod teilen sich **denselben `dist/`-Ordner** (Build-Artifacts)
- Dev und Prod haben **separate Datenbanken**
- Beide laufen aus **demselben Verzeichnis** (`/home/vscode/schafkopf-tracker`)
- **NIE auf Prod testen** — nur Dev verwenden
- **NIE `npm run dev` und PM2 gleichzeitig auf Port 3001 laufen lassen** → Führt zu Datenbank-Mixup

## Deployment

**Server:** VM mit PM2 Process Manager
**Nginx:** Reverse Proxy für statische Files und API
**SSL:** Certbot auto-renewal

**Deployment-Schritte:**
```bash
# 1. Code committen und pushen
git add .
git commit -m "feat: beschreibung"
git push origin master

# 2. Auf VM: Code holen, bauen, Server neustarten
cd /home/vscode/schafkopf-tracker
git pull origin master
npm ci
npm run build
pm2 restart schafkopf-dev
pm2 restart schafkopf-prod
```

**PM2-Kommandos:**
```bash
pm2 list                          # Status prüfen
pm2 logs schafkopf-dev          # Dev Logs
pm2 logs schafkopf-prod         # Prod Logs
pm2 restart schafkopf-dev        # Dev neustarten
pm2 restart schafkopf-prod       # Prod neustarten
pm2 monit                        # Monitoring
```

**Datenbank-Operationen:**
```bash
# Dev-Datenbank zurücksetzen
rm -f data/tracker-dev.db*
pm2 restart schafkopf-dev

# Prod-Daten in Dev kopieren (zum Testen mit echten Daten)
pm2 stop schafkopf-dev
cp data/tracker.db* data/tracker-dev.db*
pm2 start schafkopf-dev
```

## Testing

**E2E-Testing (Playwright):**
```bash
npm run test:e2e              # Tests laufen lassen
npm run test:e2e:clean        # Mit sauberer Test-DB
npm run test:e2e:ui           # Mit UI
npm run test:e2e:debug        # Debug-Modus
```

**Testing Best Practices:**
1. Immer zuerst auf Dev testen
2. `npm run test:e2e` vor Commits laufen lassen
3. `npm run test:e2e:clean` für frische Datenbank
4. Browser-Console auf Fehler prüfen während Tests

## Structure

```
schafkopf-tracker/
├── server/                 # Express Backend
│   ├── index.js           # Main entry point
│   ├── db.js              # SQLite Schema & Migrationen
│   └── routes/            # API Endpoints
│       ├── sessions.js     # Runden-Endpunkte
│       ├── games.js        # Schafkopf-Spiele
│       ├── players.js      # Spieler-Endpunkte
│       └── wizard/
│           └── rounds.js  # Wizard-Runden
├── src/                   # React Frontend
│   ├── App.jsx            # View Router
│   ├── components/        # Shared UI Komponenten
│   ├── games/            # Game Plugins
│   └── hooks/            # React Hooks
├── data/                 # SQLite Datenbanken
│   ├── tracker.db        # Production (echte Spiele)
│   ├── tracker-dev.db    # Development (Testing)
│   └── tracker-test.db   # E2E Tests (Auto-Reset)
├── tests/                # Playwright E2E Tests
└── docs/                 # Vollständige Dokumentation
```

## Plugin Architecture

Alle Spiellogik ist plugin-basiert in `src/games/`:

**Schafkopf Plugin:** `src/games/schafkopf/plugin.js`
- Vollständige Spiellogik, UI, Kommentator
- Live Score-Berechnung
- Bockrunden, Klopfer Support

**Wizard Plugin:** `src/games/wizard/plugin.js`
- Vorhersage-basiertes Spiel mit Phasen
- Automatische Score-Berechnung
- Live Kommentator-System

## Key Patterns

### Session-Erstellung für verschiedene Spieltypen

**WICHTIG:**
- Watten benötigt Team-Konfiguration (Team 1 und Team 2, je 2 Spieler)
- Andere Spiele (Schafkopf, Wizard, Skat, etc.) benötigen nur Spieler-Auswahl
- Bei Spielart-Wechsel müssen die entsprechenden States zurückgesetzt werden

**Beispiel:**
```javascript
onClick={() => {
  setGameType(p.id);
  setStake(p.defaultStake);
  if (p.id === 'watten') {
    // Watten-spezifische States zurücksetzen
    setTeam1Players([]);
    setTeam2Players([]);
    setSelectedNames([]);
  } else {
    // Nicht-Watten-spezifische States zurücksetzen
    setSelectedNames([]);
    setTeam1Players([]);
    setTeam2Players([]);
  }
}}
```

### Neue Features implementieren

1. **Identify impact:**
   - Nur Frontend? → React Components editieren
   - Nur Backend? → Express Routes editieren
   - Beide? → Beide Layer editieren
   - DB-Änderung? → `server/db.js` mit Migrationen updaten

2. **Implement changes:**
   - Bestehenden Code-Style folgen
   - Inline Styles aus `src/components/styles.js` verwenden
   - Proper Error Handling hinzufügen

3. **Lokal testen:**
   ```bash
   npm run dev
   # Im Browser testen unter localhost:5173
   ```

4. **E2E Tests laufen lassen:**
   ```bash
   npm run test:e2e
   ```

5. **Auf Dev deployen:**
   ```bash
   git add .
   git commit -m "feat: beschreibung"
   git push origin master
   # Auf VM: git pull && npm run build && pm2 restart schafkopf-dev
   ```

6. **Auf Dev verifizieren:**
   - Testen unter dev.schafkopf.eventig.app
   - PM2 Logs prüfen: `pm2 logs schafkopf-dev`

7. **Auf Prod deployen (nach Dev-Verifizierung):**
   ```bash
   # Auf VM: pm2 restart schafkopf-prod
   ```

### Code Standards

- Inline Styles aus `src/components/styles.js` verwenden
- React Hooks Patterns folgen
- async/await für API-Calls
- Proper Error Handling hinzufügen
- E2E Tests für neue Features schreiben
- Datenbank-Migrationen backward-kompatibel halten
- **Git-Operationen**: Der Agent führt niemals Commits selbst durch. Commits und Pushes müssen vom User explizit angefordert werden

## Commands

```bash
# Development
npm install                      # Dependencies installieren
npm run dev                      # Local dev (Vite :5173 + Express :3001)
npm run dev:clean                # Mit sauberer Dev-DB

# Build
npm run build                    # Frontend bauen

# Testing
npm run test:e2e                # E2E Tests laufen lassen
npm run test:e2e:clean          # Mit sauberer Test-DB
npm run test:e2e:ui             # Mit UI
npm run test:e2e:debug          # Debug-Modus

# Server (Production)
NODE_ENV=production PORT=3002 node server/index.js
```

## Database Schema

Siehe `docs/architecture.md` für Details:

- **Sessions table** - Game rounds mit Spielern
- **Players table** - Registrierte Spieler mit Avataren/Charakteren
- **Games table** - Schafkopf Spiele mit Scores
- **Wizard rounds** - Wizard Vorhersagen/Stiche/Scores

## API Reference

Siehe `docs/api.md` für vollständige API-Dokumentation:

**Sessions:**
- `GET /api/sessions` - Alle Sessions auflisten
- `POST /api/sessions` - Neue Session erstellen
- `GET /api/sessions/:id` - Session abrufen
- `PATCH /api/sessions/:id` - Session aktualisieren
- `DELETE /api/sessions/:id` - Session löschen

**Schafkopf Games:**
- `GET /api/sessions/:id/games` - Spiele auflisten
- `POST /api/sessions/:id/games` - Spiel erstellen
- `PATCH /api/sessions/:id/games/:gameId` - Spiel bearbeiten
- `DELETE /api/sessions/:id/games/last` - Letztes Spiel löschen

**Wizard Rounds:**
- `GET /api/sessions/:id/wizard-rounds` - Runden auflisten
- `POST /api/sessions/:id/wizard-rounds` - Runde erstellen
- `PATCH /api/sessions/:id/wizard-rounds/:roundId` - Runde bearbeiten
- `DELETE /api/sessions/:id/wizard-rounds/last` - Letzte Runde löschen

**Players:**
- `GET /api/players` - Alle Spieler auflisten
- `POST /api/players` - Spieler erstellen
- `PATCH /api/players/:id` - Spieler aktualisieren
- `DELETE /api/players/:id` - Spieler löschen

## Game Logic Reference

**Schafkopf Scoring:**
Siehe `docs/game-logic.md` für vollständige Regeln

**Wizard Scoring:**
- Korrekte Vorhersage: `20 + (stiche * 10)`
- Falsche Vorhersage: `-(|differenz| * 10)`

## Commentary System

Siehe `docs/commentary.md` für:
- 4 Kommentator-Persönlichkeiten (dramatisch, Tagesschau, bayerisch, Fan)
- 10 Spieler-Charakter-Typen mit je 15 Szenarien
- TTS Integration mit Web Speech API
- Template-basierte Kommentar-Generierung

## Troubleshooting

**Dev und Prod zeigen gleiche Daten:**
- PM2 Status prüfen: `pm2 list`
- Datenbank-Dateien prüfen: `ls -lah data/`
- Server neustarten: `pm2 restart schafkopf-dev schafkopf-prod`
- Browser-Cache löschen: `Ctrl + Shift + R`

**⚠️ PM2 Prozesse nicht aktualisiert (kritisch!):**
- Symptom: Code-Änderungen werden nicht sichtbar nach `pm2 restart`
- Ursache: Alte PM2-Prozesse laufen noch, binden den Port
- Lösung: Doppelte Prozesse löschen, neu starten
- Siehe `docs/deployment.md` → "Doppelte Prozesse auf Port 3001 vermeiden" für Details

**Doppelte PM2-Prozesse auf Port 3001:**
```bash
# Prüfen ob mehrere Prozesse auf Port 3001
lsof -i :3001 | grep LISTEN
ss -tlnp | grep 3001

# Doppelte PM2-Einträge löschen
pm2 delete <alte_id>
pm2 delete <weitere_alte_id>

# PM2 Dev neu starten
pm2 start "node server/index.js" --name schafkopf-dev -- --env NODE_ENV=development

# Verifizieren
pm2 list              # Nur EIN schafkopf-dev
curl http://localhost:3001/api/sessions | head  # Dev-Daten (nicht Prod!)
```

**API antwortet nicht:**
- PM2 Logs prüfen: `pm2 logs schafkopf-dev`
- Port-Verfügbarkeit prüfen: `ss -tlnp | grep 3001`
- API direkt testen: `curl http://localhost:3001/api/sessions`

**Build-Probleme:**
- Cache löschen: `rm -rf node_modules/.vite`
- Neu installieren: `npm install`
- package.json Scripts prüfen

## Complete Documentation

- **[Architecture](./docs/architecture.md)** - Systemarchitektur, DB-Schema, Datenfluss
- **[API Reference](./docs/api.md)** - Vollständige REST API Dokumentation
- **[Game Logic](./docs/game-logic.md)** - Spielregeln, Scoring, Plugin-System
- **[Commentary](./docs/commentary.md)** - Kommentator-System, Persönlichkeiten, TTS
- **[Frontend](./docs/frontend.md)** - Komponentenübersicht, UI-Struktur
- **[Deployment](./docs/deployment.md)** - Hosting, Deployment-Prozess, CI/CD
- **[Dev/Prod Separation](./docs/dev-prod-separation.md)** - Umgebungs-Setup und Trennung

## Tech Stack

- **Frontend:** React 19, Vite 8
- **Backend:** Express 5, Node.js
- **Database:** SQLite 3 (better-sqlite3)
- **Styling:** Inline Styles (kein CSS-Framework)
- **Testing:** Playwright E2E
- **Language:** JavaScript (ES Modules)

## Session Start Checklist

Als Agent beim Session-Start:

1. ✅ Aktuelle Arbeitsdirectory bestätigen (`pwd`)
2. ✅ Environment prüfen (`NODE_ENV`)
3. ✅ PM2 Status prüfen (`pm2 list`)
4. ✅ Dafür sorgen, dass auf Dev gearbeitet wird, nicht Prod
5. ✅ E2E Tests vor Deployments laufen lassen
6. ✅ Build vor Deployment ausführen
7. ✅ Deploy auf Dev verifizieren, erst dann Prod
8. ✅ Fehler und Learnings dokumentieren