import { test, expect } from '@playwright/test';

test('App lädt', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(await page.title()).toBe('Schafkopf Tracker');

  await expect(page.getByRole('heading', { name: 'Spielrunden' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Spieler/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Archiv/ })).toBeVisible();
});
