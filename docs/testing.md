# Testing

## Übersicht

E2E-Tests mit [Playwright](https://playwright.dev/). Alle Tests laufen gegen eine isolierte `tracker-test.db` — es werden keine Dev- oder Prod-Daten berührt.

---

## Ausführen

```bash
# Alle Tests
npm run test:e2e

# Mit frischer Test-DB (empfohlen wenn Tests seltsam verhalten)
npm run test:e2e:clean

# Mit interaktivem UI
npm run test:e2e:ui

# Debug-Modus (Schritt für Schritt)
npm run test:e2e:debug

# Nur bestimmte Tests ausführen
npm run test:e2e -- --grep "Testname"
npm run test:e2e -- tests/specs/schafkopf.spec.js
```

---

## Wie das Test-Setup funktioniert

Playwright startet den gesamten Dev-Stack (`Vite + Express`) über `webServer` in `playwright.config.js`:

```js
webServer: {
  command: 'npm run dev:test',   // NODE_ENV=test PORT=3003
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
}
```

`dev:test` ist ein eigenes npm-Script das Port 3003 statt 3001 verwendet, damit Tests nicht mit einem laufenden Dev-Server kollidieren:

```json
"dev:test": "NODE_ENV=test PORT=3003 VITE_API_PORT=3003 concurrently \"vite\" \"node server/index.js\""
```

`NODE_ENV=test` bewirkt in `server/db.js`, dass `tracker-test.db` statt `tracker-dev.db` verwendet wird.

**Vor jedem Test-Run** räumt `tests/global-setup.js` die Test-DB komplett ab:

```js
// tests/global-setup.js
export default async function globalSetup() {
  const testDb = path.join(process.cwd(), 'data', 'tracker-test.db');
  for (const file of [testDb, `${testDb}-shm`, `${testDb}-wal`]) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}
```

Der Server erstellt die DB beim Start automatisch neu (mit leerem Schema).

---

## Spec-Dateien

| Datei | Beschreibung |
|---|---|
| `sessions.spec.js` | Session Management (Archivieren, Löschen, Wiederherstellen) |
| `players.spec.js` | Spieler CRUD, Persönlichkeit, Avatar, Cancel |
| `schafkopf.spec.js` | Schafkopf 3/4 Spieler, Sauspiel/Solo/Geier/Farbwenz, Commentary |
| `wizard.spec.js` | Wizard 3/4 Spieler, Vorhersagen, Commentary |
| `watten.spec.js` | Watten Teams, Maschine/Gegangen/Gespannt, Commentary |
| `skat.spec.js` | Skat Farbspiel/Grand/Null/Ramsch/Re-Bock-Hirsch, 3/4 Spieler |
| `doppelkopf.spec.js` | Doppelkopf Normal/Solo/Kontra/Sonderpunkte |
| `romme.spec.js` | Romme 3/4 Spieler, Commentary |

---

## Naming Convention

Alle Tests folgen einem **4-Teiligen Schema:**

```
SPIEL - KATEGORIE - SZENARIO - PERSÖNLICHKEIT
```

### Kategorien

| Kategorie | Verwendung |
|---|---|
| `GAME` | Gameplay-Flows (Spiel eintragen, Scoring, Live-Score) |
| `SESSION` | Session-Management (Erstellen, Archivieren, Löschen) |
| `COMMENTARY` | Kommentator-Overlay, TTS-Validierung |
| `MANAGEMENT` | Admin-Funktionen (Archiv, Undo) |
| `CRUD` | Create/Read/Update/Delete Operationen |
| `NAV` | Navigation zwischen Views |
| `FEATURE` | Spezifische Features (Avatar, Persönlichkeit) |

### Persönlichkeiten

- `Dramatisch`
- `Bayerisch`
- `Tagesschau`
- `Fan`
- `Standard` (default, ohne spezieller Persönlichkeit)

### Beispiele

```javascript
'SCHAFKOPF - GAME - Sauspiel - 3 Spieler - Dramatisch'
'WATTEN - GAME - Maschine - Team 2 - Standard'
'SESSION - MANAGEMENT - Session archivieren'
'WIZARD - COMMENTARY - Alle Korrekt - 4 Spieler - Dramatisch'
'SKAT - GAME - Ramsch - Auto-Berechnung - Standard'
'PLAYER - CRUD - Spieler erstellen'
'PLAYER - FEATURE - Persönlichkeit auswählen + Tooltip'
```

---

## Wie Tests aufgebaut sein müssen

### Grundstruktur

```javascript
import { test, expect } from '@playwright/test';

test.describe('Spielname', () => {
  test.describe('Spieleranzahl oder Variante', () => {
    test.beforeEach(async ({ page }) => {
      // Setup: Spieler anlegen, Session erstellen
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Spieler erstellen
      const players = ['Spieler1', 'Spieler2', 'Spieler3'];
      for (const name of players) {
        await page.evaluate(async (playerName) => {
          const id = crypto.randomUUID();
          await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name: playerName, avatar: '🃏' }),
          });
        }, name);
      }

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Session erstellen
      await page.click('text=＋ Neue Runde');
      await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Session');
      await page.click('text=Spielname');

      for (const name of players) {
        await page.click(`text=${name}`);
      }

      await page.click('text=Runde starten');
      await page.waitForLoadState('networkidle');
    });

    test('SPIEL - KATEGORIE - Szenario - Persönlichkeit', async ({ page }) => {
      // 1. TTS Mock (für Commentary-Tests)
      await page.evaluate(() => {
        const originalSpeak = window.speechSynthesis?.speak;
        if (originalSpeak) {
          window.speechSynthesis.speak = function(utterance) {
            setTimeout(() => utterance.dispatchEvent(new Event('end')), 5);
            return originalSpeak.call(window.speechSynthesis, utterance);
          };
        }
      });

      // 2. Persönlichkeit setzen (für Commentary-Tests)
      await page.evaluate(() => {
        localStorage.setItem('tracker_commentator_personality', JSON.stringify('dramatic'));
        localStorage.setItem('tracker_commentator_enabled', JSON.stringify(true));
      });

      // 3. Test-Schritte
      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle');

      // UI-Interaktionen
      await page.click('text=Spieltyp');
      await page.click('text=Spieler1');
      await page.click('text=✓ Gewonnen');

      // 4. Overlay schließen (wenn vorhanden)
      await page.waitForTimeout(300);
      const closeBtn = page.locator('button').filter({ hasText: 'Schließen' });
      if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }

      // 5. Assertions
      await expect(page.locator('text=Spieltyp')).toBeVisible();
      await expect(page.locator('text=Gewonnen')).toBeVisible();
      await expect(page.locator('text=Spieler1')).toBeVisible();
    });
  });
});
```

### Setup-Pattern

**Spieler anlegen:**
```javascript
const players = ['Spieler1', 'Spieler2', 'Spieler3'];
for (const name of players) {
  await page.evaluate(async (playerName) => {
    const id = crypto.randomUUID();
    await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: playerName, avatar: '🃏' }),
    });
  }, name);
}
```

**Session erstellen:**
```javascript
await page.click('text=＋ Neue Runde');
await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Session');
await page.click('text=Spielname');

// Spieler auswählen
for (const name of players) {
  await page.click(`text=${name}`);
}

await page.click('text=Runde starten');
await page.waitForLoadState('networkidle');
```

**Watten-Teams:**
```javascript
const team1 = ['Team1Spieler1', 'Team1Spieler2'];
const team2 = ['Team2Spieler1', 'Team2Spieler2'];

for (const name of team1) await page.click(`text=${name}`);
for (const name of team2) await page.click(`text=${name}`);

await page.click('text=13 Punkte');
await page.click('text=Runde starten');
```

### Commentary-Pattern

**TTS Mock:**
```javascript
await page.evaluate(() => {
  const originalSpeak = window.speechSynthesis?.speak;
  if (originalSpeak) {
    window.speechSynthesis.speak = function(utterance) {
      setTimeout(() => utterance.dispatchEvent(new Event('end')), 5);
      return originalSpeak.call(window.speechSynthesis, utterance);
    };
  }
});
```

**Persönlichkeit setzen:**
```javascript
await page.evaluate(() => {
  localStorage.setItem('tracker_commentator_personality', JSON.stringify('dramatic'));
  localStorage.setItem('tracker_commentator_enabled', JSON.stringify(true));
});
```

**Overlay schließen:**
```javascript
await page.waitForTimeout(300);
const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
if (overlayVisible) {
  await page.click('text=Schließen');
  await page.waitForTimeout(300);
}
```

---

## Neue Tests implementieren

**Grundregel: Ein Test nach dem anderen.** Auch wenn 9 Tests geplant sind — erst den ersten schreiben, zum Laufen bringen, dann den zweiten usw. Nie mehrere Tests auf einmal schreiben und dann alle zusammen debuggen.

### Workflow

1. **Einen Test schreiben** — nur den ersten (oder nächsten) in der Spec-Datei
2. **Nur diesen Test ausführen:**
   ```bash
   npm run test:e2e -- --grep "Testname"
   # oder gezielt eine Datei:
   npm run test:e2e -- tests/specs/watten.spec.js
   ```
3. **Test grün machen** — debuggen bis er zuverlässig besteht
4. **Dann erst den nächsten Test schreiben**

### Checkliste für neue Tests

- [ ] Naming Convention folgt dem 4-Teiligen Schema
- [ ] `beforeEach` erstellt saubere Testdaten (Spieler, Session)
- [ ] Commentary-Tests: TTS Mock gesetzt
- [ ] Commentary-Tests: Persönlichkeit gesetzt
- [ ] Commentary-Tests: Overlay nach jedem POST geschlossen
- [ ] Assertions prüfen UI-Elemente und Spielerdaten
- [ ] Test isoliert ausführbar (nicht abhängig von anderen Tests)
- [ ] `waitForLoadState('networkidle')` verwendet statt `waitForTimeout`
- [ ] `getByText()` statt `text=` für Inhalte mit `+` oder `-`
- [ ] `button.filter()` statt `text=` für Buttons

---

## Typische Fallstricke

**Commentary-Overlays blockieren** — nach jedem `POST /rounds` oder `POST /games` kann ein Kommentator-Overlay erscheinen. Das Overlay rendert leicht verzögert nach `networkidle`, daher kurz warten und dann schließen:
```javascript
await page.waitForTimeout(300);
const closeBtn = page.locator('button').filter({ hasText: 'Schließen' });
if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
  await closeBtn.click();
  await page.waitForTimeout(300);
}
```

**`text=` Locator mit `+` oder `-` schlägt fehl** — Playwright interpretiert `+` und `-` in `text=`-Selektoren als CSS-Operatoren. Für Text der mit diesen Zeichen beginnt immer `getByText()` verwenden:
```javascript
// Schlägt fehl (CSS-Parsing-Problem):
await expect(page.locator('text=+30 Punkte')).toBeVisible();
await expect(page.locator('text=-40')).toBeVisible();

// Korrekt:
await expect(page.getByText('+30 Punkte').first()).toBeVisible();
await expect(page.getByText('-40 Punkte').first()).toBeVisible();
```

**Mehrdeutiger Text (Heading vs. Button)** — Wenn Heading und Button denselben Text enthalten (z.B. `<h3>Spiel eintragen</h3>` und `<button>✓ Spiel eintragen — 30 Punkte</button>`), trifft `page.click('text=Spiel eintragen')` das Heading, nicht den Button. Immer gezielt mit `button.filter()` selektieren:
```javascript
// Trifft ggf. das <h3>-Heading statt den Button:
await page.click('text=Spiel eintragen');

// Korrekt:
await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
```

**Checkbox-Locator** — Parent-Traversal mit `locator('text=Label').locator('..').locator('input')` ist unzuverlässig. Stattdessen `getByRole` mit `name` verwenden:
```javascript
// Unzuverlässig:
page.locator('text=Re').locator('..').locator('input[type="checkbox"]');

// Korrekt:
page.getByRole('checkbox', { name: 'Re' });
```

**`waitForTimeout` vermeiden** — stattdessen auf konkrete UI-Elemente warten:
```javascript
// Schlecht:
await page.waitForTimeout(1000);
// Gut:
await expect(page.locator('text=Runde #1')).toBeVisible();
```
Ausnahme: ein kurzes `waitForTimeout(300)` direkt nach `waitForLoadState('networkidle')` ist manchmal nötig, wenn asynchron gerenderete Overlays (z.B. Commentary) auf ihre `isVisible()`-Prüfung warten müssen.

**DB-Zustand zwischen Tests** — `beforeEach` kann keine saubere DB garantieren (nur `globalSetup` vor dem gesamten Run tut das). Tests sollten daher eigene Testdaten anlegen und nicht auf Daten aus vorherigen Tests angewiesen sein.

---

## Hinweise

**`reuseExistingServer: true`** (lokal): Wenn bereits ein Dev-Server auf Port 5173 läuft, wird dieser wiederverwendet. Das kann zu unerwarteten Testergebnissen führen wenn der Server nicht mit `NODE_ENV=test` läuft. Im Zweifel `npm run test:e2e:clean` verwenden.

**Server-Caching nach Backend-Änderungen:** Nach Änderungen am Backend (z.B. neue DB-Spalten, neue Routen) muss der laufende Test-Server neugestartet werden. Prozesse auf Port 3003 und 5173 beenden, dann neu starten:
```bash
kill $(lsof -ti:3003,5173) 2>/dev/null; npm run test:e2e
```
Ohne Neustart kann der Server noch den alten Code ausführen und Tests schlagen mit irreführenden Fehlern fehl.

**API-Calls in Tests:** Für direkte API-Aufrufe (z.B. Spieler anlegen ohne UI) `page.evaluate` mit `fetch` verwenden:
```javascript
await page.evaluate(async (data) => {
  await fetch("/api/players", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
}, data);
```

**Commentary-Tests**: Alle Kommentator-Tests schließen das Overlay aktiv über den ✕-Button, weil TTS im Test-Browser nicht verfügbar ist und das Overlay sich daher nicht automatisch schließt.

**Parallelität**: Tests laufen mit `workers: 1` — sequenziell, keine parallelen Tests. Hintergrund: Alle Tests teilen dieselbe DB und denselben Server-Prozess.
