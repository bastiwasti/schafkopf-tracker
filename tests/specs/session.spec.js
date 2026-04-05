import { test, expect } from '@playwright/test';

test.describe('Session Erstellung', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

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

    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('Schafkopf Session erstellen', async ({ page }) => {
    await page.click('text=＋ Neue Runde');

    await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Schafkopf Session');

    await page.click('text=Schafkopf');

    for (let i = 1; i <= 4; i++) {
      await page.click(`text=Spieler${i}`);
    }

    await page.click('text=Runde starten');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Test Schafkopf Session').first()).toBeVisible();
    await expect(page.locator('text=Schafkopf').first()).toBeVisible();
  });

  test('Wizard Session erstellen', async ({ page }) => {
    await page.click('text=＋ Neue Runde');

    await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Wizard Session');

    await page.click('text=Wizard');

    for (let i = 1; i <= 4; i++) {
      await page.click(`text=Spieler${i}`);
    }

    await page.click('text=Runde starten');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Test Wizard Session').first()).toBeVisible();
    await expect(page.locator('text=Wizard').first()).toBeVisible();
  });

  test('Skat Session erstellen', async ({ page }) => {
    await page.click('text=＋ Neue Runde');

    await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Skat Session');

    await page.click('text=Skat');

    for (let i = 1; i <= 3; i++) {
      await page.click(`text=Spieler${i}`);
    }

    await page.click('text=Runde starten');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Test Skat Session').first()).toBeVisible();
    await expect(page.locator('text=Skat').first()).toBeVisible();
  });
});
