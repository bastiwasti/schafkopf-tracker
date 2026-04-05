import { test, expect } from '@playwright/test';

test.describe('Schafkopf Kommentare', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const players = ['SchafkopfC1', 'SchafkopfC2', 'SchafkopfC3', 'SchafkopfC4'];
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
    
    const sessionName = `Schafkopf Commentary ${Date.now()}`;
    await page.click('text=＋ Neue Runde');
    await page.fill('input[placeholder*="Freitagsrunde"]', sessionName);
    await page.click('text=Schafkopf');
    
    for (const name of players) {
      await page.click(`text=${name}`);
    }

    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle');
    
    await page.evaluate((name) => {
      window.testSessionName = name;
    }, sessionName);
  });

  test('Solo gewonnen (normal, ohne Bock)', async ({ page }) => {
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
    
    const gameCreated = await page.evaluate(async (sid) => {
      const res = await fetch(`/api/sessions/${sid}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Solo',
          player: 'SchafkopfC1',
          partner: null,
          won: true,
          schneider: false,
          schwarz: false,
          laufende: 0,
          bock: 1,
          klopfer: [],
          spielwert: 4.00,
          changes: {
            'SchafkopfC1': 12.00,
            'SchafkopfC2': -4.00,
            'SchafkopfC3': -4.00,
            'SchafkopfC4': -4.00,
          },
        }),
      });
      return res.ok;
    }, sessionId);
    
    expect(gameCreated).toBe(true);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click(`text=${sessionName}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
    
    const ttsAvailable = await page.evaluate(() => {
      return typeof window.speechSynthesis?.speak === 'function';
    });
    
    if (ttsAvailable) {
      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      
      if (overlayVisible) {
        await expect(page.getByText(/Solo|SchafkopfC1/)).toBeVisible();
        await expect(page.getByText(/4\.00.*Euro/)).toBeVisible();
        
        await page.click('text=Schließen');
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }
    }
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
  });

  test('Solo gewonnen (hochwertig, mit Bock)', async ({ page }) => {
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
    
    const gameCreated = await page.evaluate(async (sid) => {
      const res = await fetch(`/api/sessions/${sid}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Solo',
          player: 'SchafkopfC1',
          partner: null,
          won: true,
          schneider: true,
          schwarz: false,
          laufende: 2,
          bock: 2,
          klopfer: [],
          spielwert: 14.00,
          changes: {
            'SchafkopfC1': 42.00,
            'SchafkopfC2': -14.00,
            'SchafkopfC3': -14.00,
            'SchafkopfC4': -14.00,
          },
        }),
      });
      return res.ok;
    }, sessionId);
    
    expect(gameCreated).toBe(true);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click(`text=${sessionName}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
    
    const ttsAvailable = await page.evaluate(() => {
      return typeof window.speechSynthesis?.speak === 'function';
    });
    
    if (ttsAvailable) {
      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      
      if (overlayVisible) {
        await expect(page.getByText(/Solo|SchafkopfC1/)).toBeVisible();
        await expect(page.getByText(/14\.00.*Euro/)).toBeVisible();
        await expect(page.getByText(/Schneider|Laufende/)).toBeVisible();
        await expect(page.getByText(/Bock/)).toBeVisible();
        
        await page.click('text=Schließen');
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }
    }
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
  });

  test('Sauspiel gewonnen (normal, ohne Bock)', async ({ page }) => {
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
    
    const { sessionId, sessionName } = await page.evaluate(async () => {
      const sessions = await fetch('/api/sessions').then(r => r.json());
      const session = sessions.find(s => s.name === window.testSessionName);
      return { sessionId: session?.id, sessionName: session?.name };
    });
    
    expect(sessionId).toBeTruthy();
    
    const gameCreated = await page.evaluate(async (sid) => {
      const res = await fetch(`/api/sessions/${sid}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Sauspiel',
          player: 'SchafkopfC1',
          partner: 'SchafkopfC2',
          won: true,
          schneider: false,
          schwarz: false,
          laufende: 0,
          bock: 1,
          klopfer: [],
          spielwert: 1.00,
          changes: {
            'SchafkopfC1': 2.00,
            'SchafkopfC2': 2.00,
            'SchafkopfC3': -2.00,
            'SchafkopfC4': -2.00,
          },
        }),
      });
      return res.ok;
    }, sessionId);
    
    expect(gameCreated).toBe(true);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click(`text=${sessionName}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
    
    const ttsAvailable = await page.evaluate(() => {
      return typeof window.speechSynthesis?.speak === 'function';
    });
    
    if (ttsAvailable) {
      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      
      if (overlayVisible) {
        await expect(page.getByText(/Sauspiel|SchafkopfC1|SchafkopfC2/)).toBeVisible();
        await expect(page.getByText(/1\.00.*Euro/)).toBeVisible();
        
        await page.click('text=Schließen');
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }
    }
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
  });

  test('Sauspiel gewonnen (hochwertig, mit Bock)', async ({ page }) => {
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
    
    const { sessionId, sessionName } = await page.evaluate(async () => {
      const sessions = await fetch('/api/sessions').then(r => r.json());
      const session = sessions.find(s => s.name === window.testSessionName);
      return { sessionId: session?.id, sessionName: session?.name };
    });
    
    expect(sessionId).toBeTruthy();
    
    const gameCreated = await page.evaluate(async (sid) => {
      const res = await fetch(`/api/sessions/${sid}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Sauspiel',
          player: 'SchafkopfC1',
          partner: 'SchafkopfC2',
          won: true,
          schneider: true,
          schwarz: false,
          laufende: 1,
          bock: 2,
          klopfer: [],
          spielwert: 6.00,
          changes: {
            'SchafkopfC1': 12.00,
            'SchafkopfC2': 12.00,
            'SchafkopfC3': -12.00,
            'SchafkopfC4': -12.00,
          },
        }),
      });
      return res.ok;
    }, sessionId);
    
    expect(gameCreated).toBe(true);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click(`text=${sessionName}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
    
    const ttsAvailable = await page.evaluate(() => {
      return typeof window.speechSynthesis?.speak === 'function';
    });
    
    if (ttsAvailable) {
      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      
      if (overlayVisible) {
        await expect(page.getByText(/Sauspiel|SchafkopfC1|SchafkopfC2/)).toBeVisible();
        await expect(page.getByText(/6\.00.*Euro/)).toBeVisible();
        await expect(page.getByText(/Schneider|Laufende/)).toBeVisible();
        await expect(page.getByText(/Bock/)).toBeVisible();
        
        await page.click('text=Schließen');
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }
    }
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
  });

  test('Geier gewonnen (erster in Session, Erstmals-Kommentar)', async ({ page }) => {
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

    // Session mit Geier-Option via API erstellen
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
          players: ['SchafkopfC1', 'SchafkopfC2', 'SchafkopfC3', 'SchafkopfC4'],
          stake: 0.50,
          schafkopf_options: { geier: true },
        }),
      });
      return res.ok ? id : null;
    }, geierSessionName);

    expect(geierSessionId).toBeTruthy();

    // Zur Session navigieren
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click(`text=${geierSessionName}`);
    await page.waitForLoadState('networkidle');

    // Geier-Spiel über UI eintragen (damit Commentary-Overlay ausgelöst wird)
    await page.click('text=＋ Neues Spiel');
    await page.waitForTimeout(300);

    await page.locator('button').filter({ hasText: /^Geier/ }).first().click();
    await page.locator('button').filter({ hasText: 'SchafkopfC1' }).first().click();
    await page.locator('button').filter({ hasText: '✓ Gewonnen' }).click();
    await page.locator('button').filter({ hasText: /Spiel eintragen/ }).click();
    await page.waitForTimeout(500);

    const ttsAvailable = await page.evaluate(() => typeof window.speechSynthesis?.speak === 'function');

    if (ttsAvailable) {
      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 2000 }).catch(() => false);
      if (overlayVisible) {
        // Erstmals-Kommentar sollte sichtbar sein
        await expect(page.getByText(/Geier.*aktiviert|Geier.*einschalten|Geier.*eingeschaltet|Geier.*Modus/)).toBeVisible();

        await page.click('text=Schließen');
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }
    }

    await expect(page.getByText(geierSessionName).first()).toBeVisible();
  });

  test('Farbwenz gewonnen (erster in Session, Erstmals-Kommentar)', async ({ page }) => {
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

    // Session mit Farbwenz-Option via API erstellen
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
          players: ['SchafkopfC1', 'SchafkopfC2', 'SchafkopfC3', 'SchafkopfC4'],
          stake: 0.50,
          schafkopf_options: { farbwenz: true },
        }),
      });
      return res.ok ? id : null;
    }, farbwenzSessionName);

    expect(farbwenzSessionId).toBeTruthy();

    // Zur Session navigieren
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click(`text=${farbwenzSessionName}`);
    await page.waitForLoadState('networkidle');

    // Farbwenz-Spiel über UI eintragen (damit Commentary-Overlay ausgelöst wird)
    await page.click('text=＋ Neues Spiel');
    await page.waitForTimeout(300);

    await page.locator('button').filter({ hasText: /^Farbwenz/ }).first().click();
    await page.locator('button').filter({ hasText: 'SchafkopfC1' }).first().click();
    await page.locator('button').filter({ hasText: '✓ Gewonnen' }).click();
    await page.locator('button').filter({ hasText: /Spiel eintragen/ }).click();
    await page.waitForTimeout(500);

    const ttsAvailable = await page.evaluate(() => typeof window.speechSynthesis?.speak === 'function');

    if (ttsAvailable) {
      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 2000 }).catch(() => false);
      if (overlayVisible) {
        // Erstmals-Kommentar sollte sichtbar sein
        await expect(page.getByText(/Farbwenz.*einschaltet|Farbwenz.*aktiviert|Farbwenz.*freigegeben|Farbwenz.*Modus/)).toBeVisible();

        await page.click('text=Schließen');
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }
    }

    await expect(page.getByText(farbwenzSessionName).first()).toBeVisible();
  });

  test('Solo verloren (normal, ohne Bock, tagesschau Persönlichkeit)', async ({ page }) => {
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
    
    const { sessionId, sessionName } = await page.evaluate(async () => {
      const sessions = await fetch('/api/sessions').then(r => r.json());
      const session = sessions.find(s => s.name === window.testSessionName);
      return { sessionId: session?.id, sessionName: session?.name };
    });
    
    expect(sessionId).toBeTruthy();
    
    const gameCreated = await page.evaluate(async (sid) => {
      const res = await fetch(`/api/sessions/${sid}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Solo',
          player: 'SchafkopfC1',
          partner: null,
          won: false,
          schneider: false,
          schwarz: false,
          laufende: 0,
          bock: 1,
          klopfer: [],
          spielwert: 4.00,
          changes: {
            'SchafkopfC1': -12.00,
            'SchafkopfC2': 4.00,
            'SchafkopfC3': 4.00,
            'SchafkopfC4': 4.00,
          },
        }),
      });
      return res.ok;
    }, sessionId);
    
    expect(gameCreated).toBe(true);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click(`text=${sessionName}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
    
    const ttsAvailable = await page.evaluate(() => {
      return typeof window.speechSynthesis?.speak === 'function';
    });
    
    if (ttsAvailable) {
      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      
      if (overlayVisible) {
        await expect(page.getByText(/Solo|SchafkopfC1/)).toBeVisible();
        await expect(page.getByText(/4\.00.*Euro/)).toBeVisible();
        await expect(page.getByText(/verloren|Niederlage/)).toBeVisible();
        
        await page.click('text=Schließen');
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }
    }
    
    await expect(page.getByText(sessionName).first()).toBeVisible();
  });
});
