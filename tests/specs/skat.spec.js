import { test, expect } from '@playwright/test';

const PLAYERS = ['SkatA', 'SkatB', 'SkatC'];
const PLAYERS_4 = ['Skat4A', 'Skat4B', 'Skat4C', 'Skat4D'];

const closeOverlay = async (page) => {
  // Warte kurz damit das Overlay Zeit hat zu rendern
  await page.waitForTimeout(300);
  for (let i = 0; i < 10; i++) {
    const btn = page.locator('button').filter({ hasText: '✕ Schließen' });
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
      continue;
    }
    const overlay = page.locator('div[style*="position: fixed"]').first();
    if (await overlay.isVisible()) {
      await overlay.click({ force: true });
      await page.waitForTimeout(400);
      continue;
    }
    break;
  }
};

test.describe('Skat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (const name of PLAYERS) {
      await page.evaluate(async (playerName) => {
        await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: crypto.randomUUID(), name: playerName, avatar: '🂡' }),
        });
      }, name);
    }

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('text=＋ Neue Runde');
    await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Skat Runde');
    await page.click('text=Skat');
    for (const name of PLAYERS) {
      await page.click(`text=${name}`);
    }
    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle');
  });

  // ── Test 1 ────────────────────────────────────────────────────────────────
  test('Farbspiel eintragen: Herz mit 2 gewonnen', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');

    await page.click('text=Herz');
    // Mit 2 auswählen (Mit ist default, Zahl 2 klicken)
    await page.locator('button').filter({ hasText: /^2$/ }).first().click();

    await page.click(`text=${PLAYERS[0]}`);
    await page.click('text=✓ Gewonnen');

    // Live-Vorschau: Herz (10) × (2+1) = 30 Punkte
    await expect(page.locator('text=30 Punkte').first()).toBeVisible();

    await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
    await page.waitForLoadState('networkidle');
    await closeOverlay(page);

    await expect(page.locator('text=Herz')).toBeVisible();
    await expect(page.getByText('+30 Punkte').first()).toBeVisible();
  });

  // ── Test 2 ────────────────────────────────────────────────────────────────
  test('Grand mit 1, Schneider: korrekte Punkteberechnung', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');

    await page.click('text=Grand');
    // Spitzen: Mit (default), 1 (default) → bleibt bei 1

    await page.click(`text=${PLAYERS[1]}`);
    await page.click('text=✓ Gewonnen');

    // Schneider ankreuzen
    await page.locator('input[type="checkbox"]').filter({ hasText: '' }).nth(0).check();

    // Grand (24) × (1+1+1 schneider) = 72 Punkte
    await expect(page.locator('text=72 Punkte').first()).toBeVisible();

    await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
    await page.waitForLoadState('networkidle');
    await closeOverlay(page);

    await expect(page.locator('text=Grand')).toBeVisible();
    await expect(page.getByText('+72 Punkte').first()).toBeVisible();
  });

  // ── Test 3 ────────────────────────────────────────────────────────────────
  test('Null Ouvert Hand: fester Wert 59, eintragen', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');

    await page.locator('button').filter({ hasText: 'Ouvert Hand' }).click();

    await page.click(`text=${PLAYERS[2]}`);

    // Fester Wert: 59 Punkte
    await expect(page.locator('text=59 Punkte').first()).toBeVisible();

    await page.click('text=✓ Gewonnen');
    await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
    await page.waitForLoadState('networkidle');
    await closeOverlay(page);

    await expect(page.locator('text=Null Ouvert Hand')).toBeVisible();
    await expect(page.getByText('+59 Punkte').first()).toBeVisible();
  });

  // ── Test 4 ────────────────────────────────────────────────────────────────
  test('Ramsch: Auto-Befüllung und Punkte-Verteilung', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');
    await page.locator('button').filter({ hasText: 'Ramsch' }).click();

    // Zwei Werte eingeben → drittes wird automatisch befüllt
    const inputs = page.locator('input[type="number"]');
    await inputs.nth(0).fill('40');
    await inputs.nth(1).fill('50');

    // Auto-fill: drittes Feld = 30
    await expect(inputs.nth(2)).toHaveValue('30');

    // Summen-Anzeige grün (120/120)
    await expect(page.locator('text=120/120')).toBeVisible();

    await page.click('text=✓ Ramsch eintragen');
    await page.waitForLoadState('networkidle');
    await closeOverlay(page);

    // History zeigt Ramsch
    await expect(page.locator('text=Ramsch')).toBeVisible();

    // Alle Spieler haben negative Punkte im Scoreboard
    await expect(page.getByText('-40 Punkte').first()).toBeVisible();
    await expect(page.getByText('-50 Punkte').first()).toBeVisible();
    await expect(page.getByText('-30 Punkte').first()).toBeVisible();
  });

  // ── Test 5 ────────────────────────────────────────────────────────────────
  test('Re/Bock/Hirsch Abhängigkeitskette', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');

    const reCheck     = page.getByRole('checkbox', { name: 'Re' });
    const bockCheck   = page.getByRole('checkbox', { name: 'Bock' });
    const hirschCheck = page.getByRole('checkbox', { name: 'Hirsch' });

    // Initial: Bock und Hirsch disabled
    await expect(bockCheck).toBeDisabled();
    await expect(hirschCheck).toBeDisabled();

    // Re aktivieren → Bock wird klickbar
    await reCheck.check();
    await expect(bockCheck).toBeEnabled();
    await expect(hirschCheck).toBeDisabled();

    // Bock aktivieren → Hirsch wird klickbar
    await bockCheck.check();
    await expect(hirschCheck).toBeEnabled();

    // Re deaktivieren → Bock und Hirsch werden zurückgesetzt und disabled
    await reCheck.uncheck();
    await expect(bockCheck).toBeDisabled();
    await expect(bockCheck).not.toBeChecked();
    await expect(hirschCheck).toBeDisabled();
    await expect(hirschCheck).not.toBeChecked();
  });
});

// ── 4-Spieler-Session ─────────────────────────────────────────────────────────
test.describe('Skat 4-Spieler', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (const name of PLAYERS_4) {
      await page.evaluate(async (playerName) => {
        await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: crypto.randomUUID(), name: playerName, avatar: '🂡' }),
        });
      }, name);
    }

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.click('text=＋ Neue Runde');
    await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Skat 4er');
    await page.click('text=Skat');
    for (const name of PLAYERS_4) {
      await page.click(`text=${name}`);
    }
    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle');
  });

  // ── Test 6 ────────────────────────────────────────────────────────────────
  test('4-Spieler: Wer-spielt-mit Selektor, Spiel eintragen, Auswahl wird gemerkt', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');

    // "Wer spielt mit?" erscheint — erste 3 vorausgewählt
    await expect(page.getByText('(3/3)')).toBeVisible();

    // D aktivieren → (4/3), Submit ist disabled
    await page.locator('button').filter({ hasText: PLAYERS_4[3] }).first().click();
    await expect(page.getByText('(4/3)')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Spiel eintragen' })).toBeDisabled();

    // A deaktivieren → (3/3), jetzt B/C/D aktiv
    await page.locator('button').filter({ hasText: PLAYERS_4[0] }).first().click();
    await expect(page.getByText('(3/3)')).toBeVisible();

    // Alleinspieler-Sektion zeigt nur die 3 aktiven (B, C, D) — A fehlt
    const alleinspielerSection = page.locator('label').filter({ hasText: 'Alleinspieler' });
    await expect(alleinspielerSection).toBeVisible();
    // D taucht jetzt im Alleinspieler-Bereich auf
    await expect(page.getByText(PLAYERS_4[3]).nth(1)).toBeVisible();

    // Karo mit 1 gewonnen — Declarer ist auto-B (kein extra Klick nötig, vermeidet Ambiguität)
    await page.click('text=✓ Gewonnen');
    await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    for (let i = 0; i < 10; i++) {
      const btn = page.locator('button').filter({ hasText: '✕ Schließen' });
      if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(500); continue; }
      const overlay = page.locator('div[style*="position: fixed"]').first();
      if (await overlay.isVisible()) { await overlay.click({ force: true }); await page.waitForTimeout(400); continue; }
      break;
    }

    await expect(page.locator('text=Karo')).toBeVisible();

    // Zweites Spiel: letzte Auswahl (B/C/D) wird gemerkt
    await page.click('text=＋ Neues Spiel');
    await expect(page.getByText('(3/3)')).toBeVisible();
    // D taucht auch im Alleinspieler-Bereich auf (war in der letzten Auswahl)
    // → wird zweimal angezeigt: in "Wer spielt mit?" und in "Alleinspieler"
    await expect(page.getByText(PLAYERS_4[3]).nth(1)).toBeVisible();
    // Alleinspieler-Section hat genau 3 Buttons (nur die aktiven)
    // und Skat4D ist einer davon — also war das Memory korrekt (Standard wäre A/B/C)
    await expect(page.getByRole('button', { name: PLAYERS_4[3] })).toHaveCount(2); // einmal Wer-spielt-mit, einmal Alleinspieler
  });
});
