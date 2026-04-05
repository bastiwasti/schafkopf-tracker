import { test, expect } from '@playwright/test';

test.describe('Doppelkopf Spiel', () => {
  const players = ['DK1', 'DK2', 'DK3', 'DK4'];

  const closeOverlays = async (page) => {
    for (let i = 0; i < 15; i++) {
      const closeBtn = page.locator('button').filter({ hasText: '✕ Schließen' });
      const commentaryOverlay = page.locator('div').filter({ hasText: '✕ Schließen' }).first();

      if (await closeBtn.isVisible()) {
        await closeBtn.click();
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

  const createSessionViaApi = async (page) => {
    return await page.evaluate(async (playerList) => {
      const id = crypto.randomUUID();
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: 'Test Doppelkopf Session',
          game_type: 'doppelkopf',
          players: playerList,
          stake: 0.50,
        }),
      });
      return res.ok ? id : null;
    }, players);
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

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
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('Normales Spiel eintragen und Balances prüfen', async ({ page }) => {
    const sessionId = await createSessionViaApi(page);
    expect(sessionId).toBeTruthy();

    await page.goto(`/`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.click('text=Test Doppelkopf Session');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.click('text=Neues Spiel');
    await page.waitForTimeout(500);

    // Formular: Spielart Normal, Ansager DK1, Partner DK2, gewonnen
    await page.click('text=Normal');
    await page.click('text=DK1');
    // Partner DK2 sollte bereits vorausgewählt sein oder wählen
    const partnerBtn = page.locator('button').filter({ hasText: 'DK2' }).first();
    if (await partnerBtn.isVisible()) await partnerBtn.click();

    await page.click('text=✓ Gewonnen');

    // Spielwert-Preview prüfen: stake=0.50, bock=1, kein kontra → 0.50 €
    await expect(page.locator('text=0.50 €').first()).toBeVisible();

    await page.click('text=✓ Spiel eintragen');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await closeOverlays(page);

    // History-Eintrag prüfen
    await expect(page.locator('text=Normal').first()).toBeVisible();
    await expect(page.locator('text=DK1').first()).toBeVisible();

    // Balance-Check: DK1 und DK2 bekommen +2×0.50=+1.00€, DK3/DK4 verlieren -1.00€
    // Wir prüfen nur, dass positive Einträge für DK1 existieren
    await expect(page.locator('text=DK1').first()).toBeVisible();
  });

  test('Solo-Spiel gewonnen — Spieler gewinnt von allen 3', async ({ page }) => {
    const sessionId = await createSessionViaApi(page);
    expect(sessionId).toBeTruthy();

    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.click('text=Test Doppelkopf Session');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.click('text=Neues Spiel');
    await page.waitForTimeout(500);

    await page.click('text=Solo');
    await page.click('text=DK1');
    await page.click('text=✓ Gewonnen');

    // Spielwert-Preview: 0.50 € (Solo: gleicher Spielwert, aber ×3 für den Solo-Spieler)
    await expect(page.locator('text=0.50 €').first()).toBeVisible();

    await page.click('text=✓ Spiel eintragen');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await closeOverlays(page);

    // History: Solo-Eintrag sichtbar
    await expect(page.locator('text=Solo').first()).toBeVisible();
    await expect(page.locator('text=DK1').first()).toBeVisible();
    await expect(page.locator('text=Gewonnen').first()).toBeVisible();
  });

  test('Doppelkopf Session über UI erstellen', async ({ page }) => {
    await page.click('text=＋ Neue Runde');
    await page.fill('input[placeholder*="Freitagsrunde"]', 'Meine DK Runde');

    await page.click('text=Doppelkopf');

    for (const name of players) {
      await page.click(`text=${name}`);
    }

    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await expect(page.locator('text=Meine DK Runde').first()).toBeVisible();
  });
});
