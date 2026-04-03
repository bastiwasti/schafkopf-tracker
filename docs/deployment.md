# Deployment & CI/CD

## Hosting-Setup

Die Schafkopf Tracker App wird auf einer VM (Ubuntu) mit Nginx gehostet.

### Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx                                │
│  - Serviert statische Dateien aus /home/vscode/schafkopf-tracker/dist │
│  - Proxied /api Requests an Express Backend                 │
└─────────────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
  ┌──────────────┐           ┌──────────────┐
  │  Statische    │           │ Express      │
  │  Dateien      │           │ Backend      │
  │  (Vite build) │           │  :3001       │
  └──────────────┘           └──────────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │  SQLite DB   │
                               │  (data/)     │
                               └──────────────┘
```

### Nginx Konfiguration

**Pfad:** `/etc/nginx/sites-available/schafkopf.eventig.app`

```nginx
server {
    server_name schafkopf.eventig.app;

    root /home/vscode/schafkopf-tracker/dist;
    index index.html;

    # API Requests an Express Backend proxyen
    location /api {
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

    # SSL/TLS (durch Certbot verwaltet)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/schafkopf.eventig.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/schafkopf.eventig.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

### Backend Server

**Start:** `npm run server` oder `node server/index.js`

**Port:** 3001

Der Express Server läuft kontinuierlich und wird vom Nginx für alle `/api` Requests angefragt.

---

## Deployment-Prozess

### Aktuell: Manuelles Deployment

Derzeit gibt es kein automatisiertes CI/CD. Deployment erfolgt manuell:

```bash
# 1. Code-Änderungen committen
git add .
git commit -m "Beschreibung der Änderung"

# 2. Build ausführen
npm run build

# Fertig! Nginx übernimmt automatisch die neuen Dateien aus /dist
```

Die Änderungen sind sofort live unter `https://schafkopf.eventig.app` verfügbar.

### Build-Kommandos

| Kommando | Beschreibung |
|----------|-------------|
| `npm run dev` | Entwicklung: Vite (5173) + Express (3001) |
| `npm run server` | Nur Express Backend (3001) |
| `npm run build` | Production Build für Nginx |
| `npm run preview` | Preview Build lokal testen |

---

## CI/CD-Status

### Derzeit: Kein CI/CD

- Keine GitHub Actions oder andere Automatisierung
- Kein automatisches Deployment bei Push
- Kein automatisches Testing
- Deployment erfolgt manuell via SSH und npm run build

### Mögliche CI/CD-Verbesserungen

#### Option 1: GitHub Actions (Empfohlen)

`.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [master]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          source: "dist/*"
          target: "/home/vscode/schafkopf-tracker/dist"
```

**Vorteile:**
- Automatisches Deployment bei Push
- Keine manuellen Schritte nötig
- Build-Logs in GitHub

**Nachteile:**
- SSH Keys müssen als GitHub Secrets hinterlegt werden

#### Option 2: Deploy Script auf VM

`deploy.sh` auf der VM:

```bash
#!/bin/bash
cd /home/vscode/schafkopf-tracker
git pull origin master
npm ci
npm run build
systemctl reload nginx
```

**Vorteile:**
- Einfach zu implementieren
- Keine GitHub Actions nötig
- Deployment mit einem Befehl auf VM möglich

**Nachteile:**
- Immer noch manuell auszuführen
- Keine Build-Logs außerhalb der VM

---

## Wichtige Dateien für Deployment

| Datei | Zweck |
|-------|-------|
| `/etc/nginx/sites-available/schafkopf.eventig.app` | Nginx Konfiguration |
| `/home/vscode/schafkopf-tracker/dist/` | Statische Dateien (Vite Build) |
| `/home/vscode/schafkopf-tracker/data/tracker.db` | SQLite Datenbank |
| `package.json` | Build-Skripte definiert |

---

## SSL/TLS

SSL Zertifikate werden über Certbot verwaltet:

```bash
# Zertifikat erneuern (automatisch via cronjob)
sudo certbot renew

# Nginx Konfiguration neu laden
sudo systemctl reload nginx
```

Zertifikate befinden sich in `/etc/letsencrypt/live/schafkopf.eventig.app/`.

---

## Troubleshooting

### Deployment funktioniert nicht?

1. Build prüfen:
   ```bash
   npm run build
   ```

2. Build Output prüfen:
   ```bash
   ls -la dist/
   ```

3. Nginx Konfiguration prüfen:
   ```bash
   sudo nginx -t
   ```

4. Nginx neu starten:
   ```bash
   sudo systemctl restart nginx
   ```

5. Nginx Logs prüfen:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

### Backend API nicht erreichbar?

1. Backend prüfen:
   ```bash
   curl http://localhost:3001/api/sessions
   ```

2. Backend neu starten:
   ```bash
   pkill -f "server/index.js"
   npm run server &
   ```

### Seite zeigt alte Inhalte?

1. Browser Cache leeren (Hard Refresh: `Strg + Shift + R`)
2. Nginx Cache prüfen (falls aktiviert)
