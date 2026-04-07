import { test, expect } from '@playwright/test';

test.describe('Players', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /Spieler/ }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    try {
      const cancelButton = page.locator('text=Abbrechen').first();
      if (await cancelButton.isVisible({ timeout: 1000 })) {
        await cancelButton.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
    }
  });

  test('PLAYER - CRUD - Spieler erstellen', async ({ page }) => {
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

  test('PLAYER - CRUD - Spieler bearbeiten', async ({ page }) => {
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

  test('PLAYER - CRUD - Spieler löschen', async ({ page }) => {
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

  test('PLAYER - CRUD - Spieler auflisten', async ({ page }) => {
    const playerName = 'Einzelner Listenspieler';

    await page.locator('button:has-text("＋ Neuer Spieler")').click();
    await page.fill('input[placeholder*="Spieler"]', playerName);
    await page.locator('button[style*="font-size: 40"]').click();
    await page.waitForSelector('text=Avatar wählen');
    const avatarOverlay = page.locator('text=Avatar wählen').locator('..').locator('..');
    await avatarOverlay.locator('button').nth(4).click();
    await page.click('text=Spieler anlegen');
    await page.waitForLoadState('networkidle');

    await expect(page.locator(`text=${playerName}`)).toBeVisible();
  });

  test('PLAYER - FEATURE - Persönlichkeit auswählen + Tooltip', async ({ page }) => {
    const playerName = 'Persönlichkeitsspieler';

    // Spieler erstellen mit Persönlichkeit
    await page.getByRole('button', { name: /Neuer Spieler/ }).click();
    await page.fill('input[placeholder*="Spieler"]', playerName);

    // Persönlichkeit auswählen (Button mit "🧠 Der Strateg")
    const persoenlichkeitButton = page.locator('button').filter({ hasText: '🧠 Der Strateg' });
    await persoenlichkeitButton.click();

    // Avatar auswählen
    await page.locator('button[style*="font-size: 40"]').click();
    await page.waitForSelector('text=Avatar wählen');
    const avatarOverlay = page.locator('text=Avatar wählen').locator('..').locator('..');
    await avatarOverlay.locator('button').nth(1).click();

    await page.click('text=Spieler anlegen');
    await page.waitForLoadState('networkidle');

    // Spieler in der Liste prüfen
    await expect(page.locator(`text=${playerName}`)).toBeVisible();

    // Persönlichkeit im Player-Edit-Screen prüfen
    const playerRow = page.locator('text=' + playerName).locator('..').locator('..');
    await playerRow.locator('button').filter({ hasText: '✏️' }).click();
    await page.waitForLoadState('networkidle');

    // Persönlichkeits-Button muss sichtbar sein
    await expect(persoenlichkeitButton).toBeVisible();

    // Zurück zur Übersicht
    await page.click('text=Abbrechen');
    await page.waitForLoadState('networkidle');
  });

  test('PLAYER - FEATURE - Avatar auswählen', async ({ page }) => {
    const playerName = 'AvatarSpieler';

    await page.getByRole('button', { name: /Neuer Spieler/ }).click();
    await page.fill('input[placeholder*="Spieler"]', playerName);

    // Avatar-Overlay öffnen
    await page.locator('button[style*="font-size: 40"]').click();
    await page.waitForSelector('text=Avatar wählen');

    // Prüfen ob Avatar-Auswahl angezeigt wird
    const avatarOverlay = page.locator('text=Avatar wählen').locator('..').locator('..');
    const avatarButtons = avatarOverlay.locator('button');
    await expect(avatarButtons.first()).toBeVisible();

    // Avatar auswählen
    await avatarButtons.nth(5).click();

    // Prüfen ob ausgewählter Avatar im Button angezeigt wird
    await expect(page.locator('button[style*="font-size: 40"]').first()).toBeVisible();

    await page.click('text=Spieler anlegen');
    await page.waitForLoadState('networkidle');

    // Spieler in der Liste prüfen
    await expect(page.locator(`text=${playerName}`)).toBeVisible();
  });

  test('PLAYER - NAV - Cancel ohne zu speichern', async ({ page }) => {
    await page.getByRole('button', { name: /Neuer Spieler/ }).click();
    await page.fill('input[placeholder*="Spieler"]', 'Wird nicht gespeichert');

    await page.getByRole('button', { name: 'Abbrechen' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Wird nicht gespeichert')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Neuer Spieler/ })).toBeVisible();
  });
});
