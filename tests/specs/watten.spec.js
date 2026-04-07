import { test, expect } from '@playwright/test';

test.describe('Watten', () => {
  const closeOverlays = async (page) => {
    const closeBtn = page.getByText('Schließen').first();
    const commentaryVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
    
    if (commentaryVisible) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
    
    await page.click('body');
    await page.waitForTimeout(300);
    await page.waitForLoadState('networkidle', { timeout: 5000 });
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

  test('WATTEN - GAME - Maschine - Team 2 - Standard', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.locator('button').filter({ hasText: '2' }).filter({ hasText: /^2$/ }).first().click();

    await page.locator('button').filter({ hasText: 'Watten3' }).filter({ hasText: 'Watten4' }).first().click();
    await page.getByText('🤖 Maschine (3 Kritische)').click();
    await page.getByText('✓ Speichern').click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await closeOverlays(page);

    await expect(page.getByText('🤖')).toBeVisible();
  });

  test('WATTEN - GAME - Gegangen - Team 2 - Standard', async ({ page }) => {
    await page.click('text=＋ Neues Spiel');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.locator('button').filter({ hasText: '2' }).filter({ hasText: /^2$/ }).first().click();

    await page.locator('button').filter({ hasText: 'Watten3' }).filter({ hasText: 'Watten4' }).first().click();
    await page.getByText('🏃 Gegangen').click();
    await page.getByText('✓ Speichern').click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await closeOverlays(page);

    await expect(page.getByText('🏃')).toBeVisible();
  });

  test('WATTEN - GAME - Kompletter Durchlauf - Phase 1 + 2 - Dramatisch + Bayerisch', async ({ page }) => {
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

    const addRound = async (points, team, isMachine = false) => {
      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      await page.waitForTimeout(300);

      if (team === 'team1') {
        await page.locator('button').filter({ hasText: 'Watten1' }).filter({ hasText: 'Watten2' }).first().click();
      } else {
        await page.locator('button').filter({ hasText: 'Watten3' }).filter({ hasText: 'Watten4' }).first().click();
      }

      await page.waitForTimeout(300);

      const pointsBtn = page.locator('button').filter({ hasText: points.toString() }).first();
      const isDisabled = await pointsBtn.isDisabled().catch(() => false);

      if (!isDisabled) {
        await pointsBtn.click();
        await page.waitForTimeout(200);
      }

      if (isMachine) {
        await page.getByText('🤖 Maschine (3 Kritische)').click();
      }

      await page.getByText('✓ Speichern').click();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.waitForTimeout(500);
    };

    await addRound(2, 'team1');
    await closeOverlays(page);

    await addRound(3, 'team1');
    await closeOverlays(page);

    await addRound(4, 'team1');
    await closeOverlays(page);

    await addRound(2, 'team1');
    await closeOverlays(page);

    await addRound(3, 'team2');
    await closeOverlays(page);

    await addRound(3, 'team1');
    await closeOverlays(page);
    await page.waitForTimeout(500);

    await expect(page.getByText('＋ Neues Spiel')).toBeVisible();
  });
});
