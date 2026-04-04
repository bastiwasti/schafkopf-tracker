import { test, expect } from '@playwright/test';

test('Spieler Navigation', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /Spieler/ }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('button', { name: /Neuer Spieler/ })).toBeVisible();
});
