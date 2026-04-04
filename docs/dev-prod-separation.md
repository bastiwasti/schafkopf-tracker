# Dev/Prod Separation

## 📋 Übersicht

> **Wichtigste Regel:** Neue Features werden ausschließlich auf **Dev** (`dev.schafkopf.eventig.app`) entwickelt und getestet. Auf **Prod** (`schafkopf.eventig.app`) kommen nur Dinge, die auf Dev funktioniert haben. Prod enthält ausschließlich echte Spielstände — nie Testdaten eintragen.

Dieses Dokument beschreibt die implementierte Trennung zwischen Development- und Production-Umgebung mit zwei separaten Express-Prozessen (PM2).

---

## 🏗 Architektur (implementiert)

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
        │ (Test-/Entwicklungs- │              │ (echte Spielstände,  │
        │  daten)              │              │  frisch gestartet)   │
        └──────────────────────┘              └──────────────────────┘
```

Beide Server laufen aus demselben Verzeichnis (`/home/vscode/schafkopf-tracker`) und teilen denselben `dist/`-Ordner. Beide verwenden `/api` als Pfad — die Subdomain unterscheidet sie, kein Pfadwechsel nötig.

---

## 🔧 Umgebungsvariablen & Datenbanken

### Datenbank-Strategie

| Umgebung | Database Datei | Persistence | Zweck |
|----------|----------------|-------------|---------|
| **Development** | `tracker-dev.db` | Lokal, flüchtig | Feature-Entwicklung, Testing |
| **Production** | `tracker.db` | Auf VM, persistent | Live-App |
| **Tests** | `tracker-test.db` | Temporär, auto-reset | Playwright E2E Tests |

### Environment Variables

```bash
# Development
NODE_ENV=development
PORT=3001

# Production
NODE_ENV=production
PORT=3002

# Tests
NODE_ENV=test
PORT=3001 (während Tests)
```

---

## 📝 Implementierungs-Plan

### Phase 1: Database Switching (server/db.js)

**Änderungen:**

```javascript
import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

mkdirSync(DATA_DIR, { recursive: true });

// Environment-basierte Datenbank-Selektion
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || (NODE_ENV === 'production' ? '3002' : '3001');

const DB_FILES = {
  development: 'tracker-dev.db',
  test: 'tracker-test.db',
  production: 'tracker.db'
};

const db = new Database(join(DATA_DIR, DB_FILES[NODE_ENV]));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ... rest des bestehenden DB-Schemas ...

console.log(`[${NODE_ENV}] Using database: ${DB_FILES[NODE_ENV]}`);
console.log(`[${NODE_ENV}] Listening on port: ${PORT}`);

export { db, PORT };
```

**Warum diese Änderungen:**
- ✅ Klare Trennung durch `NODE_ENV`
- ✅ Auto-Port-Selektion basierend auf Environment
- ✅ Logging für Debugging
- ✅ Test-Datenbank automatisch isoliert

---

### Phase 2: Express Server Anpassung (server/index.js)

**Änderungen:**

```javascript
import { db, PORT } from './db.js';

const app = express();
// ... bestehende Middleware und Routes ...

// Nur in Development: CORS für lokales Debugging
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
  app.use((req, res, next) => {
    console.log(`[DEV] ${req.method} ${req.url}`);
    next();
  });
}

// Server-Start
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`[${process.env.NODE_ENV}] Express server listening on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log(`[${process.env.NODE_ENV}] SIGTERM received, shutting down gracefully`);
  server.close(() => {
    console.log(`[${process.env.NODE_ENV}] Server closed`);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(`[${process.env.NODE_ENV}] SIGINT received, shutting down gracefully`);
  server.close(() => {
    console.log(`[${process.env.NODE_ENV}] Server closed`);
    process.exit(0);
  });
});
```

**Warum diese Änderungen:**
- ✅ Port aus db.js importiert
- ✅ Development-spezifisches Logging und CORS
- ✅ Graceful Shutdown für saubere Neustarts
- ✅ 127.0.0.1 statt 0.0.0.0 (Sicherheit)

---

### Phase 3: Package.json Scripts

**Änderungen:**

```json
{
  "scripts": {
    "dev": "NODE_ENV=development PORT=3001 concurrently \"vite\" \"node server/index.js\"",
    "dev:clean": "rm -f data/tracker-dev.db* && npm run dev",
    "server": "NODE_ENV=production PORT=3002 node server/index.js",
    "server:dev": "NODE_ENV=development PORT=3001 node server/index.js",
    "server:prod": "NODE_ENV=production PORT=3002 node server/index.js",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test:e2e": "NODE_ENV=test playwright test",
    "test:e2e:clean": "rm -f data/tracker-test.db* && npm run test:e2e",
    "test:e2e:ui": "NODE_ENV=test playwright test --ui",
    "test:e2e:debug": "NODE_ENV=test playwright test --debug",
    "reset:dev": "rm -f data/tracker-dev.db*",
    "reset:test": "rm -f data/tracker-test.db*",
    "reset:prod": "rm -f data/tracker.db*"
  }
}
```

**Warum diese Änderungen:**
- ✅ Explizite Port-Kontrolle
- ✅ Environment-spezifische Server-Scripts
- ✅ Test-Scripts mit NODE_ENV=test
- ✅ Reset-Scripts für jede Datenbank
- ✅ Clean-Scripts mit Datenbank-Bereinigung

---

### Phase 4: Playwright Konfiguration

**Änderungen:**

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // WICHTIG: Setzt NODE_ENV=test, damit Tests tracker-test.db nutzen
    command: 'NODE_ENV=test npm run dev',
    url: 'http://localhost:5173',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  // Test-DB automatisch vor allen Tests bereinigen
  globalSetup: async () => {
    const fs = await import('fs');
    const path = await import('path');
    const TEST_DB = path.join(process.cwd(), 'data', 'tracker-test.db');
    
    if (fs.existsSync(TEST_DB)) {
      fs.unlinkSync(TEST_DB);
      console.log('✓ Test database cleaned');
    }
  },
});
```

**Warum diese Änderungen:**
- ✅ `NODE_ENV=test` im webServer command
- ✅ Automatische Bereinigung der Test-DB
- ✅ Tests nutzen keine Prod-Daten
- ✅ Tests nutzen keine Dev-Daten

---

### Phase 5: Nginx Konfiguration

**Neue Konfiguration:**

```nginx
# Dev-Subdomain
server {
    server_name dev.schafkopf.eventig.app;
    
    root /home/vscode/schafkopf-tracker/dist;
    index index.html;

    # API Requests an Express Dev Server proxyen
    location /api-dev {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # SSL/TLS
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/schafkopf.eventig.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/schafkopf.eventig.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Production-Subdomain
server {
    server_name schafkopf.eventig.app;
    
    root /home/vscode/schafkopf-tracker/dist;
    index index.html;

    # API Requests an Express Prod Server proxyen
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # SSL/TLS
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/schafkopf.eventig.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/schafkopf.eventig.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

**Hinweise zur SSL-Konfiguration:**
- ⚠️ Wildcard-Zertifikat empfohlen: `*.schafkopf.eventig.app`
- Alternativ: Separate Zertifikate für beide Subdomains
- Certbot renew muss nur einmal laufen (bei Wildcard)

---

### Phase 6: SSL Zertifikate

#### Option A: Wildcard-Zertifikat (Empfohlen)

```bash
# Einmalige Wildcard-Zertifikat-Erstellung
sudo certbot certonly --manual \
  --preferred-challenges dns \
  -d '*.schafkopf.eventig.app' \
  -d 'schafkopf.eventig.app'
```

**Vorteile:**
- ✅ Ein Zertifikat für beide Subdomains
- ✅ Einfache Erneuerung
- ✅ Weniger Verwaltungsaufwand

**Nachteile:**
- ⚠️ DNS-Handshake-Einrichtung nötig

#### Option B: Separate Zertifikate

```bash
# Zertifikat für Production
sudo certbot --nginx -d schafkopf.eventig.app

# Zertifikat für Development
sudo certbot --nginx -d dev.schafkopf.eventig.app
```

**Vorteile:**
- ✅ Einfache Einrichtung
- ✅ Keine DNS-Handshake-Einrichtung

**Nachteile:**
- ⚠️ Zwei Zertifikate zu verwalten
- ⚠️ Doppelte Erneuerungen

---

### Phase 7: Prozess-Management (PM2)

**PM2 Installation:**

```bash
# PM2 global installieren
sudo npm install -g pm2

# PM2-Konfiguration erstellen
pm2 init
```

**PM2 Ecosystem-Konfiguration (ecosystem.config.js):**

```javascript
module.exports = {
  apps: [
    {
      name: 'schafkopf-dev',
      script: './server/index.js',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      error_file: './logs/dev-error.log',
      out_file: './logs/dev-out.log',
      log_file: './logs/dev.log',
      time: true
    },
    {
      name: 'schafkopf-prod',
      script: './server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      error_file: './logs/prod-error.log',
      out_file: './logs/prod-out.log',
      log_file: './logs/prod.log',
      time: true
    }
  ]
};
```

**PM2 Befehle:**

```bash
# Apps starten
pm2 start ecosystem.config.js

# Apps neustarten
pm2 restart all

# Apps stoppen
pm2 stop all

# Logs ansehen
pm2 logs schafkopf-dev
pm2 logs schafkopf-prod

# Monitoring Dashboard
pm2 monit

# Save current process list
pm2 save
```

**Log-Rotation (mit logrotate):**

```bash
sudo nano /etc/logrotate.d/schafkopf
```

```ini
/home/vscode/schafkopf-tracker/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 vscode vscode
}
```

---

### Phase 8: Deployment-Scripts

#### Dev-Deployment (auf VM)

```bash
#!/bin/bash
# deploy-dev.sh

cd /home/vscode/schafkopf-tracker

# Dev-Datenbank reset (optional)
npm run reset:dev

# Pull latest changes
git pull origin master

# Install dependencies
npm ci

# Build frontend
npm run build

# Restart Dev server (via PM2)
pm2 restart schafkopf-dev

echo "✓ Dev deployment complete!"
echo "  URL: https://dev.schafkopf.eventig.app"
```

#### Prod-Deployment (auf VM)

```bash
#!/bin/bash
# deploy-prod.sh

cd /home/vscode/schafkopf-tracker

# Backup vor Deployment (optional, aber empfohlen)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp data/tracker.db "data/backups/tracker.db.backup.$TIMESTAMP"

# Pull latest changes
git pull origin master

# Install dependencies
npm ci

# Build frontend
npm run build

# Restart Prod server (via PM2)
pm2 restart schafkopf-prod

echo "✓ Prod deployment complete!"
echo "  URL: https://schafkopf.eventig.app"
echo "  Backup: data/backups/tracker.db.backup.$TIMESTAMP"
```

---

### Phase 9: Git Repository Konfiguration

**Update .gitignore:**

```gitignore
# Logs
logs/
*.log
npm-debug.log*

# Dependencies
node_modules
dist
dist-ssr
*.local

# SQLite databases
data/tracker-dev.db
data/tracker-dev.db-*
data/tracker-dev.db-shm
data/tracker-dev.db-wal

data/tracker-test.db
data/tracker-test.db-*
data/tracker-test.db-shm
data/tracker-test.db-wal

# Keep prod DB local (or use backup strategy)
# data/tracker.db
# data/tracker.db-*
# data/backups/

# Editor directories
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
```

**Backup-Strategie:**

**Option A: Backups nicht im Git**
```bash
# Backups in data/backups/ (nicht im Git)
mkdir -p data/backups
# deploy-prod.sh erstellt Backups dort
```

**Option B: Backups in separatem Git-Repo**
```bash
# Backups in data/backups/ (nicht im Git)
# Separate Repository für Backups
```

**Option C: Keine Prod-DB im Repo (empfohlen)**
- Prod-Datenbank bleibt auf VM
- Regelmäßige Backups auf S3/FTP
- Git enthält nur Code + Dev-Datenbank-Struktur (leer)

---

## 🚀 Deployment-Workflows

Es gibt zwei Deployment-Modelle. Für dieses Projekt wird **Weg 1** verwendet.

---

### Weg 1: Eine Codebase, zwei Prozesse (aktuell implementiert)

Beide Server (Dev + Prod) laufen aus **demselben Verzeichnis** (`/home/vscode/schafkopf-tracker`). Es gibt einen einzigen `dist/`-Ordner, der von beiden Nginx-Configs serviert wird. Die Trennung ist ausschließlich auf **Datenbankebene** — Dev hat eine eigene leere DB, Prod hat die echten Spielstände.

**Was das bedeutet:** Ein `git pull` + Neustart betrifft immer beide Umgebungen gleichzeitig. Kein Code-Staging, aber vollständiger Datenschutz für Prod.

**Wann sinnvoll:** Wenn du alleine entwickelst, lokal testest bevor du pushst, und kein echtes Feature-Staging brauchst.

#### Lokale Entwicklung

```bash
# Dev-Server lokal starten (Vite + Express auf Port 3001, tracker-dev.db)
npm run dev

# Mit frischer Dev-Datenbank starten
npm run dev:clean
```

#### Deployment auf die VM

```bash
# 1. Code lokal committen und pushen
git add .
git commit -m "feat: neues feature"
git push origin master

# 2. Auf VM: neuen Code holen, bauen, beide Server neustarten
git pull origin master
npm ci
npm run build
pm2 restart schafkopf-prod
pm2 restart schafkopf-dev
```

#### Ergebnis

| | Dev | Prod |
|---|---|---|
| URL | dev.schafkopf.eventig.app | schafkopf.eventig.app |
| Code | identisch | identisch |
| DB | tracker-dev.db (leer/volatil) | tracker.db (echte Daten) |

---

### Weg 2: Zwei separate Verzeichnisse (Code-Staging, nicht implementiert)

Dev und Prod laufen aus **zwei getrennten Git-Clones** — Dev zeigt neue Features vorab, Prod bleibt auf dem zuletzt freigegebenen Stand.

```
/home/vscode/schafkopf-tracker/        ← Prod (stabiler Stand)
/home/vscode/schafkopf-tracker-dev/    ← Dev (aktueller master)
```

`ecosystem.config.cjs` müsste entsprechend angepasst werden:

```javascript
// schafkopf-dev: script aus schafkopf-tracker-dev/
{ name: 'schafkopf-dev', script: '/home/vscode/schafkopf-tracker-dev/server/index.js', ... }
// schafkopf-prod: script aus schafkopf-tracker/
{ name: 'schafkopf-prod', script: '/home/vscode/schafkopf-tracker/server/index.js', ... }
```

Nginx müsste für Dev auf das `dist/` des Dev-Verzeichnisses zeigen:
```nginx
# dev.schafkopf.eventig.app
root /home/vscode/schafkopf-tracker-dev/dist;
```

#### Dev-Deployment

```bash
cd /home/vscode/schafkopf-tracker-dev
git pull origin master
npm ci && npm run build
pm2 restart schafkopf-dev
# → dev.schafkopf.eventig.app zeigt das neue Feature
```

#### Prod-Deployment (erst nach Test auf Dev)

```bash
cd /home/vscode/schafkopf-tracker
git pull origin master   # oder: git checkout <tag>
npm ci && npm run build
pm2 restart schafkopf-prod
# → schafkopf.eventig.app bekommt den freigegebenen Code
```

**Wann sinnvoll:** Wenn Features mehrere Tage auf Dev vorab getestet werden sollen bevor sie live gehen, oder wenn mehrere Personen entwickeln.

---

### Testing Workflow

```bash
# Lokale E2E Tests (isolierte tracker-test.db, wird automatisch bereinigt)
npm run test:e2e

# Mit frischer Test-Datenbank
npm run test:e2e:clean

# Interaktiver UI-Modus
npm run test:e2e:ui
```

---

## 🔄 Rollback-Strategie

### Schnelles Rollback (bei Problemen)

```bash
# Dev Rollback
git checkout <previous-commit>
npm run dev

# Prod Rollback
ssh user@vm
cd ~/schafkopf-tracker
git checkout <previous-commit>
npm run build
pm2 restart schafkopf-prod
```

### Datenbank-Rollback

```bash
# Mit PM2 Logs vorherige Backup finden
pm2 logs schafkopf-prod | grep "Backup:"

# Backup wiederherstellen
cp data/backups/tracker.db.backup.20240104_143022 data/tracker.db

# Prod Server neustarten
pm2 restart schafkopf-prod
```

---

## 🛠 Wartung & Monitoring

### Überwachung

```bash
# PM2 Status prüfen
pm2 list

# Ressourcen-Überwachung
pm2 monit

# Speicherverbrauch
df -h
pm2 logs schafkopf-dev --lines 50
pm2 logs schafkopf-prod --lines 50
```

### Automatische Backups (Cronjob)

```bash
# Cronjob für automatische Backups
crontab -e

# Täglich um 2 Uhr nachts Prod-DB backupen
0 2 * * * cp /home/vscode/schafkopf-tracker/data/tracker.db /home/vscode/backups/tracker.db.$(date +\%Y\%m\%d).db
```

### Log-Rotation

```bash
# Logs täglich rotieren
# Konfiguration siehe Phase 7 (PM2 Log-Rotation)
```

---

## 🐛 Troubleshooting

### Probleme und Lösungen

#### Problem 1: Port-Konflikt

```bash
# Ports prüfen
lsof -i :3001
lsof -i :3002

# Prozess killen
kill -9 <PID>

# PM2 Status prüfen
pm2 list
pm2 restart schafkopf-dev
pm2 restart schafkopf-prod
```

#### Problem 2: Datenbank-Datei nicht gefunden

```bash
# Permissions prüfen
ls -la data/

# Falls nötig: Permissions korrigieren
chmod 644 data/*.db
chown vscode:vscode data/*
```

#### Problem 3: Nginx Proxy Timeout

```bash
# Nginx Timeout in server block erhöhen
proxy_connect_timeout 300;
proxy_send_timeout 300;
proxy_read_timeout 300;
```

#### Problem 4: Dev-Datenbank pollution

```bash
# Dev-Datenbank bereinigen
npm run reset:dev

# Oder komplett neu starten
npm run dev:clean
```

#### Problem 5: Tests nutzen Prod-Datenbank

```bash
# Environment Variable prüfen
echo $NODE_ENV

# Korrekte Ausführung
NODE_ENV=test npm run test:e2e
```

---

## ✅ Checkliste vor dem Deployment

### Vor dem ersten Deployment

- [ ] SSL-Zertifikate konfiguriert (Wildcard oder zwei separate)
- [ ] PM2 installiert und konfiguriert
- [ ] Nginx-Konfiguration erstellt und getestet
- [ ] Database-Switching implementiert (server/db.js)
- [ ] Package.json Scripts angepasst
- [ ] Playwright Konfiguration aktualisiert
- [ ] .gitignore aktualisiert
- [ ] Backups eingerichtet (cronjob oder manuell)
- [ ] Log-Rotation konfiguriert
- [ ] Firewall Ports offen (3001, 3002, 443, 80)
- [ ] DNS-Einträge für dev.schafkopf.eventig.app erstellt

### Test-Deployment

- [ ] Auf VM: deploy-dev.sh ausführen
- [ ] Dev-URL aufrufen: https://dev.schafkopf.eventig.app
- [ ] API-Requests testen: curl https://dev.schafkopf.eventig.app/api-dev/sessions
- [ ] Datenbank prüfen: ls -la data/tracker-dev.db
- [ ] PM2 Status prüfen: pm2 list
- [ ] Logs prüfen: pm2 logs schafkopf-dev

### Prod-Deployment

- [ ] Auf VM: deploy-prod.sh ausführen
- [ ] Prod-URL aufrufen: https://schafkopf.eventig.app
- [ ] API-Requests testen: curl https://schafkopf.eventig.app/api/sessions
- [ ] Datenbank prüfen: ls -la data/tracker.db
- [ ] Backup erstellt: ls -la data/backups/
- [ ] PM2 Status prüfen: pm2 list
- [ ] Logs prüfen: pm2 logs schafkopf-prod

---

## 📚 Dokumentation

### Nützliche Dateien

- `server/db.js` - Database-Konfiguration mit Environment-Switching
- `server/index.js` - Express Server mit Port- und Environment-Handling
- `package.json` - Alle Scripts für Dev, Test, Prod
- `playwright.config.js` - Test-Konfiguration mit NODE_ENV=test
- `/etc/nginx/sites-available/schafkopf.eventig.app` - Nginx Konfiguration (Prod)
- `/etc/nginx/sites-available/dev.schafkopf.eventig.app` - Nginx Konfiguration (Dev)
- `ecosystem.config.js` - PM2 Prozess-Konfiguration
- `deploy-dev.sh` - Dev-Deployment Script
- `deploy-prod.sh` - Prod-Deployment Script

### Links

- [PM2 Dokumentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Proxy Dokumentation](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Better-SQLite3 Dokumentation](https://github.com/WiseLibs/better-sqlite3)
- [Playwright Konfiguration](https://playwright.dev/docs/test-configuration)

---

## 🎯 Zusammenfassung

### Was passiert nach dem Deployment?

#### dev.schafkopf.eventig.app
- ✅ Nutzt `tracker-dev.db` (leere Datenbank oder lokale Dev-Daten)
- ✅ Express Dev Server läuft auf Port 3001
- ✅ API-Requests gehen an `/api-dev`
- ✅ Entwickler können dort Features testen
- ✅ Keine Auswirkung auf Prod-Daten

#### schafkopf.eventig.app
- ✅ Nutzt `tracker.db` (persistente Prod-Daten)
- ✅ Express Prod Server läuft auf Port 3002
- ✅ API-Requests gehen an `/api`
- ✅ User-Daten bleiben erhalten
- ✅ Deployments überschreiben nur Frontend-Dateien, nicht Datenbank

#### Tests (Playwright)
- ✅ Nutzen `tracker-test.db` (temporär)
- ✅ Datenbank wird vor jedem Test-Run automatisch bereinigt
- ✅ Keine污染 von Prod- oder Dev-Daten
- ✅ Isolierte Testumgebung

### Vorteile dieser Architektur

1. **Maximale Isolation** - Dev-Fehler brechen nicht Prod
2. **Parallel Development** - Dev kann neugestartet werden ohne Prod zu stören
3. **Test-Sicherheit** - Tests nutzen isolierte Datenbank
4. **Einfaches Deployment** - Deploy-Skripte für Dev und Prod
5. **Backup-Sicherheit** - Automatische Backups vor Prod-Deployments
6. **Monitoring** - PM2 bietet übersichtliches Monitoring beider Prozesse

### Nachteile und Risiken

1. **Doppelter RAM-Verbrauch** - Zwei Express-Prozesse (vernachlässigbar für kleine App)
2. **Komplexität** - Mehr Konfigurationen zu verwalten
3. **Deployment-Zeit** - Zwei Prozesse statt einem zu deployen

---

## 🚀 Nächste Schritte

### Implementierungs-Reihenfolge

1. ✅ Database Switching implementieren (Phase 1)
2. ✅ Express Server anpassen (Phase 2)
3. ✅ Package.json Scripts aktualisieren (Phase 3)
4. ✅ Playwright Konfiguration anpassen (Phase 4)
5. ✅ SSL-Zertifikate besorgen (Phase 6)
6. ✅ Nginx Konfiguration erstellen (Phase 5)
7. ✅ PM2 installieren und konfigurieren (Phase 7)
8. ✅ Deployment-Scripts erstellen (Phase 8)
9. ✅ Test-Deployment auf Dev durchführen
10. ✅ Prod-Deployment durchführen
11. ✅ Monitoring und Backups einrichten

---

## 📞 Support

Bei Problemen:

1. PM2 Logs prüfen: `pm2 logs schafkopf-dev` oder `pm2 logs schafkopf-prod`
2. Nginx Logs prüfen: `sudo tail -f /var/log/nginx/error.log`
3. Server-Status prüfen: `pm2 list`
4. Datenbank prüfen: `ls -la data/`
5. Ports prüfen: `lsof -i :3001` und `lsof -i :3002`

---

**Ziel:** Eine robuste, skalierbare und sichere Dev/Prod-Trennung mit maximaler Isolation und minimaler Auswirkung auf Produktion.
