import { test, expect } from '@playwright/test';

test.describe('Skat Spiel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const players = ['Skat1', 'Skat2', 'Skat3'];
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

    await page.click('text=＋ Neue Runde');
    await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Skat Session');
    await page.click('text=Skat');

    for (const name of players) {
      await page.click(`text=${name}`);
    }

    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle');
  });

  test('Skat Grand-Spiel spielen', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');
    await page.waitForLoadState('networkidle');

    await page.click('text=Grand');

    await page.click('text=Skat1');
    await page.click('text=Skat2');

    await page.click('text=Gewonnen');

    await page.click('text=Spiel eintragen');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Grand')).toBeVisible();
    await expect(page.locator('text=Gewonnen')).toBeVisible();
  });
});
