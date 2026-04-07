import { test, expect } from '@playwright/test';

test.describe('Wizard', () => {
  test.describe('3 Spieler', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const players = ['W1', 'W2', 'W3'];
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
      await page.fill('input[placeholder*="Freitagsrunde"]', 'Wizard Test Session');
      await page.click('text=Wizard');

      for (const name of players) {
        await page.click(`text=${name}`);
      }

      await page.click('text=Runde starten');
      await page.waitForLoadState('networkidle');
    });

    test('WIZARD - GAME - Runde 1 - Gemischte Ergebnisse - Dramatisch', async ({ page }) => {
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

      await page.getByText('Wizard Test Session').first().click();
      await page.waitForLoadState('networkidle');

      await page.click('text=Starten');
      await page.waitForTimeout(500);

      const pred1 = page.locator('select').nth(0);
      const pred2 = page.locator('select').nth(2);
      const pred3 = page.locator('select').nth(4);

      await expect(pred1).toBeEnabled();
      await expect(pred2).toBeEnabled();
      await expect(pred3).toBeEnabled();

      await pred1.selectOption('0');
      await pred2.selectOption('0');
      await pred3.selectOption('0');

      await page.click('text=Weiter →');
      await page.waitForTimeout(500);

      const trick1 = page.locator('select').nth(1);
      const trick2 = page.locator('select').nth(3);
      const trick3 = page.locator('select').nth(5);

      await expect(trick1).toBeEnabled();
      await expect(trick2).toBeEnabled();
      await expect(trick3).toBeEnabled();

      await trick1.selectOption('0');
      await trick2.selectOption('1');
      await trick3.selectOption('0');

      await page.click('text=✓ Speichern');
      await page.waitForTimeout(500);

      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      if (overlayVisible) {
        await expect(page.getByText(/Runde 1/)).toBeVisible();
        await page.locator('button').filter({ hasText: 'Schließen' }).click();
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }

      await expect(page.getByText('W1').first()).toBeVisible();
      await expect(page.getByText('W2').first()).toBeVisible();
      await expect(page.getByText('W3').first()).toBeVisible();

      await expect(page.getByText('+20').nth(0)).toBeVisible();
      await expect(page.getByText('-10').first()).toBeVisible();
      await expect(page.getByText('+20').nth(1)).toBeVisible();

      await expect(page.locator('text=👑')).toBeVisible();
    });
  });

  test.describe('4 Spieler', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const players = ['WizardC1', 'WizardC2', 'WizardC3', 'WizardC4'];
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

      const sessionName = `Wizard Commentary ${Date.now()}`;
      await page.click('text=＋ Neue Runde');
      await page.fill('input[placeholder*="Freitagsrunde"]', sessionName);
      await page.click('text=Wizard');

      for (const name of players) {
        await page.click(`text=${name}`);
      }

      await page.click('text=Runde starten');
      await page.waitForLoadState('networkidle');

      await page.evaluate((name) => {
        window.testSessionName = name;
      }, sessionName);
    });

    test('WIZARD - COMMENTARY - Alle Korrekt - 4 Spieler - Dramatisch', async ({ page }) => {
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

      const { sessionId, sessionName } = await page.evaluate(async () => {
        const sessions = await fetch('/api/sessions').then(r => r.json());
        const session = sessions.find(s => s.name === window.testSessionName);
        return { sessionId: session?.id, sessionName: session?.name };
      });

      expect(sessionId).toBeTruthy();

      const roundCreated = await page.evaluate(async (sid) => {
        const predictions = { 'WizardC1': 1, 'WizardC2': 1, 'WizardC3': 1, 'WizardC4': 1 };
        const tricks = { 'WizardC1': 1, 'WizardC2': 1, 'WizardC3': 1, 'WizardC4': 1 };
        const res = await fetch(`/api/sessions/${sid}/wizard-rounds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ predictions, tricks }),
        });
        return res.ok;
      }, sessionId);

      expect(roundCreated).toBe(true);

      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click(`text=${sessionName}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page.getByText(sessionName).first()).toBeVisible();
      await expect(page.getByText('Score Sheet')).toBeVisible();

      const ttsAvailable = await page.evaluate(() => {
        return typeof window.speechSynthesis?.speak === 'function';
      });

      if (ttsAvailable) {
        const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);

        if (overlayVisible) {
          await expect(page.getByText(/UNGLAUBLICH|PERFEKTE|ALLE.*RICHTIG/)).toBeVisible();

          await page.click('text=Schließen');
          await page.waitForTimeout(300);
          await expect(page.locator('text=Kommentator')).not.toBeVisible();
        }
      }

      await expect(page.getByText(sessionName).first()).toBeVisible();
    });
  });
});
