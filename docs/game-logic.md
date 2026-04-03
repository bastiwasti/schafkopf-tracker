# Spiellogik

## Schafkopf-Regeln und Wertberechnung

Die Spiellogik ist komplett in `src/games/schafkopf/logic.js` gekapselt und wird sowohl vom Frontend (Live-Berechnung im Formular) als auch vom Backend (Bestätigung) verwendet.

---

## Spieltypen

| Typ | Multiplikator | Beschreibung |
|---|---|---|
| **Sauspiel** | ×1 | Normales Sauspiel mit Farbensau |
| **Solo** | ×4 | Farbensolo |
| **Wenz** | ×4 | Wenz (nur Unter Trumpf) |
| **Solo Tout** | ×8 | Solo mit Tout-Ansage |
| **Wenz Tout** | ×8 | Wenz mit Tout-Ansage |

---

## Spielwert-Berechnung

### Grundformel

```
spielwert = stake × multiplikator × bock × 2^klopfer
```

### Aufbau des Multiplikators

Der Multiplikator setzt sich aus mehreren Komponenten zusammen:

```javascript
mult = spieltyp.multiplikator
     + (schneider ? 1 : 0)
     + (schwarz ? 2 : 0)
     + laufende
```

**Beispiel:**
- Solo (×4) mit Schneider (+1) und 3 Laufenden (+3)
- Bei 50 Cent Einsatz und Bock 1
- `0.50 × (4 + 1 + 3) × 1 = 0.50 × 8 = 4.00 €`

### Klopfer

Jeder Klopfer verdoppelt den Spielwert:

```
0 Klopfer: ×1
1 Klopfer: ×2
2 Klopfer: ×4
3 Klopfer: ×8
```

### Bock-Runde

Der aktuelle Bock-Multiplikator wird auf den gesamten Spielwert angewendet:

```
Normal: ×1
Erster Bock: ×2
Doppel-Bock: ×4
```

**Vollständiges Beispiel:**
- Solo (×4) mit Schneider (+1) und 2 Laufenden (+2) → 7
- Einsatz 50 Cent, 2 Klopfer (×4), Bock 2
- `0.50 × 7 × 4 × 2 = 28.00 €`

---

## Gewinnaufteilung

### Solo-Spiele

Der Alleinspieler spielt gegen alle Gegner:

```javascript
// Solo gewonnen
changes[player] = amount × 3
changes[opponent1] = -amount
changes[opponent2] = -amount
changes[opponent3] = -amount

// Solo verloren
changes[player] = -amount × 3
changes[opponent1] = +amount
changes[opponent2] = +amount
changes[opponent3] = +amount
```

### Sauspiele

Das Spielpaar spielt gegen die Gegenpartei:

```javascript
// Sauspiel gewonnen
changes[player] = amount × 2
changes[partner] = amount × 2
changes[opponent1] = -amount × 2
changes[opponent2] = -amount × 2

// Sauspiel verloren
changes[player] = -amount × 2
changes[partner] = -amount × 2
changes[opponent1] = +amount × 2
changes[opponent2] = +amount × 2
```

---

## API-Funktionen

### `calcSpielwert(formState)`

Berechnet den reinen Spielwert (ohne Kontostand-Änderungen).

**Parameter:**
- `type` – Spieltyp (string)
- `schneider` – Schneider-Flag (boolean)
- `schwarz` – Schwarz-Flag (boolean)
- `laufende` – Anzahl der Laufenden (number)
- `bock` – Bock-Multiplikator (number)
- `klopfer` – Array von Klopfer-Namen (string[])
- `stake` – Grundeinsatz (number)

**Rückgabe:** Spielwert in Euro (number)

---

### `resolveGame(formState)`

Berechnet die vollständigen Änderungen für alle Spieler.

**Zusätzliche Parameter:**
- `player` – Ansagender Spieler (string)
- `partner` – Partner (string, nur bei Sauspiel)
- `won` – Gewinn-Flag (boolean)
- `players` – Array aller Spielernamen (string[])

**Rückgabe:**
```javascript
{
  changes: { "Müller": 4.00, "Huber": 4.00, "Schmidt": -4.00, "Wagner": -4.00 },
  spielwert: 2.00
}
```

---

### `calcBalances(history, players)`

Berechnet die Kontostände für alle Spieler anhand der Historie.

**Parameter:**
- `history` – Array von Spiel-Objekten (nur aktive Spiele)
- `players` – Array aller Spielernamen

**Rückgabe:**
```javascript
{
  "Müller": 12.50,
  "Huber": -5.00,
  "Schmidt": 3.00,
  "Wagner": -10.50
}
```

---

## Plugin-Architektur

### Plugin-Schnittstelle

Jedes Spiel-Plugin muss folgende Felder exportieren:

```javascript
{
  id: string,                    // Eindeutige ID (z. B. "schafkopf")
  label: string,                 // Anzeigename (z. B. "Schafkopf")
  description: string,          // Kurzbeschreibung
  defaultStake: number,          // Standard-Einsatz

  // Logik-Funktionen
  makeDefaultForm: (players) => formState,
  calcSpielwert: (formState) => number,
  resolveGame: (formState) => { changes, spielwert },
  calcBalances: (history, players) => { [name]: number },

  // React-Komponenten
  FormComponent,
  HistoryCardComponent,
  RulesComponent,
}
```

### Form-State-Struktur

Das Formular für einen Spieleintrag hat folgende Struktur:

```javascript
{
  type: "Sauspiel",      // Spieltyp
  player: "Müller",       // Ansagender Spieler
  partner: "Wagner",     // Partner (nur bei Sauspiel)
  won: true,             // Gewinn-Flag
  schneider: false,      // Schneider?
  schwarz: false,        // Schwarz?
  laufende: 0,           // Anzahl Laufende
  klopfer: [],           // Klopfer-Namen
}
```

### Plugin-Registry

Alle Plugins werden in `src/games/index.js` registriert:

```javascript
export const GAME_PLUGINS = {
  schafkopf: schafkopfPlugin,
  // zukünftige Spiele hier ergänzen...
};
```

---

## Integration in UI

### Live-Berechnung

Das Formular berechnet den Spielwert in Echtzeit:

```javascript
// In GameForm.jsx
const spielwert = plugin.calcSpielwert({ ...form, bock, stake, klopfer });
```

### Spiel eintragen

Beim Absenden werden Änderungen berechnet und an die API gesendet:

```javascript
const { changes, spielwert } = plugin.resolveGame({ ...form, bock, players, stake });

await fetch(`/api/sessions/${sessionId}/games`, {
  method: "POST",
  body: JSON.stringify({ type, player, partner, won, schneider, schwarz,
                         laufende, bock, klopfer, spielwert, changes }),
});
```

### Kontostand-Berechnung

Die Scoreboard-Komponente berechnet Kontostände aus der Historie:

```javascript
const activeHistory = history.filter(g => !g.archived_at);
const balances = plugin.calcBalances(activeHistory, players);
```
