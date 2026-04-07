# Test-Restrukturierung Umsetzungsplan

## Ziel
Bessere Struktur für E2E-Tests mit klaren Mustern pro Spiel, keine Redundanz.

## Übersicht

### Vorher (37 Tests in 14 Dateien)
- Fragmentiert auf viele kleine Dateien
- Kein einheitliches Muster
- Commentary getrennt
- Spieler-Tests verteilt
- Redundante SESSION Tests

### Nachher (40 Tests in 8 Dateien)
- Konsolidiertes Players-Modul
- Generische SESSION Tests (1× für alle Spiele)
- Einheitliche GAME Tests pro Spiel
- Commentary integriert
- Klare Test-Namenskonvention

---

## Datei-Struktur

```
tests/specs/
├── players.spec.js            (7 Tests - neu, konsolidiert)
├── sessions.spec.js           (3 Tests - neu, generisch)
├── schafkopf.spec.js         (5 Tests - restrukturiert)
├── wizard.spec.js            (5 Tests - restrukturiert)
├── watten.spec.js            (5 Tests - restrukturiert + Commentary)
├── skat.spec.js              (5 Tests - restrukturiert)
├── romme.spec.js             (5 Tests - restrukturiert)
└── doppelkopf.spec.js        (5 Tests - restrukturiert)
```

### Zu löschende Dateien (6 Stück)
- `app.spec.js` - Überflüssig, Smoke-Test nicht nötig
- `player-nav.spec.js` - In players.spec.js integrieren
- `player-personality-tooltip.spec.js` - In players.spec.js integrieren
- `immediate-cancel.spec.js` - In players.spec.js integrieren
- `schafkopf-commentary.spec.js` - In schafkopf.spec.js integrieren
- `wizard-commentary.spec.js` - In wizard.spec.js integrieren

---

## Test-Namenskonvention

```
[GAME_TYPE] - [CATEGORY] - [SCENARIO] - [OPTIONAL_DETAIL]
```

**Beispiele:**
- `PLAYER - CRUD - Spieler erstellen`
- `SESSION - MANAGEMENT - Session bearbeiten`
- `SCHAFKOPF - GAME - Sauspiel - Normal - Bayerisch`
- `WATTEN - GAME - Gespannt - Bei 11 Punkten - Dramatisch`

---

## Generische SESSION Tests

**Datei:** `sessions.spec.js` (neu, generisch für alle Spiele)

Diese Tests sind für ALLE Spiele identisch und prüfen die UI-Pfade:

1. `SESSION - MANAGEMENT - Session bearbeiten (Name ändern)`
   - Session öffnen
   - Edit-Button klicken
   - Namen ändern
   - Speichern
   - Session-Name prüfen

2. `SESSION - MANAGEMENT - Session archivieren`
   - Session öffnen
   - Archiv-Button klicken
   - Bestätigen
   - Session im Archiv prüfen

3. `SESSION - MANAGEMENT - Session löschen`
   - Session öffnen
   - Löschen-Button klicken
   - Bestätigen
   - Session nicht mehr sichtbar

**Hinweis:** Diese Tests können mit einem beliebigen Spiel (z.B. Schafkopf) ausgeführt werden.

---

## Test-Übersicht pro Modul

### 1. PLAYERS (7 Tests)

**Datei:** `players.spec.js` (neu, konsolidiert)

#### CRUD Tests
1. `PLAYER - CRUD - Spieler erstellen`
2. `PLAYER - CRUD - Spieler bearbeiten`
3. `PLAYER - CRUD - Spieler löschen`
4. `PLAYER - CRUD - Spieler auflisten`

#### Feature Tests
5. `PLAYER - FEATURE - Persönlichkeit auswählen + Tooltip`

#### Navigation Tests
6. `PLAYER - FEATURE - Avatar auswählen`
7. `PLAYER - NAV - Cancel ohne zu speichern`

---

### 2. SCHAFKOPF (5 Tests)

**Datei:** `schafkopf.spec.js` (restrukturiert, commentary integriert)

#### GAME Tests
1. `SCHAFKOPF - GAME - Sauspiel - Normal - Bayerisch`
2. `SCHAFKOPF - GAME - Solo - Ohne Bock - Dramatisch`
3. `SCHAFKOPF - GAME - Solo - Mit Schneider + Laufende - Tagesschau`
4. `SCHAFKOPF - GAME - Ramsch - Alle Spieler haben Punkte - Fan`
5. `SCHAFKOPF - GAME - Geier - Erster Geier - Dramatisch`

---

### 3. WIZARD (5 Tests)

**Datei:** `wizard.spec.js` (restrukturiert, commentary integriert)

#### GAME Tests
1. `WIZARD - GAME - Runde 1 - Alle korrekt - Dramatisch`
2. `WIZARD - GAME - Runde 2 - Alle falsch - Tagesschau`
3. `WIZARD - GAME - Perfektes Blatt - Alle 13 Stiche - Fan`
4. `WIZARD - GAME - Joker gespielt - Spezielle Situation - Bayerisch`
5. `WIZARD - GAME - Session-Ende - Letzte Runde - Dramatisch`

---

### 4. WATTEN (5 Tests)

**Datei:** `watten.spec.js` (restrukturiert, Commentary neu hinzugefügt!)

#### GAME Tests
1. `WATTEN - GAME - Normale Runde - Team 1 gewinnt - Fan`
2. `WATTEN - GAME - Maschine - Alle 3 Kritische - Tagesschau`
3. `WATTEN - GAME - Gegangen - Team 2 gibt auf - Dramatisch`
4. `WATTEN - GAME - Gespannt - Bei 11 Punkten - Bayerisch`
5. `WATTEN - GAME - Bomberl - Verlorenes Spiel - Fan`

---

### 5. SKAT (5 Tests)

**Datei:** `skat.spec.js` (restrukturiert)

#### GAME Tests
1. `SKAT - GAME - Farbspiel - Herz mit 2 - Fan`
2. `SKAT - GAME - Grand - Mit 1 und Schneider - Tagesschau`
3. `SKAT - GAME - Null Ouvert Hand - Fester Wert - Dramatisch`
4. `SKAT - GAME - Ramsch - Auto-Fill + Verteilung - Bayerisch`
5. `SKAT - GAME - 4-Spieler - Wer spielt mit - Fan`

---

### 6. ROMME (5 Tests)

**Datei:** `romme.spec.js` (restrukturiert)

#### GAME Tests
1. `ROMME - GAME - Erste Runde - Normal - Fan`
2. `ROMME - GAME - 500 Punkte - Grenze erreicht - Dramatisch`
3. `ROMME - GAME - 4-Spieler - Verteilung korrekt - Tagesschau`
4. `ROMME - GAME - Mehrere Runden - Kumulative Punkte - Bayerisch`
5. `ROMME - GAME - Undo - Rückgängig machen - Fan`

---

### 7. DOPPELKOPF (5 Tests)

**Datei:** `doppelkopf.spec.js` (restrukturiert)

#### GAME Tests
1. `DOPPELKOPF - GAME - Normales Spiel - Re gewonnen - Fan`
2. `DOPPELKOPF - GAME - Solo - Spieler gewinnt von allen 3 - Dramatisch`
3. `DOPPELKOPF - GAME - Kontra-Re - Kontra-Re gewonnen - Tagesschau`
4. `DOPPELKOPF - GAME - Sonderpunkte - 9 Füchse + Karo-Dame - Bayerisch`
5. `DOPPELKOPF - GAME - Bockrunde - Doppelte Punkte - Fan`

---

## Umsetzungs-Reihenfolge

Wir machen dies gemeinsam, Schritt für Schritt:

### Phase 1: Players Tests (START)
- ✅ Neue `players.spec.js` erstellen
- ✅ 7 Tests implementieren
- ✅ 3 Dateien konsolidieren (player-nav, player-personality-tooltip, immediate-cancel)
- ✅ Tests ausführen und verifizieren

### Phase 2: Sessions Tests (generisch)
- ✅ Neue `sessions.spec.js` erstellen
- ✅ 3 generische Tests implementieren
- ✅ Tests ausführen und verifizieren

### Phase 3: Schafkopf Tests
- ✅ `schafkopf.spec.js` restrukturieren
- ✅ `schafkopf-commentary.spec.js` integrieren
- ✅ 5 Tests implementieren
- ✅ Tests ausführen und verifizieren

### Phase 4: Wizard Tests
- ✅ `wizard.spec.js` restrukturieren
- ✅ `wizard-commentary.spec.js` integrieren
- ✅ 5 Tests implementieren
- ✅ Tests ausführen und verifizieren

### Phase 5: Watten Tests
- ✅ `watten.spec.js` restrukturieren
- ✅ Commentary Tests hinzufügen (fehlt komplett!)
- ✅ 5 Tests implementieren
- ✅ Tests ausführen und verifizieren

### Phase 6: Skat Tests
- ✅ `skat.spec.js` restrukturieren
- ✅ 5 Tests implementieren
- ✅ Tests ausführen und verifizieren

### Phase 7: Romme Tests
- ✅ `romme.spec.js` restrukturieren
- ✅ 5 Tests implementieren
- ✅ Tests ausführen und verifizieren

### Phase 8: Doppelkopf Tests
- ✅ `doppelkopf.spec.js` restrukturieren
- ✅ 5 Tests implementieren
- ✅ Tests ausführen und verifizieren

### Phase 9: Cleanup
- ✅ Überflüssige Dateien löschen
- ✅ Gesamten Test-Suite laufen lassen (`npm run test:e2e`)
- ✅ Verifizieren: Alle 40 Tests grün

---

## GAME Test Pattern

Jeder GAME Test folgt diesem Muster:

```javascript
test('SCHAFKOPF - GAME - Sauspiel - Normal - Bayerisch', async ({ page }) => {
  // 1. Commentary Persönlichkeit setzen
  await page.evaluate(() => {
    localStorage.setItem('tracker_commentator_personality', JSON.stringify('bavarian'));
    localStorage.setItem('tracker_commentator_enabled', JSON.stringify(true));
  });

  // 2. Commentary TTS Mock (damit Overlay sich schließt)
  await page.evaluate(() => {
    const originalSpeak = window.speechSynthesis?.speak;
    if (originalSpeak) {
      window.speechSynthesis.speak = function(utterance) {
        setTimeout(() => {
          utterance.dispatchEvent(new Event('end'));
        }, 5);
        return originalSpeak.call(window.speechSynthesis, utterance);
      };
    }
  });

  // 3. Session öffnen (oder in beforeEach erstellen)
  await page.click('text=Test Schafkopf Session');
  await page.waitForLoadState('networkidle');

  // 4. Spiel konfigurieren
  await page.click('text=＋ Neues Spiel');
  await page.click('text=Sauspiel');
  await page.click('text=Spieler1');
  await page.click('text=Spieler2');
  await page.click('text=✓ Gewonnen');

  // 5. Live Score Vorschau prüfen
  await expect(page.locator('text=1.00 €')).toBeVisible();

  // 6. Spiel eintragen
  await page.click('text=Spiel eintragen');
  await page.waitForLoadState('networkidle');

  // 7. Commentary Overlay prüfen und schließen
  const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
  if (overlayVisible) {
    await expect(page.getByText(/Sauspiel/)).toBeVisible();
    await page.click('text=Schließen');
    await page.waitForTimeout(300);
  }

  // 8. Scoreboard Details prüfen
  await expect(page.getByText('+2.00 €').first()).toBeVisible();
  await expect(page.getByText('-1.00 €').first()).toBeVisible();
});
```

---

## Sessions Management Test Pattern

```javascript
test('SESSION - MANAGEMENT - Session bearbeiten (Name ändern)', async ({ page }) => {
  // 1. Schafkopf-Session erstellen
  await page.click('text=＋ Neue Runde');
  await page.fill('input[placeholder*="Freitagsrunde"]', 'Original Name');
  await page.click('text=Schafkopf');
  for (const name of players) {
    await page.click(`text=${name}`);
  }
  await page.click('text=Runde starten');
  await page.waitForLoadState('networkidle');

  // 2. Session bearbeiten
  await page.click('button:has-text("✏️")'); // Edit-Button
  await page.fill('input[placeholder*="Freitagsrunde"]', 'Neuer Name');
  await page.click('text=Speichern');
  await page.waitForLoadState('networkidle');

  // 3. Session-Name prüfen
  await expect(page.locator('text=Neuer Name')).toBeVisible();
  await expect(page.locator('text=Original Name')).not.toBeVisible();
});
```

---

## Cleanup (Dateien löschen)

Nach erfolgreicher Umsetzung:

```bash
# Überflüssige Dateien löschen
rm tests/specs/app.spec.js
rm tests/specs/player-nav.spec.js
rm tests/specs/player-personality-tooltip.spec.js
rm tests/specs/immediate-cancel.spec.js
rm tests/specs/schafkopf-commentary.spec.js
rm tests/specs/wizard-commentary.spec.js
```

---

## Finaler Test-Run

```bash
# Gesamten Test-Suite laufen lassen
npm run test:e2e

# Erwartetes Ergebnis: 40 Tests bestanden
```

---

## Test-Daten Pattern

Wie bisher - Test-Daten in beforeEach erstellen:

```javascript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Spieler erstellen
  const players = ['Spieler1', 'Spieler2', 'Spieler3', 'Spieler4'];
  for (const name of players) {
    await page.evaluate(async (playerName) => {
      const id = crypto.randomUUID();
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: playerName, avatar: '🃏' }),
      });
      return res.ok;
    }, name);
  }

  // Session erstellen (nicht für Generische SESSION Tests)
  await page.reload();
  await page.waitForLoadState('networkidle');

  await page.click('text=＋ Neue Runde');
  await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Session');
  await page.click('text=Schafkopf');
  for (const name of players) {
    await page.click(`text=${name}`);
  }
  await page.click('text=Runde starten');
  await page.waitForLoadState('networkidle');
});
```

**Hinweis für Generische SESSION Tests:** Diese erstellen ihre eigene Session im Test, kein beforeEach.

---

## Commentary Mock Pattern

Für Commentary Tests (da TTS nicht immer verfügbar):

```javascript
await page.evaluate(() => {
  const originalSpeak = window.speechSynthesis?.speak;
  if (originalSpeak) {
    window.speechSynthesis.speak = function(utterance) {
      setTimeout(() => {
        utterance.dispatchEvent(new Event('end'));
      }, 5);
      return originalSpeak.call(window.speechSynthesis, utterance);
    };
  }
});
```

---

## Scoreboard Details Prüfung

Jeder GAME Test prüft Scoreboard Details:

```javascript
// Balances prüfen
await expect(page.getByText('+2.00 €').first()).toBeVisible();
await expect(page.getByText('-1.00 €').first()).toBeVisible();

// Reihenfolge prüfen (Leader zuerst)
await expect(page.locator('text=👑').first()).toBeVisible(); // Leader-Krone

// Spezielle Marker
await expect(page.locator('text=GESPANNT')).toBeVisible(); // Watten
await expect(page.locator('text=🤖')).toBeVisible(); // Watten Maschine
await expect(page.locator('text=💣')).toBeVisible(); // Watten Bomberl

// Historie-Einträge prüfen
await expect(page.locator('text=Sauspiel')).toBeVisible();
await expect(page.locator('text=Gewonnen')).toBeVisible();
```

---

## Status

- **Phase:** Vorbereitung
- **Start:** Players Tests
- **Status:** 📋 Plan erstellt, Bereit zur Umsetzung
- **Gesamtfortschritt:** 0/9 Phasen
- **Gesamt-Tests:** 40 (vs. 37 vorher)
