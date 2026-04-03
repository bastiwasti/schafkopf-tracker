# Spiellogik

---

## Schafkopf

### Spieltypen

| Typ | Basiswert | Beschreibung |
|---|---|---|
| **Sauspiel** | ×1 | Normales Sauspiel mit Farbensau, 2 gegen 2 |
| **Solo** | ×4 | Farbensolo, 1 gegen 3 |
| **Wenz** | ×4 | Wenz (nur Unter Trumpf), 1 gegen 3 |
| **Solo Tout** | ×8 | Solo mit Tout-Ansage |
| **Wenz Tout** | ×8 | Wenz mit Tout-Ansage |

### Spielwert-Berechnung

**Grundformel:**
```
spielwert = stake × multiplikator × bock × 2^(anzahl_klopfer)
```

**Multiplikator-Zusammensetzung:**
```
mult = spieltyp_basis
     + (schneider ? 1 : 0)
     + (schwarz ? 2 : 0)
     + laufende
```

**Beispiel:** Solo (×4) mit Schneider (+1), 3 Laufenden (+3), Einsatz 0,50 €, kein Bock:
```
0.50 × (4 + 1 + 3) × 1 = 4.00 €
```

**Klopfer:** jeder verdoppelt den Gesamtwert:
```
0 Klopfer: ×1  |  1 Klopfer: ×2  |  2 Klopfer: ×4  |  3 Klopfer: ×8
```

**Bock-Runden:**
```
Normal: ×1  |  Bock: ×2  |  Doppel-Bock: ×4
```

### Gewinnaufteilung

**Sauspiel (2 gegen 2):**
```js
// Gewonnen
changes[player]   = +amount × 2
changes[partner]  = +amount × 2
changes[opponent1] = -amount × 2
changes[opponent2] = -amount × 2
```

**Solo/Wenz (1 gegen 3):**
```js
// Gewonnen
changes[player]    = +amount × 3
changes[opponent1] = -amount
changes[opponent2] = -amount
changes[opponent3] = -amount
```

Bei Verlust werden alle Vorzeichen umgekehrt.

### API-Funktionen (src/games/schafkopf/logic.js)

#### `calcSpielwert(formState)`
Berechnet den reinen Spielwert ohne Kontostand-Änderungen. Wird im Formular live aufgerufen.

**Parameter:** `type`, `schneider`, `schwarz`, `laufende`, `bock`, `klopfer[]`, `stake`  
**Rückgabe:** Spielwert in Euro (number)

#### `resolveGame(formState)`
Berechnet die vollständigen Änderungen für alle Spieler.

**Rückgabe:**
```js
{
  changes: { "Müller": 4.00, "Huber": 4.00, "Schmidt": -4.00, "Wagner": -4.00 },
  spielwert: 2.00
}
```

#### `calcBalances(history, players)`
Berechnet Kontostände aus der gesamten aktiven Historie.

**Rückgabe:**
```js
{ "Müller": 12.50, "Huber": -5.00, "Schmidt": 3.00, "Wagner": -10.50 }
```

---

## Wizard

### Spielübersicht

Wizard ist ein Stichvorhersage-Spiel für 3–6 Spieler. In jeder Runde muss jeder Spieler vorhersagen, wie viele Stiche er machen wird.

**Rundenanzahl je nach Spieleranzahl:**

| Spieler | Runden |
|---|---|
| 3 | 20 |
| 4 | 15 |
| 5 | 12 |
| 6 | 10 |

In Runde *n* werden *n* Karten ausgeteilt, also steigen Anzahl der Karten und mögliche Stiche pro Runde.

### Punkteberechnung

Die Berechnung erfolgt **serverseitig** in `server/routes/wizard/rounds.js`:

```js
if (pred === actual) {
  scores[p] = 20 + actual × 10   // Korrekte Vorhersage
} else {
  scores[p] = -(Math.abs(pred - actual) × 10)   // Falsche Vorhersage
}
```

**Beispiele:**

| Vorhersage | Tatsächlich | Punkte |
|---|---|---|
| 2 | 2 | +40 (20 + 2×10) |
| 0 | 0 | +20 (20 + 0×10) |
| 3 | 1 | −20 (−2×10) |
| 1 | 4 | −30 (−3×10) |

### Score Sheet UI-Workflow

Das Wizard Score Sheet hat einen zweiphasigen Workflow pro Runde:

```
[Starten] → Phase: prediction
  User trägt Vorhersagen ein
[Weiter →] → Phase: tricks
  User trägt tatsächliche Stiche ein
[✓ Speichern] → POST /wizard-rounds
  Scores berechnet, Runde gespeichert
  CommentaryOverlay erscheint (falls aktiviert)
```

Gespeicherte Runden zeigen `Vorhersage/Stiche` kompakt an (z.B. `2/1`) mit farbigem Score darunter (grün = korrekt/positiv, rot = falsch/negativ).

Nur die jeweils nächste ausstehende Runde hat einen "Starten"-Button — bereits gespeicherte Runden können über "✎ Edit" bearbeitet werden.

### Undo

Über den "↩ Rückgängig"-Button wird `DELETE /api/sessions/:id/wizard-rounds/last` aufgerufen, was die Runde mit der höchsten `round_number` löscht.

---

## Plugin-Schnittstelle

Jedes Spiel-Plugin wird in `src/games/index.js` registriert:

```js
export const GAME_PLUGINS = {
  schafkopf: schafkopfPlugin,
  wizard: wizardPlugin,
};
```

### Pflichtfelder

```js
{
  id: string,          // z.B. "schafkopf"
  label: string,       // z.B. "Schafkopf"
  description: string,
  defaultStake: number,
}
```

### Optionale Felder (Schafkopf-Plugin)

```js
{
  makeDefaultForm: (players) => formState,
  calcSpielwert: (formState) => number,
  resolveGame: (formState) => { changes, spielwert },
  calcBalances: (history, players) => { [name]: number },
  FormComponent,
  HistoryCardComponent,
  RulesComponent,
}
```

Das **Wizard-Plugin** implementiert diese Felder nicht — die gesamte UI-Logik liegt in `ScoreSheet.jsx`, die Backend-Logik in `server/routes/wizard/rounds.js`. `SessionView.jsx` erkennt `game_type === "wizard"` und rendert direkt `<WizardScoreSheet>` statt der Plugin-Komponenten.
