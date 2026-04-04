import { test, expect } from '@playwright/test';

test.describe('Spieler Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /Spieler/ }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Spieler erstellen', async ({ page }) => {
    const playerName = 'Testspieler';

    await page.getByRole('button', { name: /Neuer Spieler/ }).click();
    await page.fill('input[placeholder*="Spieler"]', playerName);

    await page.locator('button[style*="font-size: 40"]').click();
    await page.waitForSelector('text=Avatar wählen');
    const avatarOverlay = page.locator('text=Avatar wählen').locator('..').locator('..');
    await avatarOverlay.locator('button').nth(1).click();

    await page.click('text=Spieler anlegen');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Testspieler')).toBeVisible();
  });

  test('Spieler bearbeiten', async ({ page }) => {
    const originalName = 'Originalspieler';
    const newName = 'Editierter Spieler';

    // Spieler erstellen
    await page.getByRole('button', { name: /Neuer Spieler/ }).click();
    await page.fill('input[placeholder*="Spieler"]', originalName);
    await page.locator('button[style*="font-size: 40"]').click();
    await page.waitForSelector('text=Avatar wählen');
    const avatarOverlay = page.locator('text=Avatar wählen').locator('..').locator('..');
    await avatarOverlay.locator('button').nth(2).click();
    await page.click('text=Spieler anlegen');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Edit-Button in der Spielerzeile klicken
    const playerRow = page.locator('text=' + originalName).locator('..').locator('..');
    await playerRow.locator('button').filter({ hasText: '✏️' }).click();
    await page.waitForLoadState('networkidle');

    // Namen ändern und speichern
    await page.fill('input[placeholder*="Spieler"]', newName);
    await page.locator('button[style*="font-size: 40"]').click();
    await page.waitForSelector('text=Avatar wählen');
    const avatarOverlay2 = page.locator('text=Avatar wählen').locator('..').locator('..');
    await avatarOverlay2.locator('button').nth(3).click();
    await page.click('text=Speichern');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Editierter Spieler')).toBeVisible();
  });

  test('Spieler löschen', async ({ page }) => {
    const playerName = 'Löschspieler';

    await page.getByRole('button', { name: /Neuer Spieler/ }).click();
    await page.fill('input[placeholder*="Spieler"]', playerName);
    await page.locator('button[style*="font-size: 40"]').click();
    await page.waitForSelector('text=Avatar wählen');
    const avatarOverlay = page.locator('text=Avatar wählen').locator('..').locator('..');
    await avatarOverlay.locator('button').nth(1).click();
    await page.click('text=Spieler anlegen');
    await page.waitForLoadState('networkidle');

    const playerRow = page.locator('text=' + playerName).locator('..').locator('..');
    page.on('dialog', dialog => dialog.accept());
    await playerRow.locator('button').filter({ hasText: '🗑' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator(`text=${playerName}`)).not.toBeVisible();
  });

  test('Spieler auflisten', async ({ page }) => {
    for (let i = 1; i <= 3; i++) {
      await page.getByRole('button', { name: /Neuer Spieler/ }).click();
      await page.fill('input[placeholder*="Spieler"]', `Listenspieler ${i}`);
      await page.locator('button[style*="font-size: 40"]').click();
      await page.waitForSelector('text=Avatar wählen');
      const avatarOverlay = page.locator('text=Avatar wählen').locator('..').locator('..');
      await avatarOverlay.locator('button').nth(i).click();
      await page.click('text=Spieler anlegen');
      await page.waitForLoadState('networkidle');
    }

    await expect(page.locator('text=Listenspieler 1')).toBeVisible();
    await expect(page.locator('text=Listenspieler 2')).toBeVisible();
    await expect(page.locator('text=Listenspieler 3')).toBeVisible();
  });
});
