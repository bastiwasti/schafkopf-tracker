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

## Watten

### Spielübersicht

Watten ist ein bayerisches 4-Spieler-Kartenspiel, das **2 gegen 2** (feste Teams) gespielt wird. Eine Session besteht aus mehreren aufeinanderfolgenden Spielen. Jedes Spiel wird bis zum `watten_target_score` (13 oder 15 Punkte) gespielt.

### Teams & Konfiguration

- **Team 1** und **Team 2**: je 2 Spieler, fest für die gesamte Session
- **Zielwert**: 13 oder 15 Punkte (bei Session-Erstellung gewählt, Default 15)
- **Bommerl**: Ein Team das ein Spiel verliert bekommt einen Bommerl (🔴). Wird über alle Spiele der Session gezählt.

### Punkte pro Runde

| Situation | Punkte |
|---|---|
| Normal | 2 |
| Gespannt (auto) | 3 |
| Gegangen | 2 (Standard, vom Gewinner festgelegt) |
| Maschine | 2 (Standard, Sondermarkierung) |
| Bidding/Auspielen | bis 5 |

### Gespannt-Modus

Ein Team ist **gespannt**, wenn sein aktueller Punktestand ≥ `targetScore - 2` ist:

```js
const isTeamGespannt = (team1_score >= targetScore - 2) || (team2_score >= targetScore - 2);
```

**Effekte:**
- Jede Runde zählt automatisch 3 Punkte (unabhängig von Normalwert)
- Punkte-Buttons im Formular werden deaktiviert
- Gegangen-Checkbox wird deaktiviert
- Gelbes Banner wird angezeigt

### Sondermarkierungen

| Markierung | Bedeutung | Effekt auf Punkte |
|---|---|---|
| **Maschine** 🤖 | Spieler hält alle 3 kritischen Karten | Keine automatische Punktänderung — wird im Kommentar erwähnt |
| **Gegangen** 🏃 | Team hat aufgegeben | Keine automatische Punktänderung |

### Spielende & Bommerl

Wenn `team1_score >= targetScore` oder `team2_score >= targetScore`:
1. Das aktive Spiel wird als `is_completed = 1` markiert
2. `bommerl_team` wird auf das **Verlierer-Team** gesetzt
3. Der Spieler sieht einen "Neues Spiel"-Button

### Stiche (optional)

Stiche können eingetragen werden (0–5, Team 1 + Team 2 = 5). Dienen nur als Information für den Kommentator (keine Punkte-Berechnung).

### Score-Berechnung

Erfolgt **im Frontend** (`WattenSession.jsx`):

```js
const { team1_score, team2_score } = displayRounds.reduce((acc, r) => {
  if (r.winning_team === 'team1') acc.team1_score += r.points;
  if (r.winning_team === 'team2') acc.team2_score += r.points;
  return acc;
}, { team1_score: 0, team2_score: 0 });
```

Das Backend überprüft beim POST einer Runde ebenfalls ob das Spiel beendet ist und aktualisiert `watten_games` entsprechend.

---

## Plugin-Schnittstelle

Jedes Spiel-Plugin wird über `createPlugin()` erstellt und in `src/games/index.js` registriert. Die Reihenfolge der Keys bestimmt die Anzeigereihenfolge in der UI:

```js
export const GAME_PLUGINS = {
  schafkopf:   schafkopfPlugin,
  watten:      wattenPlugin,
  doppelkopf:  doppelkopfPlugin,
  skat:        skatPlugin,
  wizard:      wizardPlugin,
};
```

### createPlugin() Factory

`createPlugin(config)` setzt folgende Defaults und merged `config` darüber:

```js
{
  // UI
  showStake: false,
  playerCount: null,        // { min, max } oder null
  playerHint: null,         // Hinweistext unter dem Spieler-Selector im Erstellungsformular

  // Components (null = nicht vorhanden)
  FormComponent: null,
  HistoryCardComponent: null,
  RulesComponent: null,

  // Logic (null = nicht implementiert)
  buildCommentary: null,
  calcBalances: null,
  makeDefaultForm: null,

  // Display
  getSessionMeta: (s) => `${s.game_count} Spiel(e)`,
  getArchiveConfirm: () => "Runde ins Archiv verschieben?",
}
```

### Pflichtfelder

```js
{
  id: string,          // z.B. "doppelkopf"
  label: string,       // z.B. "Doppelkopf"
  description: string,
  defaultStake: number,
}
```

Das **Wizard-Plugin** und das **Watten-Plugin** implementieren keine `FormComponent`/`HistoryCardComponent` — die gesamte UI-Logik liegt in `ScoreSheet.jsx` bzw. `WattenSession.jsx`. `SessionView.jsx` delegiert anhand von `game_type` direkt an diese Komponenten.

---

## Doppelkopf

### Spieltypen

| Typ | Basiswert |
|---|---|
| `Normal` | `stake` |
| `Solo` | `soloValue` (konfigurierbar, Default 3 €) |

### Spielwert-Berechnung

```
spielwert = (base + (kontra ? stake : 0) + ansagePts(ansage)) × bock
```

Wobei `base = soloValue` für Solo, sonst `stake`.

**Ansage-Punkte:**
| Ansage | Zusatzpunkte |
|---|---|
| `keine30` | +1 |
| `keine60` | +2 |
| `keine90` | +3 |
| `schwarz` | +4 |

### Sonderpunkte

Sonderpunkte verschieben zusätzlich Geld zwischen den Parteien. Jeder Sonderpunkt = `stake × bock` pro Einheit.

| Sonderpunkt | Regeln |
|---|---|
| Fuchs | Max. 2 geteilt zwischen Re-Partei und Kontra-Partei |
| Doppelkopf | Unbegrenzt |
| Karlchen | Exklusiv: entweder Re oder Kontra, nicht beide |

### API-Funktionen (src/games/doppelkopf/logic.js)

#### `calcSpielwert({ type, kontra, ansage, bock, stake, soloValue })`
Berechnet den reinen Spielwert ohne Sonderpunkte.

#### `resolveGame({ type, player, partner, won, kontra, ansage, re_sonderpunkte, kontra_sonderpunkte, bock, players, stake, soloValue })`
Berechnet vollständige `changes` für alle Spieler inkl. Sonderpunkte.

**Rückgabe:**
```js
{
  changes: { "Müller": 3.00, "Wagner": 3.00, "Huber": -3.00, "Schmidt": -3.00 },
  spielwert: 3.00  // Basiswert + Sonderpunkte
}
```

### Session-Konfiguration

`solo_value` wird bei Session-Erstellung als `doppelkopf_options: { solo_value: N }` gespeichert (JSON-String in der DB-Spalte `doppelkopf_options`). `DoppelkopfSession.jsx` liest diesen Wert beim Mount.
