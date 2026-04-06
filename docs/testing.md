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
| `app.spec.js` | App lädt, Basis-Smoke-Test |
| `session.spec.js` | Session-Erstellung für alle Spieltypen |
| `player.spec.js` | Spieler Management (CRUD) |
| `player-nav.spec.js` | Navigation zur Spieler-Ansicht |
| `immediate-cancel.spec.js` | Formular abbrechen ohne zu speichern |
| `schafkopf.spec.js` | Schafkopf Spiel-Flow (Spiel eintragen, Undo, Archiv) |
| `schafkopf-commentary.spec.js` | Schafkopf Kommentator-Overlay |
| `wizard.spec.js` | Wizard Runden-Flow (Prediction, Tricks, Score) |
| `wizard-commentary.spec.js` | Wizard Kommentator-Overlay inkl. TTS-Validierung |
| `skat.spec.js` | Skat: Farbspiel, Grand+Schneider, Null Ouvert Hand, Ramsch (Auto-Fill + Punkte), Re/Bock/Hirsch-Abhängigkeit |
| `watten.spec.js` | Watten Spiel-Flow (Teams, Runden, Gespannt, Bommerl) |
| `doppelkopf.spec.js` | Doppelkopf Spiel-Flow (Normal, Solo, Kontra, Sonderpunkte) |
| `player-personality-tooltip.spec.js` | Persönlichkeit wird gespeichert + Tooltip zeigt korrektes Label |

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

### Einzelnen Test isolieren

```bash
# Nur Tests deren Name "Gespannt" enthält
npm run test:e2e -- --grep "Gespannt"

# Nur eine Spec-Datei
npm run test:e2e -- tests/specs/watten.spec.js

# Mit UI (empfohlen beim Entwickeln neuer Tests)
npm run test:e2e:ui
```

### Beim Debuggen

```bash
# Debug-Modus: Browser öffnet sich, Schritt für Schritt
npm run test:e2e:debug -- tests/specs/watten.spec.js

# Frische DB wenn Zustand unklar
npm run test:e2e:clean -- tests/specs/watten.spec.js
```

### Typische Fallstricke

**Commentary-Overlays blockieren** — nach jedem `POST /rounds` oder `POST /games` kann ein Kommentator-Overlay erscheinen. Das Overlay rendert leicht verzögert nach `networkidle`, daher kurz warten und dann in einer Schleife schließen:
```js
const closeOverlay = async (page) => {
  await page.waitForTimeout(300); // Overlay braucht einen Moment zum Rendern
  for (let i = 0; i < 10; i++) {
    const btn = page.locator('button').filter({ hasText: '✕ Schließen' });
    if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(500); continue; }
    const overlay = page.locator('div[style*="position: fixed"]').first();
    if (await overlay.isVisible()) { await overlay.click({ force: true }); await page.waitForTimeout(400); continue; }
    break;
  }
};
```

**`text=` Locator mit `+` oder `-` schlägt fehl** — Playwright interpretiert `+` und `-` in `text=`-Selektoren als CSS-Operatoren. Für Text der mit diesen Zeichen beginnt immer `getByText()` verwenden:
```js
// Schlägt fehl (CSS-Parsing-Problem):
await expect(page.locator('text=+30 Punkte')).toBeVisible();
await expect(page.locator('text=-40')).toBeVisible();

// Korrekt:
await expect(page.getByText('+30 Punkte').first()).toBeVisible();
await expect(page.getByText('-40 Punkte').first()).toBeVisible();
```

**Mehrdeutiger Text (Heading vs. Button)** — Wenn Heading und Button denselben Text enthalten (z.B. `<h3>Spiel eintragen</h3>` und `<button>✓ Spiel eintragen — 30 Punkte</button>`), trifft `page.click('text=Spiel eintragen')` das Heading, nicht den Button. Immer gezielt mit `button.filter()` selektieren:
```js
// Trifft ggf. das <h3>-Heading statt den Button:
await page.click('text=Spiel eintragen');

// Korrekt:
await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
```

**Checkbox-Locator** — Parent-Traversal mit `locator('text=Label').locator('..').locator('input')` ist unzuverlässig. Stattdessen `getByRole` mit `name` verwenden:
```js
// Unzuverlässig:
page.locator('text=Re').locator('..').locator('input[type="checkbox"]');

// Korrekt:
page.getByRole('checkbox', { name: 'Re' });
```

**`waitForTimeout` vermeiden** — stattdessen auf konkrete UI-Elemente warten:
```js
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

**API-Calls in Tests:** Für direkte API-Aufrufe (z.B. Spieler anlegen ohne UI) `request`-Fixtures verwenden statt `page.evaluate`:
```js
// Gut: request-Fixture (eigener HTTP-Client, kein Browser-Kontext)
test("...", async ({ page, request }) => {
  await request.post("http://localhost:3003/api/players", { data: { ... } });
});

// Alternativ: page.evaluate (läuft im Browser-Kontext, fetch-basiert)
await page.evaluate(async (data) => {
  await fetch("/api/players", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
}, data);
```

**Commentary-Tests**: Die Kommentator-Tests (`wizard-commentary.spec.js`, `schafkopf-commentary.spec.js`) schließen das Overlay aktiv über den ✕-Button, weil TTS im Test-Browser nicht verfügbar ist und das Overlay sich daher nicht automatisch schließt.

**Parallelität**: Tests laufen mit `workers: 1` — sequenziell, keine parallelen Tests. Hintergrund: Alle Tests teilen dieselbe DB und denselben Server-Prozess.
