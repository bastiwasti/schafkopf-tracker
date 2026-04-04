# Deployment

## Umgebungen

> **Regel:** Neue Features werden ausschließlich auf **Dev** entwickelt und getestet. Auf **Prod** kommen nur Dinge, die auf Dev funktioniert haben.

| | Dev | Prod |
|---|---|---|
| URL | dev.schafkopf.eventig.app | schafkopf.eventig.app |
| Port | 3001 | 3002 |
| Datenbank | `data/tracker-dev.db` | `data/tracker.db` |
| Zweck | Feature-Entwicklung & Tests | Echte Spielstände |
| DB-Stand | Kopie von Prod (oder leer) | Frisch gestartet, leer |

Prod wurde bewusst mit einer leeren Datenbank gestartet. Echte Spielstände werden ab jetzt direkt auf Prod eingegeben.

---

## Architektur auf der VM

```
                    Nginx
        ┌─────────────────────────────┐
        │ dev.schafkopf.eventig.app   │      │ schafkopf.eventig.app      │
        │ /api → localhost:3001       │      │ /api → localhost:3002      │
        │ /    → dist/ (statisch)     │      │ /    → dist/ (statisch)    │
        └─────────────────────────────┘
                  │                                    │
                  ▼                                    ▼
        ┌──────────────────┐              ┌──────────────────┐
        │ schafkopf-dev    │              │ schafkopf-prod   │
        │ PM2, Port 3001   │              │ PM2, Port 3002   │
        │ NODE_ENV=dev     │              │ NODE_ENV=prod    │
        └──────────────────┘              └──────────────────┘
                  │                                    │
                  ▼                                    ▼
        ┌──────────────────┐              ┌──────────────────┐
        │ tracker-dev.db   │              │ tracker.db       │
        └──────────────────┘              └──────────────────┘
```

Beide Server laufen aus demselben Verzeichnis (`/home/vscode/schafkopf-tracker`) und teilen sich denselben `dist/`-Ordner. Die Trennung ist ausschließlich auf Datenbankebene.

---

## Deployment-Prozess

Beide Umgebungen bekommen beim Deployment immer denselben Code:

```bash
# 1. Code lokal committen und pushen
git add .
git commit -m "feat: beschreibung"
git push origin master

# 2. Auf VM: Code holen, bauen, beide Server neustarten
git pull origin master
npm ci
npm run build
pm2 restart schafkopf-prod
pm2 restart schafkopf-dev
```

---

## Lokale Entwicklung

```bash
# Dev-Server starten (Vite :5173 + Express :3001, tracker-dev.db)
npm run dev

# Mit frischer Dev-Datenbank
npm run dev:clean
```

---

## PM2-Befehle

```bash
# Status beider Server
pm2 list

# Logs ansehen
pm2 logs schafkopf-prod
pm2 logs schafkopf-dev

# Einzeln neustarten
pm2 restart schafkopf-prod
pm2 restart schafkopf-dev

# Monitoring
pm2 monit
```

---

## Datenbank-Operationen

### Prod-Daten in Dev kopieren (mit echten Daten testen)

```bash
pm2 stop schafkopf-dev
cp data/tracker.db     data/tracker-dev.db
cp data/tracker.db-shm data/tracker-dev.db-shm
cp data/tracker.db-wal data/tracker-dev.db-wal
pm2 start schafkopf-dev
```

> SQLite WAL-Modus hat immer drei Dateien — beim Kopieren immer alle drei mitnehmen.

### Dev-Datenbank zurücksetzen

```bash
npm run reset:dev   # löscht data/tracker-dev.db*
pm2 restart schafkopf-dev
```

### Prod-Datenbank zurücksetzen (Vorsicht!)

```bash
pm2 stop schafkopf-prod
rm -f data/tracker.db data/tracker.db-shm data/tracker.db-wal
pm2 start schafkopf-prod
# → Server erstellt leere DB automatisch neu
```

---

## Nginx-Konfigurationen

**Prod:** `/etc/nginx/sites-available/schafkopf.eventig.app`
```nginx
location /api {
    proxy_pass http://localhost:3002;
}
```

**Dev:** `/etc/nginx/sites-available/dev.schafkopf.eventig.app`
```nginx
location /api {
    proxy_pass http://localhost:3001;
}
```

---

## SSL/TLS

Zertifikate werden über Certbot verwaltet und automatisch erneuert:

- Prod: `/etc/letsencrypt/live/schafkopf.eventig.app/`
- Dev: `/etc/letsencrypt/live/dev.schafkopf.eventig.app/`

```bash
# Manuell erneuern (normalerweise nicht nötig)
sudo certbot renew
sudo systemctl reload nginx
```

---

## Troubleshooting

### API nicht erreichbar?

```bash
# Status prüfen
pm2 list

# Logs prüfen
pm2 logs schafkopf-prod --lines 50
pm2 logs schafkopf-dev --lines 50

# Direkt testen
curl http://localhost:3002/api/sessions   # Prod
curl http://localhost:3001/api/sessions   # Dev

# Nginx prüfen
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/error.log
```

### Port-Konflikt?

```bash
ss -tlnp | grep -E '3001|3002'
pm2 restart all
```

### Seite zeigt alte Inhalte?

Browser Hard Refresh: `Strg + Shift + R`

Nach Deployment sicherstellen dass `npm run build` ausgeführt wurde.
