import { test, expect } from '@playwright/test';

test('Formular abbrechen ohne zu speichern', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /Spieler/ }).click();
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /Neuer Spieler/ }).click();
  await page.fill('input[placeholder*="Spieler"]', 'Wird nicht gespeichert');

  await page.getByRole('button', { name: 'Abbrechen' }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('text=Wird nicht gespeichert')).not.toBeVisible();
  await expect(page.getByRole('button', { name: /Neuer Spieler/ })).toBeVisible();
});
