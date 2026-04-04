import { test, expect } from '@playwright/test';

test.describe('Wizard Spiel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const players = ['Wizard1', 'Wizard2', 'Wizard3', 'Wizard4'];
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
    await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Wizard Session');
    await page.click('text=Wizard');

    for (const name of players) {
      await page.click(`text=${name}`);
    }

    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle');
  });

  test('Wizard Runde spielen', async ({ page }) => {
    await page.click('text=Start');
    await page.waitForLoadState('networkidle');

    const selects = await page.locator('select').all();

    for (let i = 0; i < 4; i++) {
      if (!await selects[i].isDisabled()) {
        await selects[i].selectOption(i === 3 ? '1' : '0');
      }
    }

    await page.click('text=Weiter');

    await page.waitForLoadState('networkidle');

    for (let i = 4; i < 8; i++) {
      if (!await selects[i].isDisabled()) {
        await selects[i].selectOption(i === 7 ? '1' : '0');
      }
    }

    await page.click('text=Speichern');

    await page.waitForLoadState('networkidle');

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Test Wizard Session').first()).toBeVisible();
  });
});
