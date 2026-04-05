import { test, expect } from '@playwright/test';

const PLAYERS = [
  { name: 'TooltipSpieler1', avatar: '🌟', character_type: 'optimist',  expectedLabel: 'Der Optimist' },
  { name: 'TooltipSpieler2', avatar: '🌧️', character_type: 'pessimist', expectedLabel: 'Der Pessimist' },
  { name: 'TooltipSpieler3', avatar: '🧠', character_type: 'stratege',  expectedLabel: 'Der Strateg' },
  { name: 'TooltipSpieler4', avatar: '🤪', character_type: 'joker',     expectedLabel: 'Der Joker' },
];

test('Spieler-Persönlichkeit bleibt erhalten und wird im Scoreboard-Tooltip angezeigt', async ({ page, request }) => {
  // Spieler mit unterschiedlichen Persönlichkeiten anlegen
  const playerIds = [];
  for (const p of PLAYERS) {
    const id = crypto.randomUUID();
    playerIds.push(id);
    const res = await request.post('/api/players', {
      data: { id, name: p.name, avatar: p.avatar, character_type: p.character_type },
    });
    expect(res.ok()).toBeTruthy();
    const saved = await res.json();
    expect(saved.character_type).toBe(p.character_type);
  }

  // Schafkopf-Session anlegen
  const sessionRes = await request.post('/api/sessions', {
    data: {
      id: crypto.randomUUID(),
      name: 'Tooltip Test Session',
      game_type: 'schafkopf',
      players: PLAYERS.map(p => p.name),
      stake: 0.10,
    },
  });
  expect(sessionRes.ok()).toBeTruthy();
  const session = await sessionRes.json();
  const sessionId = session.id;

  // Session in der UI öffnen
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.locator('text=Tooltip Test Session').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);

  // Für jeden Spieler: Avatar hovern und Persönlichkeits-Label prüfen
  for (const player of PLAYERS) {
    // Spielername-div finden → eine Ebene hoch = playerCard
    const playerCard = page.getByText(player.name, { exact: true }).locator('..');
    await expect(playerCard).toBeVisible({ timeout: 3000 });

    // Avatar-Wrapper hovern (erster div in der Karte = PlayerTooltip-Wrapper mit cursor:default)
    // Kein Leader bei 0-Balance, daher kein crownBadge vorangestellt
    const avatarWrapper = playerCard.locator('div').first();
    await avatarWrapper.hover();
    await page.waitForTimeout(150);

    // Tooltip mit korrektem Label muss sichtbar sein
    await expect(
      page.locator(`text=${player.expectedLabel}`).first()
    ).toBeVisible({ timeout: 2000 });

    // Maus wegbewegen zum Tooltip-Schließen
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
  }

  // Aufräumen
  await request.patch(`/api/sessions/${sessionId}`, {
    data: { archived_at: new Date().toISOString() },
  });
  for (const id of playerIds) {
    await request.delete(`/api/players/${id}`);
  }
});
