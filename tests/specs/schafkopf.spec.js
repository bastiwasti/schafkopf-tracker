import { test, expect } from '@playwright/test';

test.describe('Schafkopf Spiel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const players = ['Ansager', 'Partner', 'Gegner1', 'Gegner2'];
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
    await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Schafkopf Session');
    await page.click('text=Schafkopf');

    for (const name of players) {
      await page.click(`text=${name}`);
    }

    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle');
  });

  test('Schafkopf Sauspiel spielen', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');
    await page.waitForLoadState('networkidle');

    await page.click('text=Sauspiel');

    await page.click('text=Ansager');

    await page.click('text=Partner');

    await page.click('text=Gewonnen');

    await page.click('text=Spiel eintragen');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Sauspiel')).toBeVisible();
    await expect(page.locator('text=Gewonnen')).toBeVisible();
  });
});
