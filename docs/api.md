# REST-API-Referenz

Alle Endpunkte sind unter `/api/` erreichbar. Der Server läuft auf Port `3001`.  
Request- und Response-Bodies sind JSON (`Content-Type: application/json`).

---

## Spieler (`/api/players`)

### `GET /api/players`
Gibt alle registrierten Spieler zurück, alphabetisch sortiert.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "name": "Müller",
    "avatar": "🦊",
    "character_type": "dramatic",
    "voice_name": "Anna",
    "created_at": "2025-04-01T10:00:00.000Z"
  }
]
```

---

### `POST /api/players`
Legt einen neuen Spieler an.

**Body**
```json
{
  "id": "uuid",
  "name": "Müller",
  "avatar": "🦊"
}
```

**Response `201`** — Spieler-Objekt  
**Response `400`** — `id` oder `name` fehlt  
**Response `409`** — Name bereits vergeben

---

### `PATCH /api/players/:id`
Aktualisiert einen oder mehrere Felder.

**Body** (alle Felder optional)
```json
{
  "name": "Neuer Name",
  "avatar": "🐻",
  "character_type": "bavarian",
  "voice_name": "Anna"
}
```

**Response `200`** — aktualisiertes Spieler-Objekt  
**Response `404`** — Spieler nicht gefunden  
**Response `409`** — Name bereits vergeben

---

### `DELETE /api/players/:id`
Löscht einen Spieler aus dem Registry. Bestehende Runden sind nicht betroffen (Spielernamen bleiben erhalten).

**Response `204`** — kein Body  
**Response `404`** — Spieler nicht gefunden

---

## Runden (`/api/sessions`)

> **Wichtig:** Die statischen Routen `/archived` und `/archived/games` müssen vor `/:id` registriert sein — das ist im Code bereits sichergestellt.

---

### `GET /api/sessions`
Listet alle aktiven (nicht archivierten) Runden.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "name": "Freitagsrunde",
    "game_type": "schafkopf",
    "players": ["Müller", "Huber", "Schmidt", "Wagner"],
    "stake": 0.50,
    "bock": 1,
    "created_at": "...",
    "archived_at": null,
    "game_count": 12
  }
]
```

`game_count` zählt nur aktive (nicht archivierte) Spiele.

---

### `GET /api/sessions/archived`
Listet alle archivierten Runden.

**Response `200`** — gleiche Struktur wie `GET /api/sessions`

---

### `GET /api/sessions/archived/games`
Listet alle individuell archivierten Spiele aus noch aktiven Runden (gruppierbar nach `session_id`).

**Response `200`**
```json
[
  {
    "id": 42,
    "session_id": "uuid",
    "session_name": "Freitagsrunde",
    "seq": 7,
    "type": "Solo",
    "player": "Müller",
    "won": true,
    "spielwert": 2.00,
    "archived_at": "2025-04-02T..."
  }
]
```

---

### `POST /api/sessions`
Erstellt eine neue Runde.

**Body**
```json
{
  "id": "uuid",
  "name": "Freitagsrunde",
  "game_type": "schafkopf",
  "players": ["Müller", "Huber", "Schmidt", "Wagner"],
  "stake": 0.50
}
```

**Response `201`** — Runden-Objekt (ohne `history`)

---

### `GET /api/sessions/:id`
Gibt eine Runde mit vollständiger Spielhistorie zurück.

**Response `200`**
```json
{
  "id": "uuid",
  "name": "Freitagsrunde",
  "players": ["Müller", "Huber", "Schmidt", "Wagner"],
  "stake": 0.50,
  "bock": 1,
  "history": [
    {
      "id": 1,
      "seq": 1,
      "type": "Sauspiel",
      "player": "Müller",
      "partner": "Wagner",
      "won": true,
      "schneider": false,
      "schwarz": false,
      "laufende": 0,
      "bock": 1,
      "klopfer": [],
      "spielwert": 0.50,
      "changes": { "Müller": 1.00, "Wagner": 1.00, "Huber": -1.00, "Schmidt": -1.00 },
      "created_at": "...",
      "archived_at": null
    }
  ]
}
```

Boolesche Felder (`won`, `schneider`, `schwarz`) und JSON-Felder (`klopfer`, `changes`, `players`) werden automatisch geparst.

---

### `PATCH /api/sessions/:id`
Aktualisiert eine Runde. Unterstützte Felder:

| Feld | Zweck |
|---|---|
| `archived_at` | Archivieren (`ISO-String`) oder Wiederherstellen (`null`) |
| `bock` | Bock-Multiplikator ändern |
| `name` | Rundennamen ändern |
| `stake` | Einsatz ändern |

Hinweis: Änderungen an `players` sind nach dem ersten Spiel gesperrt. Editieren einer archivierten Runde ist nur für `archived_at` erlaubt.

**Response `200`** — aktualisiertes Runden-Objekt  
**Response `404`** — Runde nicht gefunden  
**Response `409`** — Spielerliste kann nicht mehr geändert werden

---

### `DELETE /api/sessions/:id`
Löscht eine Runde endgültig (inkl. aller Spiele via CASCADE). Nur aus dem Archiv heraus verwenden.

**Response `204`**

---

## Spiele (`/api/sessions/:id/games`)

---

### `POST /api/sessions/:id/games`
Trägt ein neues Spiel ein.

**Body**
```json
{
  "type": "Sauspiel",
  "player": "Müller",
  "partner": "Wagner",
  "won": true,
  "schneider": false,
  "schwarz": false,
  "laufende": 0,
  "bock": 1,
  "klopfer": [],
  "spielwert": 0.50,
  "changes": {
    "Müller": 1.00,
    "Wagner": 1.00,
    "Huber": -1.00,
    "Schmidt": -1.00
  }
}
```

`spielwert` und `changes` werden **im Frontend** berechnet (`resolveGame()`) und hier nur persistiert.

**Response `201`** — Spiel-Objekt mit `seq` und `id`

---

### `PATCH /api/sessions/:id/games/:gameId`
Bearbeitet ein Spiel nachträglich **oder** archiviert/stellt es wieder her.

**Zum Archivieren:**
```json
{ "archived_at": "2025-04-03T10:00:00.000Z" }
```

**Zum Wiederherstellen:**
```json
{ "archived_at": null }
```

**Zum Bearbeiten** (alle Spielfelder, wie beim POST):
```json
{
  "type": "Wenz",
  "player": "Huber",
  "won": false,
  ...
}
```

Archivierte Spiele können nicht inhaltlich bearbeitet werden (nur `archived_at` darf geändert werden).

**Response `200`** — aktualisiertes Spiel-Objekt  
**Response `404`** — Spiel nicht gefunden  
**Response `409`** — Archiviertes Spiel kann nicht bearbeitet werden

---

### `DELETE /api/sessions/:id/games/last`
Macht das zuletzt eingetragene **aktive** Spiel rückgängig (Undo). Archivierte Spiele werden übersprungen.

**Response `204`**  
**Response `404`** — Kein aktives Spiel gefunden

---

### `DELETE /api/sessions/:id/games/:gameId`
Löscht ein Spiel endgültig. Nur aus dem Archiv heraus verwenden.

**Response `204`**  
**Response `404`** — Spiel nicht gefunden
