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

Wir arbeiten **direkt auf der VM** im Verzeichnis `/home/vscode/schafkopf-tracker`. Kein `git pull` nötig.

```bash
# Frontend bauen
npm run build

# Dev neustarten (Standard)
pm2 restart schafkopf-dev

# Prod neustarten (nur nach expliziter Anfrage)
pm2 restart schafkopf-prod
```

### PM2-Konfiguration (ecosystem.config.cjs)

Die Prozess-Konfiguration liegt in `ecosystem.config.cjs` (muss `.cjs` sein, da `package.json` `"type": "module"` hat):

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

Prozesse neu starten über ecosystem:
```bash
pm2 start ecosystem.config.cjs --only schafkopf-dev
pm2 start ecosystem.config.cjs --only schafkopf-prod
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

### Automatische Backups (aktiv eingerichtet)

Täglich um 02:00 Uhr läuft ein Cronjob der die Prod-DB sicher kopiert:

```bash
# WAL in Hauptdatei zusammenführen, dann kopieren, alte Backups nach 30 Tagen löschen
0 2 * * * sqlite3 /home/vscode/schafkopf-tracker/data/tracker.db 'PRAGMA wal_checkpoint(TRUNCATE);' \
  && cp /home/vscode/schafkopf-tracker/data/tracker.db \
     /home/vscode/backups/schafkopf-tracker/tracker_$(date +\%Y\%m\%d_\%H\%M\%S).db \
  && find /home/vscode/backups/schafkopf-tracker -mtime +30 -delete
```

`PRAGMA wal_checkpoint(TRUNCATE)` ist wichtig — ohne es kann die kopierte Datei inkonsistent sein (WAL-Modus schreibt Updates zunächst in `.db-wal`).

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

### Session-Erstellung zeigt falsche UI für Spieltypen?

**Problem:** Watten-Team-Konfiguration wird bei allen Spielarten angezeigt statt nur bei Watten.

**Ursache:** Spielart-spezifische States werden beim Wechsel nicht korrekt zurückgesetzt.

**Lösung:**
- Stellen Sie sicher, dass `togglePlayer` Funktion `gameType` prüft
- States beim Spielart-Wechsel korrekt initialisieren
- UI-Elemente nur bei korrektem `gameType` anzeigen

```javascript
// Beispiel: Spielart-Wechsel
onClick={() => {
  setGameType(p.id);
  setStake(p.defaultStake);
  if (p.id === 'watten') {
    setTeam1Players([]);
    setTeam2Players([]);
    setSelectedNames([]);
  } else {
    setSelectedNames([]);
    setTeam1Players([]);
    setTeam2Players([]);
  }
}}
```

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

### ⚠️ KRITISCH: Systemd-Dienst kann Dev/Prod mixen

**Problem:** Es existiert ein `schafkopf-backend.service` systemd-Dienst, der ohne `PORT`-Env läuft und Port 3001 mit `NODE_ENV=production` belegt. Das führt dazu dass Dev auf die Prod-Datenbank zugreift.

**Diagnose:**
```bash
sudo systemctl status schafkopf-backend
lsof -i :3001 | grep LISTEN   # Mehrere Prozesse auf Port 3001?
cat /proc/<PID>/environ | tr '\0' '\n' | grep NODE_ENV  # Welches NODE_ENV?
```

**Lösung:**
```bash
sudo systemctl stop schafkopf-backend
sudo systemctl disable schafkopf-backend
# Dann Dev über PM2 neu starten:
pm2 start ecosystem.config.cjs --only schafkopf-dev
```

### ⚠️ WICHTIG: Doppelte Prozesse auf Port 3001 vermeiden

**Problem:** Wenn `npm run dev` läuft und gleichzeitig PM2 gestartet wird, können beide auf Port 3001 laufen. Dies führt dazu, dass Dev auf Prod-Datenbank zugreift.

**KRITISCH: Auch PM2-Prozess-Kollision möglich!**
- PM2 kann beim `restart` oder `delete` alte Prozesse nicht korrekt beenden
- Die alten Prozesse laufen weiter und binden den Port 3001
- `pm2 restart` startet neue Prozesse, aber die alten laufen noch
- Ergebnis: Neue Code-Änderungen sind **nicht aktiv**, weil der alte Prozess noch läuft

**Symptome:**
- Dev zeigt Prod-Daten
- `curl http://localhost:3001/api/sessions` zeigt falsche Daten
- PM2 Dev läuft aber Vite proxyt auf falschen Prozess
- **Code-Änderungen werden nicht sichtbar** (selbst nach `pm2 restart`)
- `pm2 list` zeigt mehrere schafkopf-dev Einträge

**Diagnose:**
```bash
# 1. Prüfe alle Prozesse auf Port 3001
ss -tlnp | grep 3001
# Zeigt mehrere Prozesse auf Port 3001 → Problem!

# 2. PM2 Status prüfen
pm2 list
# Zeigt mehrere schafkopf-dev Einträge? → Problem!

# 3. Welcher Prozess antwortet?
curl http://localhost:3001/api/sessions | head
# Sind das die falschen Daten? → Alter Prozess läuft noch!
```

**Lösung:**
```bash
# 1. Alle Prozesse auf Port 3001 identifizieren
lsof -i :3001 | grep LISTEN

# 2. Nicht-PM2 Prozesse beenden (z.B. npm run dev)
kill <PID_des_anderen_Prozesses>

# 3. Doppelte PM2-Prozesse löschen
pm2 delete <alte_id>
pm2 delete <weitere_alte_id>

# 4. PM2 Dev neu starten
pm2 start "node server/index.js" --name schafkopf-dev -- --env NODE_ENV=development

# 5. Verifizieren
ss -tlnp | grep 3001  # Nur EIN Prozess sollte da sein
pm2 list              # Nur EIN schafkopf-dev sollte da sein
curl http://localhost:3001/api/sessions | head  # Dev-Daten (nicht Prod!)
```

**Prävention:**
- Nie `npm run dev` und PM2 gleichzeitig laufen lassen
- PM2 Dev über PM2 verwalten, nicht über npm scripts
- **Nach jedem Deployment:** `ss -tlnp | grep 3001` und `pm2 list` prüfen
- Bei Doppel-Prozessen: IMMER zuerst alte Prozesse löschen, dann neustarten
- Bei `pm2 restart` mit unerwartetem Ergebnis: Prozesse komplett löschen und neu starten

### Seite zeigt alte Inhalte?

Browser Hard Refresh: `Strg + Shift + R`

Nach Deployment sicherstellen dass `npm run build` ausgeführt wurde.
