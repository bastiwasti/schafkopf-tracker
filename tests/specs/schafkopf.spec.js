import { test, expect } from '@playwright/test';

test.describe('Schafkopf', () => {
  test.describe('3 Spieler', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const players = ['Ansager', 'Partner', 'Gegner1'];
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
      await page.fill('input[placeholder*="Freitagsrunde"]', '3 Spieler Session');
      await page.click('text=Schafkopf');

      await page.click('text=Ansager');
      await page.click('text=Partner');
      await page.click('text=Gegner1');

      await page.click('text=Runde starten');
      await page.waitForLoadState('networkidle');
    });

    test('SCHAFKOPF - GAME - Sauspiel - 3 Spieler - Dramatisch', async ({ page }) => {
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

      await page.click('text=Sauspiel');
      await page.click('text=Ansager');
      await page.click('text=Partner');
      await page.click('text=✓ Gewonnen');

      await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
      await page.waitForLoadState('networkidle');

      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      if (overlayVisible) {
        await expect(page.getByText(/Sauspiel/)).toBeVisible();
        await page.locator('button').filter({ hasText: 'Schließen' }).click();
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }

      await expect(page.getByText('Sauspiel', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Gewonnen', { exact: true }).first()).toBeVisible();

      await expect(page.getByText('Ansager', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Partner', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Gegner1', { exact: true }).first()).toBeVisible();

      await expect(page.getByText('+0.50 €').nth(0)).toBeVisible();
      await expect(page.getByText('+0.50 €').nth(1)).toBeVisible();
      await expect(page.getByText('-1.00 €')).toBeVisible();
    });
  });

  test.describe('4 Spieler', () => {
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

    test('SCHAFKOPF - GAME - Sauspiel - Normal - Bayerisch', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('tracker_commentator_personality', JSON.stringify('bavarian'));
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

      await page.getByText('Test Schafkopf Session').first().click();
      await page.waitForLoadState('networkidle');

      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle');

      await page.click('text=Sauspiel');
      await page.click('text=Ansager');
      await page.click('text=Partner');
      await page.click('text=✓ Gewonnen');

      await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
      await page.waitForLoadState('networkidle');

      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      if (overlayVisible) {
        await expect(page.getByText(/Sauspiel/)).toBeVisible();
        await page.getByText('Schließen').click();
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }

      await expect(page.getByText('Sauspiel', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Gewonnen', { exact: true }).first()).toBeVisible();

      await expect(page.getByText('Ansager', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Partner', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Gegner1', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Gegner2', { exact: true }).first()).toBeVisible();

      await expect(page.getByText('+1.00 €').nth(0)).toBeVisible();
      await expect(page.getByText('+1.00 €').nth(1)).toBeVisible();
      await expect(page.getByText('-1.00 €').nth(0)).toBeVisible();
      await expect(page.getByText('-1.00 €').nth(1)).toBeVisible();
    });

    test('SCHAFKOPF - GAME - Solo - Ohne Bock - Dramatisch', async ({ page }) => {
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

      await page.getByText('Test Schafkopf Session').first().click();
      await page.waitForLoadState('networkidle');

      await page.click('text=＋ Neues Spiel');
      await page.waitForLoadState('networkidle');

      await page.click('text=Solo');
      await page.click('text=Ansager');
      await page.click('text=✓ Gewonnen');

      await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
      await page.waitForLoadState('networkidle');

      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      if (overlayVisible) {
        await expect(page.getByText(/Solo/)).toBeVisible();
        await page.locator('button').filter({ hasText: 'Schließen' }).click();
        await page.waitForTimeout(300);
      }

      await expect(page.locator('text=Solo', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Gewonnen', { exact: true }).first()).toBeVisible();

      await expect(page.getByText('Ansager', { exact: true }).first()).toBeVisible();

      await expect(page.getByText('+6.00 €')).toBeVisible();
      await expect(page.getByText('-2.00 €').nth(0)).toBeVisible();
      await expect(page.getByText('-2.00 €').nth(1)).toBeVisible();
      await expect(page.getByText('-2.00 €').nth(2)).toBeVisible();
    });

    test('SCHAFKOPF - GAME - Geier - Verloren - Fan', async ({ page }) => {
      await page.click('text=← Runden');
      await page.waitForLoadState('networkidle');

      await page.evaluate(async () => {
        const id = crypto.randomUUID();
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            name: 'Geier Test Session',
            game_type: 'schafkopf',
            players: ['Ansager', 'Partner', 'Gegner1', 'Gegner2'],
            stake: 0.50,
            schafkopf_options: { geier: true },
          }),
        });
        return res.ok;
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.evaluate(async () => {
        const sessions = await fetch('/api/sessions').then(r => r.json());
        const session = sessions.find(s => s.name === 'Geier Test Session');
        console.log('Session schafkopf_options:', session?.schafkopf_options);
        return session?.schafkopf_options;
      });

      await page.getByText('Geier Test Session').first().click();
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        localStorage.setItem('tracker_commentator_personality', JSON.stringify('fan'));
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

      await expect(page.locator('button').filter({ hasText: 'Geier' }).first()).toBeVisible();
      await page.locator('button').filter({ hasText: 'Geier' }).first().click();
      await page.click('text=Ansager');
      await page.click('text=✕ Verloren');

      await page.locator('button').filter({ hasText: 'Spiel eintragen' }).click();
      await page.waitForLoadState('networkidle');

      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      if (overlayVisible) {
        await page.locator('button').filter({ hasText: 'Schließen' }).click();
        await page.waitForTimeout(300);
      }

      await expect(page.locator('text=Geier').first()).toBeVisible();
      await expect(page.getByText('Verloren', { exact: true }).first()).toBeVisible();

      await expect(page.getByText('Ansager', { exact: true }).first()).toBeVisible();

      await expect(page.getByText('-6.00 €')).toBeVisible();
      await expect(page.getByText('+2.00 €').nth(0)).toBeVisible();
      await expect(page.getByText('+2.00 €').nth(1)).toBeVisible();
      await expect(page.getByText('+2.00 €').nth(2)).toBeVisible();
    });

    test('SCHAFKOPF - COMMENTARY - Geier - Erstmals - Dramatisch', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('tracker_commentator_personality', JSON.stringify('dramatic'));
        localStorage.setItem('tracker_commentator_enabled', JSON.stringify(true));
      });

      await page.evaluate(() => {
        const originalSpeak = window.speechSynthesis?.speak;
        if (originalSpeak) {
          window.speechSynthesis.speak = function(utterance) {
            setTimeout(() => { utterance.dispatchEvent(new Event('end')); }, 5);
            return originalSpeak.call(window.speechSynthesis, utterance);
          };
        }
      });

      const geierSessionName = `Geier Commentary ${Date.now()}`;
      const geierSessionId = await page.evaluate(async (name) => {
        const id = crypto.randomUUID();
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            name,
            game_type: 'schafkopf',
            players: ['Ansager', 'Partner', 'Gegner1', 'Gegner2'],
            stake: 0.50,
            schafkopf_options: { geier: true },
          }),
        });
        return res.ok ? id : null;
      }, geierSessionName);

      expect(geierSessionId).toBeTruthy();

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.click(`text=${geierSessionName}`);
      await page.waitForLoadState('networkidle');

      await page.click('text=＋ Neues Spiel');
      await page.waitForTimeout(300);

      await page.locator('button').filter({ hasText: /^Geier/ }).first().click();
      await page.locator('button').filter({ hasText: 'Ansager' }).first().click();
      await page.locator('button').filter({ hasText: '✓ Gewonnen' }).click();
      await page.locator('button').filter({ hasText: /Spiel eintragen/ }).click();
      await page.waitForTimeout(500);

      const ttsAvailable = await page.evaluate(() => typeof window.speechSynthesis?.speak === 'function');

      if (ttsAvailable) {
        const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 2000 }).catch(() => false);
        if (overlayVisible) {
          await expect(page.getByText(/Geier.*aktiviert|Geier.*einschalten|Geier.*eingeschaltet|Geier.*Modus/)).toBeVisible();

          await page.click('text=Schließen');
          await page.waitForTimeout(300);
          await expect(page.locator('text=Kommentator')).not.toBeVisible();
        }
      }

      await expect(page.getByText(geierSessionName).first()).toBeVisible();
    });

    test('SCHAFKOPF - COMMENTARY - Farbwenz - Erstmals - Bayerisch', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('tracker_commentator_personality', JSON.stringify('bavarian'));
        localStorage.setItem('tracker_commentator_enabled', JSON.stringify(true));
      });

      await page.evaluate(() => {
        const originalSpeak = window.speechSynthesis?.speak;
        if (originalSpeak) {
          window.speechSynthesis.speak = function(utterance) {
            setTimeout(() => { utterance.dispatchEvent(new Event('end')); }, 5);
            return originalSpeak.call(window.speechSynthesis, utterance);
          };
        }
      });

      const farbwenzSessionName = `Farbwenz Commentary ${Date.now()}`;
      const farbwenzSessionId = await page.evaluate(async (name) => {
        const id = crypto.randomUUID();
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            name,
            game_type: 'schafkopf',
            players: ['Ansager', 'Partner', 'Gegner1', 'Gegner2'],
            stake: 0.50,
            schafkopf_options: { farbwenz: true },
          }),
        });
        return res.ok ? id : null;
      }, farbwenzSessionName);

      expect(farbwenzSessionId).toBeTruthy();

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.click(`text=${farbwenzSessionName}`);
      await page.waitForLoadState('networkidle');

      await page.click('text=＋ Neues Spiel');
      await page.waitForTimeout(300);

      await page.locator('button').filter({ hasText: /^Farbwenz/ }).first().click();
      await page.locator('button').filter({ hasText: 'Ansager' }).first().click();
      await page.locator('button').filter({ hasText: '✓ Gewonnen' }).click();
      await page.locator('button').filter({ hasText: /Spiel eintragen/ }).click();
      await page.waitForTimeout(500);

      const ttsAvailable = await page.evaluate(() => typeof window.speechSynthesis?.speak === 'function');

      if (ttsAvailable) {
        const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 2000 }).catch(() => false);
        if (overlayVisible) {
          await expect(page.getByText(/Farbwenz.*einschaltet|Farbwenz.*aktiviert|Farbwenz.*freigegeben|Farbwenz.*Modus/)).toBeVisible();

          await page.click('text=Schließen');
          await page.waitForTimeout(300);
          await expect(page.locator('text=Kommentator')).not.toBeVisible();
        }
      }

      await expect(page.getByText(farbwenzSessionName).first()).toBeVisible();
    });

    test('SCHAFKOPF - COMMENTARY - Solo - Verloren - Tagesschau', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('tracker_commentator_personality', JSON.stringify('tagesschau'));
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

      const sessionId = await page.evaluate(async () => {
        const sessions = await fetch('/api/sessions').then(r => r.json());
        const session = sessions.find(s => s.name === 'Test Schafkopf Session');
        return session?.id;
      });

      expect(sessionId).toBeTruthy();

      const gameCreated = await page.evaluate(async (sid) => {
        const res = await fetch(`/api/sessions/${sid}/games`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'Solo',
            player: 'Ansager',
            partner: null,
            won: false,
            schneider: false,
            schwarz: false,
            laufende: 0,
            bock: 1,
            klopfer: [],
            spielwert: 4.00,
            changes: {
              'Ansager': -12.00,
              'Partner': 4.00,
              'Gegner1': 4.00,
              'Gegner2': 4.00,
            },
          }),
        });
        return res.ok;
      }, sessionId);

      expect(gameCreated).toBe(true);

      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('text=Test Schafkopf Session');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page.getByText('Test Schafkopf Session').first()).toBeVisible();

      const ttsAvailable = await page.evaluate(() => {
        return typeof window.speechSynthesis?.speak === 'function';
      });

      if (ttsAvailable) {
        const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);

        if (overlayVisible) {
          await expect(page.getByText(/Solo|Ansager/)).toBeVisible();
          await expect(page.getByText(/4\.00.*Euro/)).toBeVisible();
          await expect(page.getByText(/verloren|Niederlage/)).toBeVisible();

          await page.click('text=Schließen');
          await page.waitForTimeout(300);
          await expect(page.locator('text=Kommentator')).not.toBeVisible();
        }
      }

      await expect(page.getByText('Test Schafkopf Session').first()).toBeVisible();
    });
  });
});
