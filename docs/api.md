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
  "avatar": "🦊",
  "character_type": "optimist",
  "voice_name": "Anna"
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

> **Wichtig:** Die statischen Routen `/archived` und `/archived/games` müssen vor `/:id` registriert sein — das ist im Code sichergestellt.

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
Listet alle individuell archivierten Schafkopf-Spiele aus noch aktiven Runden.

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

Für Wizard-Runden `game_type: "wizard"` setzen. `stake` kann `0` sein.

Für **Doppelkopf**-Runden (`game_type: "doppelkopf"`) kann optional `doppelkopf_options` mitgegeben werden:
```json
{
  "game_type": "doppelkopf",
  "doppelkopf_options": { "solo_value": 3 }
}
```
`solo_value` ist der Basiswert für Solo-Spiele in Euro (Default: `3`). Wird als JSON-String in der DB gespeichert.

**Response `201`** — Runden-Objekt (ohne `history`)

---

### `GET /api/sessions/:id`
Gibt eine Runde mit vollständiger Spielhistorie zurück.

Für **Schafkopf** enthält `history` die `games`-Objekte.  
Für **Wizard** ist `history` ein leeres Array — Wizard-Runden werden separat über `/wizard-rounds` geladen (siehe unten).

**Response `200`**
```json
{
  "id": "uuid",
  "name": "Freitagsrunde",
  "game_type": "schafkopf",
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
| `bock` | Bock-Multiplikator ändern (nur Schafkopf) |
| `name` | Rundennamen ändern |
| `stake` | Einsatz ändern |

**Response `200`** — aktualisiertes Runden-Objekt  
**Response `404`** — Runde nicht gefunden  
**Response `409`** — Spielerliste kann nicht mehr geändert werden

---

### `DELETE /api/sessions/:id`
Löscht eine Runde endgültig (inkl. aller Spiele via CASCADE). Nur aus dem Archiv heraus verwenden.

**Response `204`**

---

## Schafkopf-Spiele (`/api/sessions/:id/games`)

---

### `POST /api/sessions/:id/games`
Trägt ein neues Schafkopf-Spiel ein.

**Body (Schafkopf)**
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

**Zusatzfelder für Doppelkopf** (werden in denselben Endpunkt gespeichert):
```json
{
  "type": "Normal",
  "player": "Müller",
  "partner": "Wagner",
  "won": true,
  "kontra": false,
  "ansage": null,
  "re_sonderpunkte": { "fuchs": 0, "doppelkopf": 0, "karlchen": 0 },
  "kontra_sonderpunkte": { "fuchs": 0, "doppelkopf": 0, "karlchen": 0 },
  "bock": 1,
  "spielwert": 1.00,
  "changes": { ... }
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
{ "type": "Wenz", "player": "Huber", "won": false, "..." : "..." }
```

Archivierte Spiele können nicht inhaltlich bearbeitet werden.

**Response `200`** — aktualisiertes Spiel-Objekt  
**Response `404`** — Spiel nicht gefunden  
**Response `409`** — Archiviertes Spiel kann nicht bearbeitet werden

---

### `DELETE /api/sessions/:id/games/last`
Macht das zuletzt eingetragene **aktive** Spiel rückgängig (Undo).

**Response `204`**  
**Response `404`** — Kein aktives Spiel gefunden

---

### `DELETE /api/sessions/:id/games/:gameId`
Löscht ein Spiel endgültig. Nur aus dem Archiv heraus verwenden.

**Response `204`**  
**Response `404`** — Spiel nicht gefunden

---

## Wizard-Runden (`/api/sessions/:id/wizard-rounds`)

---

### `GET /api/sessions/:id/wizard-rounds`
Gibt alle aktiven (nicht archivierten) Wizard-Runden einer Session zurück, sortiert nach `round_number`.

**Response `200`**
```json
[
  {
    "id": 1,
    "session_id": "uuid",
    "round_number": 1,
    "predictions": { "Müller": 1, "Huber": 0, "Schmidt": 2, "Wagner": 1 },
    "tricks":      { "Müller": 1, "Huber": 1, "Schmidt": 1, "Wagner": 1 },
    "scores":      { "Müller": 30, "Huber": -10, "Schmidt": -10, "Wagner": -10 },
    "created_at": "2025-04-03T10:00:00.000Z",
    "archived_at": null
  }
]
```

---

### `GET /api/sessions/:id/wizard-rounds/archived`
Gibt alle archivierten Wizard-Runden zurück (derzeit nicht im UI genutzt).

---

### `POST /api/sessions/:id/wizard-rounds`
Speichert eine neue Wizard-Runde. Der Server berechnet `scores` und `round_number` automatisch.

**Body**
```json
{
  "predictions": { "Müller": 2, "Huber": 0, "Schmidt": 1, "Wagner": 1 },
  "tricks":      { "Müller": 1, "Huber": 0, "Schmidt": 2, "Wagner": 1 }
}
```

**Score-Berechnung (serverseitig):**
```
Vorhersage korrekt (pred == actual): 20 + actual × 10
Vorhersage falsch  (pred != actual): −|pred − actual| × 10
```

**Response `201`** — vollständiges Round-Objekt inkl. `scores` und `round_number`  
**Response `400`** — `predictions` oder `tricks` fehlt

---

### `PATCH /api/sessions/:id/wizard-rounds/:roundId`
Bearbeitet eine bestehende Runde (neu berechnet Scores) **oder** archiviert/stellt sie wieder her.

**Zum Bearbeiten:**
```json
{
  "predictions": { "Müller": 1, "..." : "..." },
  "tricks":      { "Müller": 1, "..." : "..." }
}
```

Archivierte Runden können nicht bearbeitet werden.

**Zum Archivieren:**
```json
{ "archived_at": "2025-04-03T10:00:00.000Z" }
```

**Response `200`** — aktualisiertes Round-Objekt  
**Response `404`** — Runde nicht gefunden  
**Response `409`** — Archivierte Runde kann nicht bearbeitet werden

---

### `DELETE /api/sessions/:id/wizard-rounds/last`
Löscht die letzte aktive Wizard-Runde (Undo).

**Response `204`**  
**Response `404`** — Keine Runde zum Löschen

---

### `DELETE /api/sessions/:id/wizard-rounds/:roundId`
Löscht eine Wizard-Runde endgültig.

**Response `204`**  
**Response `404`** — Runde nicht gefunden

---

## Watten (`/api/sessions/:id/watten`)

Alle Watten-Endpunkte sind in `server/routes/watten/games.js` definiert.

---

### `GET /api/sessions/:id/watten/rounds`
Gibt alle aktiven Runden der Session zurück, gruppiert nach Spiel.

**Response `200`**
```json
{
  "all": [
    {
      "id": 1,
      "session_id": "uuid",
      "game_id": 1,
      "round_number": 1,
      "winning_team": "team1",
      "points": 2,
      "is_machine": false,
      "is_spannt_played": false,
      "is_gegangen": false,
      "tricks_team1": 3,
      "tricks_team2": 2,
      "created_at": "..."
    }
  ],
  "byGame": {
    "1": [ /* Runden von Spiel 1 */ ]
  }
}
```

---

### `POST /api/sessions/:id/watten/rounds`
Trägt eine neue Runde ein. Erstellt automatisch ein aktives Spiel falls keines existiert. Schließt das Spiel automatisch ab wenn `watten_target_score` erreicht wird.

**Body**
```json
{
  "winning_team": "team1",
  "points": 2,
  "is_machine": false,
  "is_gegangen": false,
  "tricks_team1": 3,
  "tricks_team2": 2
}
```

`points` Default: `2`. Sonderfälle: `3` bei Gespannt, bis `5` bei Maschine/Bidding.

**Response `201`** — Runden-Objekt  
**Response `400`** — `winning_team` fehlt

---

### `DELETE /api/sessions/:id/watten/rounds/last`
Löscht die letzte Runde (Undo). Falls das zugehörige Spiel danach leer ist, wird es ebenfalls gelöscht.

**Response `204`**  
**Response `404`** — Keine Runde zum Löschen

---

### `GET /api/sessions/:id/watten/games`
Gibt alle aktiven Spiele der Session zurück, aufgeteilt in aktives Spiel und abgeschlossene Spiele.

**Response `200`**
```json
{
  "active": {
    "id": 2,
    "session_id": "uuid",
    "game_number": 2,
    "winner_team": "team1",
    "final_score_team1": 5,
    "final_score_team2": 3,
    "is_completed": false,
    "bommerl_team": null,
    "created_at": "..."
  },
  "completed": [
    {
      "id": 1,
      "game_number": 1,
      "winner_team": "team2",
      "final_score_team1": 13,
      "final_score_team2": 15,
      "is_completed": true,
      "bommerl_team": "team1"
    }
  ],
  "all": [ /* alle Spiele */ ]
}
```

`bommerl_team` ist das Team das verloren hat (und damit einen Bommerl bekommt).

---

### `POST /api/sessions/:id/watten/games`
Startet explizit ein neues Spiel (z.B. nach Spielende über den "Neues Spiel"-Button).

**Response `201`** — Spiel-Objekt  
**Response `400`** — Es gibt bereits ein aktives Spiel

---

### `DELETE /api/sessions/:id/watten/games/last`
Löscht das letzte Spiel inkl. aller zugehörigen Runden.

**Response `204`**  
**Response `404`** — Kein Spiel gefunden
