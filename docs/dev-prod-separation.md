# Dev/Prod Separation

## Übersicht

> **Wichtigste Regel:** Neue Features werden ausschließlich auf **Dev** (`dev.schafkopf.eventig.app`) entwickelt und getestet. Prod enthält ausschließlich echte Spielstände — nie Testdaten eintragen.

Zwei separate Express-Prozesse (PM2) laufen aus demselben Verzeichnis und teilen sich `dist/`. Die Trennung ist ausschließlich auf Datenbankebene.

---

## Architektur

```
                    Nginx
        ┌──────────────────────────────┐      ┌──────────────────────────────┐
        │ dev.schafkopf.eventig.app    │      │ schafkopf.eventig.app        │
        │ /api → Express Dev (3001)    │      │ /api → Express Prod (3002)   │
        │ /    → dist/ (statisch)      │      │ /    → dist/ (statisch)      │
        └──────────────────────────────┘      └──────────────────────────────┘
                      │                                      │
                      ▼                                      ▼
        ┌──────────────────────┐              ┌──────────────────────┐
        │ schafkopf-dev (PM2)  │              │ schafkopf-prod (PM2) │
        │ Port 3001            │              │ Port 3002            │
        │ NODE_ENV=development │              │ NODE_ENV=production  │
        └──────────────────────┘              └──────────────────────┘
                      │                                      │
                      ▼                                      ▼
        ┌──────────────────────┐              ┌──────────────────────┐
        │ tracker-dev.db       │              │ tracker.db           │
        │ (git-ignoriert)      │              │ (git-tracked!)       │
        └──────────────────────┘              └──────────────────────┘
```

---

## Datenbanken

| Umgebung | Datei | Git-Status | Zweck |
|---|---|---|---|
| Development | `tracker-dev.db` | **ignoriert** | Feature-Entwicklung, Testing |
| Production | `tracker.db` | **getrackt** | Echte Spielstände |
| Tests | `tracker-test.db` | **ignoriert** | Playwright E2E (auto-reset) |

`tracker.db` ist bewusst in git, damit ein Verlust durch Deployment einfach wiederhergestellt werden kann. Zusätzlich gibt es einen täglichen Cron-Backup (02:00 Uhr → `/home/vscode/backups/schafkopf-tracker/`).

---

## Environment Variables

```bash
# Development (PM2 schafkopf-dev)
NODE_ENV=development
PORT=3001

# Production (PM2 schafkopf-prod)
NODE_ENV=production
PORT=3002

# Tests (Playwright)
NODE_ENV=test
PORT=3001
```

`server/db.js` wählt die Datenbankdatei anhand von `NODE_ENV`:
```js
const DB_FILES = {
  production:  'tracker.db',
  development: 'tracker-dev.db',
  test:        'tracker-test.db',
};
```

---

## PM2-Konfiguration (ecosystem.config.cjs)

```js
module.exports = {
  apps: [
    {
      name: 'schafkopf-dev',
      script: 'server/index.js',
      cwd: '/home/vscode/schafkopf-tracker',
      env: { NODE_ENV: 'development', PORT: 3001 },
      autorestart: true,
      max_memory_restart: '300M'
    },
    {
      name: 'schafkopf-prod',
      script: 'server/index.js',
      cwd: '/home/vscode/schafkopf-tracker',
      env: { NODE_ENV: 'production', PORT: 3002 },
      autorestart: true,
      max_memory_restart: '300M'
    }
  ]
}
```

> **Wichtig:** Die Datei heißt `.cjs`, nicht `.js` — weil `package.json` `"type": "module"` hat. Mit `.js` gibt es einen `ReferenceError: module is not defined in ES module scope`.

---

## Bekannte Fallstricke

### Systemd-Dienst `schafkopf-backend.service`

Es existiert ein alter systemd-Dienst der `node server/index.js` ohne `PORT`-Env startet. Der läuft mit `NODE_ENV=production` auf Port 3001 und blockiert Dev — Dev greift dann auf die Prod-DB zu.

**Prüfen:**
```bash
sudo systemctl status schafkopf-backend
lsof -i :3001 | grep LISTEN
```

**Deaktivieren:**
```bash
sudo systemctl stop schafkopf-backend
sudo systemctl disable schafkopf-backend
```

### `ecosystem.config.js` vs `.cjs`

Wenn PM2 mit `ecosystem.config.js` gestartet wird und `package.json` `"type": "module"` hat, schlägt das mit `ReferenceError` fehl. Immer `ecosystem.config.cjs` verwenden.

### CWD beim manuellen PM2-Start

Wenn PM2-Prozesse manuell gestartet werden (ohne ecosystem), muss `cwd` explizit gesetzt werden:
```bash
pm2 start server/index.js --name schafkopf-dev \
  --env NODE_ENV=development \
  -- --env PORT=3001
# BESSER: über ecosystem.config.cjs starten
pm2 start ecosystem.config.cjs --only schafkopf-dev
```

---

## Deployment (wir sind auf der VM)

```bash
# Dev deployen
npm run build && pm2 restart schafkopf-dev

# Prod deployen (nur nach expliziter Anfrage)
pm2 restart schafkopf-prod
```

---

## Datenbank-Operationen

```bash
# Dev zurücksetzen
npm run dev:clean   # oder: rm -f data/tracker-dev.db* && pm2 restart schafkopf-dev

# Prod-Daten in Dev kopieren (für Tests mit echten Daten)
# WAL-Checkpoint wichtig damit alle Writes in der Hauptdatei sind!
sqlite3 data/tracker.db 'PRAGMA wal_checkpoint(TRUNCATE);'
pm2 stop schafkopf-dev
cp data/tracker.db data/tracker-dev.db
pm2 start ecosystem.config.cjs --only schafkopf-dev
```

---

## Backup

Täglicher Cronjob (02:00 Uhr):
```bash
0 2 * * * sqlite3 /home/vscode/schafkopf-tracker/data/tracker.db \
  'PRAGMA wal_checkpoint(TRUNCATE);' \
  && cp /home/vscode/schafkopf-tracker/data/tracker.db \
     /home/vscode/backups/schafkopf-tracker/tracker_$(date +\%Y\%m\%d_\%H\%M\%S).db \
  && find /home/vscode/backups/schafkopf-tracker -mtime +30 -delete
```

Backups älter als 30 Tage werden automatisch gelöscht.
