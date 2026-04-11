# Deployment

## Übersicht

Deployment läuft vollautomatisch über eine GitHub Actions Pipeline:

```
git push  →  GitHub Actions (lint + E2E)  →  Docker Image (ghcr.io)  →  Watchtower (docker-host)
```

Kein manuelles Bauen, kein SSH auf den Server — push to master und fertig.

---

## Infrastruktur

```
Internet
   │
   ▼
Cloudflare Tunnel
   │
   ▼
Traefik (traefik-public Docker-Netzwerk)
   │
   ▼
schafkopf-tracker Container (docker-host 192.168.178.160)
   │
   ▼
/app/data/tracker.db  (Docker Volume: schafkopf-data)
```

| Komponente | Details |
|---|---|
| **URL** | schafkopf.eventig.app |
| **Docker-Host** | 192.168.178.160 |
| **Dev-VM** | 192.168.178.192 (Entwicklung, kein Prod-Zugriff) |
| **Image Registry** | ghcr.io/bastiwasti/schafkopf-tracker |
| **Compose-Datei** | `/opt/apps/schafkopf-tracker/docker-compose.yml` (auf docker-host) |
| **Datenbank** | Docker Volume `schafkopf-data` → `/app/data/tracker.db` |

---

## Deployment-Prozess

### Normaler Deploy (automatisch)

```
1. git push origin master
   └─ pre-push hook läuft npm test (lint + E2E) — bei Fehler wird Push abgebrochen

2. GitHub Actions (ci.yml):
   ├─ npm test (lint + E2E Tests)
   └─ Docker Image bauen + zu ghcr.io pushen (nur bei grünem Test-Job)

3. Watchtower (läuft auf docker-host, pollt alle 5 Min):
   └─ Neues Image erkannt → Container stoppen → neuen starten
```

### Deploy-Status prüfen

**GitHub Actions prüfen:**
```
github.com/bastiwasti/schafkopf-tracker/actions
```

**Watchtower-Logs prüfen:**
```bash
ssh sebastian@192.168.178.160 "docker logs watchtower --tail 50"
```

Erfolgreiches Update sieht so aus:
```
level=info msg="Found new ghcr.io/bastiwasti/schafkopf-tracker:latest image"
level=info msg="Stopping /schafkopf-tracker ..."
level=info msg="Creating /schafkopf-tracker"
level=info msg="Session done" Failed=0 Scanned=5 Updated=1
```

**Container-Status prüfen:**
```bash
ssh sebastian@192.168.178.160 "docker ps | grep schafkopf"
ssh sebastian@192.168.178.160 "docker logs schafkopf-tracker --tail 50"
```

### Manueller Deploy (wenn Watchtower fehlschlägt)

```bash
ssh sebastian@192.168.178.160 "cd /opt/apps/schafkopf-tracker && docker compose pull && docker compose up -d --force-recreate"
```

---

## Lokale Entwicklung

```bash
# Dev-Server starten (Vite :5173 + Express :3001, tracker-dev.db)
npm run dev

# Mit frischer Dev-Datenbank
npm run dev:clean
```

Kein Build-Schritt nötig — Vite übernimmt das HMR.

---

## Docker-Konfiguration

### Dockerfile (Multi-Stage Build)

```
Stage 1 (build): node:22-alpine
  - npm ci (alle Dependencies inkl. devDeps)
  - npm run build → dist/

Stage 2 (runtime): node:22-alpine
  - apk add python3 make g++  (für better-sqlite3 native build)
  - npm ci --omit=dev
  - npm rebuild better-sqlite3
  - COPY dist/ und server/
  - NODE_ENV=production, PORT=3002
```

### docker-compose.yml (auf docker-host)

Liegt unter `/opt/apps/schafkopf-tracker/docker-compose.yml` auf dem docker-host (nicht im Repo):

```yaml
services:
  schafkopf-tracker:
    image: ghcr.io/bastiwasti/schafkopf-tracker:latest
    container_name: schafkopf-tracker
    restart: unless-stopped
    volumes:
      - schafkopf-data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.schafkopf.rule=Host(`schafkopf.eventig.app`)"
      - "traefik.http.routers.schafkopf.entrypoints=web"
    networks:
      - traefik-public

networks:
  traefik-public:
    external: true

volumes:
  schafkopf-data:
```

---

## Datenbank

Die Datenbank lebt im Docker Volume `schafkopf-data` unter `/app/data/tracker.db` im Container. `server/db.js` löst den Pfad über `__dirname` auf — in Docker ist `__dirname = /app/server/`, also `DATA_DIR = /app/data/`.

### DB aus Container kopieren (Backup)

```bash
docker cp schafkopf-tracker:/app/data/tracker.db /tmp/tracker-backup.db
```

### Externe DB in Container kopieren (Migration)

```bash
# Container muss laufen (damit das Volume existiert)
docker cp /tmp/tracker.db schafkopf-tracker:/app/data/tracker.db
docker compose restart
```

### Dev-Datenbank zurücksetzen

```bash
npm run reset:dev   # löscht data/tracker-dev.db*
```

---

## GitHub Actions (`ci.yml`)

```yaml
jobs:
  test:
    - npm ci
    - Playwright-Browser cachen (Key: package-lock.json Hash)
    - npx playwright install --with-deps chromium
    - npm test  (= npm run lint && playwright test)

  build-and-push:
    needs: test
    if: push auf master/main
    - docker/login-action → ghcr.io
    - docker/build-push-action → :latest + :<sha>
```

Der `build-and-push`-Job läuft **nur wenn `test` grün ist** und **nur bei Push auf master** (nicht bei PRs).

---

## Troubleshooting

### Seite zeigt alten Stand nach Push

1. GitHub Actions prüfen — ist der Build grün?
2. Watchtower-Logs prüfen — hat er das neue Image erkannt?
3. Falls Watchtower fehlschlug: manuell deployen (siehe oben)
4. Browser-Cache: `Ctrl + Shift + R` oder Incognito-Fenster

### GitHub Actions schlägt fehl

- **Lint-Fehler**: `npm run lint` lokal ausführen und beheben
- **Test-Fehler**: `npm test` lokal ausführen
- **Docker-Build-Fehler**: Logs in Actions ansehen, meist Dependency-Problem

### Container startet nicht

```bash
ssh sebastian@192.168.178.160 "docker logs schafkopf-tracker"
```

Häufige Ursachen:
- Port bereits belegt → `docker ps` prüfen
- Volume-Permissions → `docker inspect schafkopf-data`
- Image-Pull fehlgeschlagen → `docker compose pull` manuell

### Watchtower findet kein neues Image

- GitHub Actions Build noch nicht fertig (dauert ~3-5 Min)
- Watchtower pollt alle 5 Minuten — kurz warten
- `docker logs watchtower -f` zum Live-beobachten
