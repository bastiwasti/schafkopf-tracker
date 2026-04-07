import { test, expect } from '@playwright/test';

test.describe('Sessions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Alle Sessions löschen (für sauberen Test-Stand)
    await page.evaluate(async () => {
      const sessions = await fetch('/api/sessions').then(r => r.json());
      for (const session of sessions) {
        await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' });
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 4 Spieler erstellen (für Schafkopf)
    const players = ['Spieler1', 'Spieler2', 'Spieler3', 'Spieler4'];
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
  });

  test('SESSION - MANAGEMENT - Session archivieren', async ({ page }) => {
    const sessionName = `Archiv Test Session ${Date.now()}`;

    // Schafkopf-Session erstellen
    await page.click('text=＋ Neue Runde');
    await page.fill('input[placeholder*="Freitagsrunde"]', sessionName);
    await page.click('text=Schafkopf');

    for (let i = 1; i <= 4; i++) {
      await page.click(`text=Spieler${i}`);
    }

    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle');

    // Session zur Startseite
    await page.click('text=← Runden');
    await page.waitForLoadState('networkidle');

    // Prüfen ob Session in Hauptliste ist
    await expect(page.getByText(sessionName).first()).toBeVisible();

    // Session archivieren (mit Dialog-Bestätigung)
    page.once('dialog', dialog => dialog.accept());
    await page.getByText(sessionName).first().locator('..').locator('..').locator('button').filter({ hasText: '📦' }).click();
    await page.waitForLoadState('networkidle');

    // Prüfen ob Session aus Hauptliste verschwunden ist
    await expect(page.getByText(sessionName).first()).not.toBeVisible();

    // Zum Archiv
    await page.click('text=Archiv');
    await page.waitForLoadState('networkidle');

    // Prüfen ob Session im Archiv ist
    await expect(page.getByText(sessionName).first()).toBeVisible();

    // Session wiederherstellen
    await page.locator('button').filter({ hasText: '↩ Wiederherstellen' }).nth(0).click();
    await page.waitForLoadState('networkidle');

    // Prüfen ob Session nicht mehr im Archiv ist
    await expect(page.getByText(sessionName)).not.toBeVisible();

    // Zur Hauptliste
    await page.click('text=← Runden');
    await page.waitForLoadState('networkidle');

    // Prüfen ob Session wieder in Hauptliste ist
    await expect(page.getByText(sessionName).first()).toBeVisible();
  });

  test('SESSION - MANAGEMENT - Session löschen', async ({ page }) => {
    const sessionName = `Lösch Test Session ${Date.now()}`;

    // Schafkopf-Session erstellen
    await page.click('text=＋ Neue Runde');
    await page.fill('input[placeholder*="Freitagsrunde"]', sessionName);
    await page.click('text=Schafkopf');

    for (let i = 1; i <= 4; i++) {
      await page.click(`text=Spieler${i}`);
    }

    await page.click('text=Runde starten');
    await page.waitForLoadState('networkidle');

    // Session zur Startseite
    await page.click('text=← Runden');
    await page.waitForLoadState('networkidle');

    // Session archivieren (mit Dialog-Bestätigung)
    page.once('dialog', dialog => dialog.accept());
    await page.getByText(sessionName).locator('..').locator('..').locator('button').filter({ hasText: '📦' }).nth(0).click();
    await page.waitForLoadState('networkidle');

    // Prüfen ob Session aus Hauptliste verschwunden ist
    await expect(page.getByText(sessionName)).not.toBeVisible();

    // Zum Archiv
    await page.click('text=Archiv');
    await page.waitForLoadState('networkidle');

    // Prüfen ob Session im Archiv ist
    await expect(page.getByText(sessionName).first()).toBeVisible();

    // Session löschen
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button').filter({ hasText: '🗑 Endgültig löschen' }).nth(0).click();
    await page.waitForLoadState('networkidle');

    // Prüfen ob Session nicht mehr sichtbar ist
    await expect(page.getByText(sessionName).first()).not.toBeVisible();
  });
});
