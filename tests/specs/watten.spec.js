import { test, expect } from '@playwright/test';

test.describe('Watten Spiel', () => {
  const closeOverlays = async (page) => {
    const overlays = page.locator('div[style*="position: fixed"], div[style*="z-index: 1000"]');
    const closeBtn = page.locator('button').filter({ hasText: '✕ Schließen' });
    const commentaryCard = page.locator('div[style*="commentaryCard"]');
    const commentaryOverlay = page.locator('div[style*="commentaryOverlay"]');

    for (let i = 0; i < 15; i++) {
      if (await commentaryOverlay.isVisible()) {
        await commentaryOverlay.click();
        await page.waitForTimeout(500);
        continue;
      }

      if (await commentaryCard.isVisible()) {
        await commentaryOverlay.click();
        await page.waitForTimeout(500);
        continue;
      }

      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(500);
        continue;
      }

      if (await overlays.count() === 0) {
        return;
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    await page.click('body');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const team1 = ['Watten1', 'Watten2'];
    const team2 = ['Watten3', 'Watten4'];
    const allPlayers = [...team1, ...team2];

    for (const name of allPlayers) {
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
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.click('text=＋ Neue Runde');
    await page.fill('input[placeholder*="Freitagsrunde"]', 'Test Watten Session');
    await page.click('text=Watten');

    for (const name of team1) {
      await page.click(`text=${name}`);
    }
    for (const name of team2) {
      await page.click(`text=${name}`);
    }

    await page.click('text=13 Punkte');
    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('Normale Runde eintragen', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const allPointsBtns = await page.locator('button').all();
    for (const btn of allPointsBtns) {
      const text = await btn.textContent();
      if (text === '2') {
        await btn.click();
        await page.waitForTimeout(200);
        break;
      }
    }

    await page.locator('button').filter({ hasText: 'Watten2' }).filter({ hasText: 'Watten1' }).first().click();

    await page.click('text=✓ Speichern');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await closeOverlays(page);
    
    await expect(page.locator('text=2 / 13')).toBeVisible();
  });

  test('Maschine eintragen', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const allPointsBtns = await page.locator('button').all();
    for (const btn of allPointsBtns) {
      const text = await btn.textContent();
      if (text === '2') {
        await btn.click();
        await page.waitForTimeout(200);
        break;
      }
    }

    await page.locator('button').filter({ hasText: 'Watten3' }).filter({ hasText: 'Watten4' }).first().click();
    await page.click('text=🤖 Maschine (3 Kritische)');
    await page.click('text=✓ Speichern');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await closeOverlays(page);
    
    await expect(page.locator('text=🤖')).toBeVisible();
  });

  test('Gegangen eintragen', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const allPointsBtns = await page.locator('button').all();
    for (const btn of allPointsBtns) {
      const text = await btn.textContent();
      if (text === '2') {
        await btn.click();
        await page.waitForTimeout(200);
        break;
      }
    }

    await page.locator('button').filter({ hasText: 'Watten3' }).filter({ hasText: 'Watten4' }).first().click();
    await page.click('text=🏃 Gegangen');
    await page.click('text=✓ Speichern');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await closeOverlays(page);
    
    await expect(page.locator('text=🏃')).toBeVisible();
  });

  test('Gespannt-Modus testen', async ({ page }) => {
    const rounds = [
      { points: 2, team: 'team1' },
      { points: 2, team: 'team1' },
      { points: 3, team: 'team1' },
      { points: 4, team: 'team1' },
    ];
    
    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];
      
      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      if (round.team === 'team1') {
        await page.locator('button').filter({ hasText: 'Watten2' }).filter({ hasText: 'Watten1' }).first().click();
      } else {
        await page.locator('button').filter({ hasText: 'Watten3' }).filter({ hasText: 'Watten4' }).first().click();
      }

      const allPointsBtns = await page.locator('button').all();
      for (const btn of allPointsBtns) {
        const text = await btn.textContent();
        if (text === round.points.toString()) {
          await btn.click();
          await page.waitForTimeout(200);
          break;
        }
      }

      await page.click('text=✓ Speichern');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Overlays schließen
      await closeOverlays(page);
      await page.waitForTimeout(500);
      await closeOverlays(page);
    }

    await expect(page.locator('text=/\\d+ \\/ 13/').nth(0)).toHaveText('11 / 13');
    await expect(page.locator('text=GESPANNT!')).toBeVisible();
  });
});
