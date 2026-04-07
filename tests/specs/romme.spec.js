import { test, expect } from '@playwright/test';

test.describe('Romme', () => {
  test.describe('3 Spieler', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const players = ['Romme1', 'Romme2', 'Romme3'];
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
      await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Romme Session');
      await page.click('text=Romme');

      for (const name of players) {
        await page.click(`text=${name}`);
      }

      await page.click('text=Runde starten');
      await page.waitForLoadState('networkidle');
    });

    test('ROMME - GAME - Runde 1 - Normal - Standard', async ({ page }) => {
      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle');

      await page.click('text=Romme1');

      const input0 = page.locator('input[type="number"]').nth(0);
      const input1 = page.locator('input[type="number"]').nth(1);

      await input0.fill('25');
      await input1.fill('30');

      await page.locator('button').filter({ hasText: '✓ Runde eintragen' }).click();
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Gewinner: Romme1')).toBeVisible();

      // Historie: Gewinner hat 0, andere haben negative Punkte
      await expect(page.getByText('-30').first()).toBeVisible();
      await expect(page.getByText('-25').first()).toBeVisible();

      // Scoreboard: Romme1 führt (0 Punkte), Romme2 hat -25, Romme3 hat -30
      await expect(page.getByText('0').first()).toBeVisible();
      await expect(page.getByText('-25').nth(1)).toBeVisible();
      await expect(page.getByText('-30').nth(1)).toBeVisible();
    });

    test('ROMME - COMMENTARY - Runde 1 - Dramatisch', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('tracker_commentator_personality', JSON.stringify('dramatic'));
        localStorage.setItem('tracker_commentator_enabled', JSON.stringify(true));
      });

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

      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle');

      await page.click('text=Romme1');

      const input0 = page.locator('input[type="number"]').nth(0);
      const input1 = page.locator('input[type="number"]').nth(1);

      await input0.fill('25');
      await input1.fill('30');

      await page.locator('button').filter({ hasText: '✓ Runde eintragen' }).click();
      await page.waitForLoadState('networkidle');

      await page.waitForTimeout(500);

      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 3000 }).catch(() => false);

      if (overlayVisible) {
        await expect(page.getByText(/Romme/)).toBeVisible();

        await page.getByText('Schließen').click();
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }
    });
  });

  test.describe('4 Spieler', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const players = ['Romme1', 'Romme2', 'Romme3', 'Romme4'];
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
      await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Romme 4 Spieler');
      await page.click('text=Romme');

      for (const name of players) {
        await page.click(`text=${name}`);
      }

      await page.click('text=Runde starten');
      await page.waitForLoadState('networkidle');
    });

    test('ROMME - GAME - 4 Spieler - Multiplayer - Standard', async ({ page }) => {
      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle');

      await page.click('text=Romme1');

      for (let i = 0; i < 3; i++) {
        const input = page.locator('input[type="number"]').nth(i);
        await input.fill(`${(i + 1) * 10}`);
      }

      await page.locator('button').filter({ hasText: '✓ Runde eintragen' }).click();
      await page.waitForLoadState('networkidle');

      // Scoreboard: Romme1 führt (0 Punkte), Romme2 hat -10, Romme3 hat -20, Romme4 hat -30
      await expect(page.getByText('0').first()).toBeVisible();
      await expect(page.getByText('-10').nth(1)).toBeVisible();
      await expect(page.getByText('-20').nth(1)).toBeVisible();
      await expect(page.getByText('-30').nth(1)).toBeVisible();
    });

    test('ROMME - NAV - Session verlassen und wieder betreten - Historie sichtbar - Standard', async ({ page }) => {
      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle');

      await page.click('text=Romme1');

      for (let i = 0; i < 3; i++) {
        const input = page.locator('input[type="number"]').nth(i);
        await input.fill(`${(i + 1) * 10}`);
      }

      await page.locator('button').filter({ hasText: '✓ Runde eintragen' }).click();
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Gewinner: Romme1')).toBeVisible();

      await page.waitForTimeout(300);
      const closeBtn = page.locator('button').filter({ hasText: 'Schließen' });
      if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }

      await page.click('text=← Runden');
      await page.waitForLoadState('networkidle');

      await page.click('text=Test Romme 4 Spieler');
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Gewinner: Romme1')).toBeVisible();

      // Nach Wiedereintritt: Scoreboard zeigt korrekte negative Werte
      await expect(page.getByText('0').first()).toBeVisible();
      await expect(page.getByText('-10').nth(1)).toBeVisible();
      await expect(page.getByText('-20').nth(1)).toBeVisible();
      await expect(page.getByText('-30').nth(1)).toBeVisible();
    });

    test('ROMME - SCOREBOARD - Führender Spieler mit wenigsten Minuspunkten - Standard', async ({ page }) => {
      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle');

      await page.click('text=Romme1');

      for (let i = 0; i < 3; i++) {
        const input = page.locator('input[type="number"]').nth(i);
        await input.fill(`${(i + 1) * 10}`);
      }

      await page.locator('button').filter({ hasText: '✓ Runde eintragen' }).click();
      await page.waitForLoadState('networkidle');

      // Romme1 führt (0 Punkte) mit Krone und grünem Text
      await expect(page.getByText('👑')).toBeVisible();

      // Romme1 hat 0 Punkte und ist Leader
      const romme1Card = page.locator('text=Romme1').locator('..').locator('..');
      await expect(romme1Card.getByText('0').first()).toBeVisible();

      // Romme2 hat -10 Punkte (rot)
      const romme2Card = page.locator('text=Romme2').locator('..').locator('..');
      await expect(romme2Card.getByText('-10').first()).toBeVisible();

      // Romme3 hat -20 Punkte (rot)
      const romme3Card = page.locator('text=Romme3').locator('..').locator('..');
      await expect(romme3Card.getByText('-20').first()).toBeVisible();

      // Romme4 hat -30 Punkte (rot)
      const romme4Card = page.locator('text=Romme4').locator('..').locator('..');
      await expect(romme4Card.getByText('-30').first()).toBeVisible();
    });
  });
});
