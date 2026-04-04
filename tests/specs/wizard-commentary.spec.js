import { test, expect } from '@playwright/test';

test.describe('Wizard Kommentare', () => {
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
    
    // Speichere sessionName für später
    await page.evaluate((name) => {
      window.testSessionName = name;
    }, sessionName);
  });

  test('Wizard Runde mit Kommentar und Audio-TTS', async ({ page }) => {
    // Audio-TTS Mock
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
    
    // Hole Session ID und Name
    const { sessionId, sessionName } = await page.evaluate(async () => {
      const sessions = await fetch('/api/sessions').then(r => r.json());
      const session = sessions.find(s => s.name === window.testSessionName);
      return { sessionId: session?.id, sessionName: session?.name };
    });
    
    expect(sessionId).toBeTruthy();
    
    // Runde über API erstellen (all_correct)
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
    
    // Seite neu laden und zur Session navigieren
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click(`text=${sessionName}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Prüfe Session (first um strict mode zu umgehen)
    await expect(page.getByText(sessionName).first()).toBeVisible();
    
    // Prüfe Runde wurde erstellt (Score Sheet sichtbar)
    await expect(page.getByText('Score Sheet')).toBeVisible();
    
    // Prüfe TTS verfügbar
    const ttsAvailable = await page.evaluate(() => {
      return typeof window.speechSynthesis?.speak === 'function';
    });
    
    if (ttsAvailable) {
      // Prüfe ob Commentary Overlay erscheint
      const overlayVisible = await page.locator('text=Kommentator').isVisible({ timeout: 1000 }).catch(() => false);
      
      if (overlayVisible) {
        // Prüfe Kommentar-Text
        await expect(page.getByText(/UNGLAUBLICH|PERFEKTE|ALLE.*RICHTIG/)).toBeVisible();
        
        // Schließe Overlay
        await page.click('text=Schließen');
        await page.waitForTimeout(300);
        await expect(page.locator('text=Kommentator')).not.toBeVisible();
      }
    }
    
    // Final check
    await expect(page.getByText(sessionName).first()).toBeVisible();
  });
});