import { Router } from 'express';
import db from '../db.js';
import skatGamesRouter from './games/skat.js';

const router = Router();

// Must be before /:id to avoid Express matching "archived" as an id param
router.get('/archived', (_req, res) => {
  const rows = db.prepare(`
    SELECT s.*, COUNT(CASE WHEN g.archived_at IS NULL THEN 1 END) as game_count
    FROM sessions s
    LEFT JOIN games g ON g.session_id = s.id
    WHERE s.archived_at IS NOT NULL
    GROUP BY s.id
    ORDER BY s.archived_at DESC
  `).all();

  res.json(rows.map(s => ({
    ...s,
    players: JSON.parse(s.players),
    game_count: Number(s.game_count),
    schafkopf_options: JSON.parse(s.schafkopf_options || '{}'),
  })));
});

router.get('/archived/games', (_req, res) => {
  const rows = db.prepare(`
    SELECT g.*, s.name as session_name, s.players as session_players, s.stake as session_stake
    FROM games g
    JOIN sessions s ON s.id = g.session_id
    WHERE g.archived_at IS NOT NULL
      AND s.archived_at IS NULL
    ORDER BY g.session_id, g.seq
  `).all();

  res.json(rows.map(g => ({
    ...g,
    won: Boolean(g.won),
    schneider: Boolean(g.schneider),
    schwarz: Boolean(g.schwarz),
    klopfer: JSON.parse(g.klopfer),
    changes: JSON.parse(g.changes),
    session_players: JSON.parse(g.session_players),
  })));
});

router.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT s.*, COUNT(CASE WHEN g.archived_at IS NULL THEN 1 END) as game_count
    FROM sessions s
    LEFT JOIN games g ON g.session_id = s.id
    WHERE s.archived_at IS NULL
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `).all();

  res.json(rows.map(s => ({
    ...s,
    players: JSON.parse(s.players),
    game_count: Number(s.game_count),
    schafkopf_options: JSON.parse(s.schafkopf_options || '{}'),
    doppelkopf_options: JSON.parse(s.doppelkopf_options || '{}'),
    watten_team1_players: s.watten_team1_players ? JSON.parse(s.watten_team1_players) : null,
    watten_team2_players: s.watten_team2_players ? JSON.parse(s.watten_team2_players) : null,
    kinderkarten_options: JSON.parse(s.kinderkarten_options || '{}'),
  })));
});

router.post('/', (req, res) => {
  const { id, name, game_type = 'schafkopf', players, stake = 0.50, schafkopf_options, doppelkopf_options, target_score, team1_players, team2_players, kinderkarten_options } = req.body;
  if (!id || !name || !Array.isArray(players)) {
    return res.status(400).json({ error: 'id, name and players are required' });
  }

  if (game_type === 'watten') {
    if (players.length !== 4) {
      return res.status(400).json({ error: 'Watten requires exactly 4 players' });
    }
    db.prepare(`
      INSERT INTO sessions (id, name, game_type, players, stake, bock, watten_target_score, watten_team1_players, watten_team2_players, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `).run(
      id,
      name,
      game_type,
      JSON.stringify(players),
      stake,
      target_score || 15,
      JSON.stringify(team1_players || players.slice(0, 2)),
      JSON.stringify(team2_players || players.slice(2, 4)),
      new Date().toISOString()
    );
  } else if (game_type === 'doppelkopf') {
    db.prepare(`
      INSERT INTO sessions (id, name, game_type, players, stake, bock, doppelkopf_options, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, name, game_type, JSON.stringify(players), stake, JSON.stringify(doppelkopf_options || {}), new Date().toISOString());
  } else if (game_type === 'kinderkarten') {
    db.prepare(`
      INSERT INTO sessions (id, name, game_type, players, stake, bock, kinderkarten_options, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, name, game_type, JSON.stringify(players), stake, JSON.stringify(kinderkarten_options || { with_trump: true, ober_trump: false, unter_trump: false, card_count: 5 }), new Date().toISOString());
  } else {
    db.prepare(`
      INSERT INTO sessions (id, name, game_type, players, stake, bock, schafkopf_options, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, name, game_type, JSON.stringify(players), stake, JSON.stringify(schafkopf_options || {}), new Date().toISOString());
  }

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  res.status(201).json({
    ...session,
    players: JSON.parse(session.players),
    schafkopf_options: JSON.parse(session.schafkopf_options || '{}'),
    doppelkopf_options: JSON.parse(session.doppelkopf_options || '{}'),
    kinderkarten_options: JSON.parse(session.kinderkarten_options || '{}'),
  });
});

router.get('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const games = db.prepare(
    'SELECT * FROM games WHERE session_id = ? ORDER BY seq'
  ).all(req.params.id);

  res.json({
    ...session,
    players: JSON.parse(session.players),
    schafkopf_options: JSON.parse(session.schafkopf_options || '{}'),
    doppelkopf_options: JSON.parse(session.doppelkopf_options || '{}'),
    watten_team1_players: session.watten_team1_players ? JSON.parse(session.watten_team1_players) : null,
    watten_team2_players: session.watten_team2_players ? JSON.parse(session.watten_team2_players) : null,
    kinderkarten_options: JSON.parse(session.kinderkarten_options || '{}'),
    history: games.map(g => ({
      ...g,
      won: Boolean(g.won),
      schneider: Boolean(g.schneider),
      schwarz: Boolean(g.schwarz),
      klopfer: JSON.parse(g.klopfer),
      changes: JSON.parse(g.changes),
    })),
  });
});

router.use('/:id/skat', skatGamesRouter);

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { name, bock, archived_at, wizard_status, players } = req.body;

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (name !== undefined) {
    db.prepare('UPDATE sessions SET name = ? WHERE id = ?').run(name, id);
  }

  if (bock !== undefined) {
    db.prepare('UPDATE sessions SET bock = ? WHERE id = ?').run(bock, id);
  }

  if (archived_at !== undefined) {
    db.prepare('UPDATE sessions SET archived_at = ? WHERE id = ?').run(archived_at, id);
  }

  // Wizard Session beenden
  if (wizard_status !== undefined) {
    db.prepare('UPDATE sessions SET wizard_status = ? WHERE id = ?').run(wizard_status, id);
  }

  if (players !== undefined) {
    db.prepare('UPDATE sessions SET players = ? WHERE id = ?').run(JSON.stringify(players), id);
  }

  const updated = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  res.json({
    ...updated,
    players: JSON.parse(updated.players),
    watten_team1_players: updated.watten_team1_players ? JSON.parse(updated.watten_team1_players) : null,
    watten_team2_players: updated.watten_team2_players ? JSON.parse(updated.watten_team2_players) : null,
  });
});

router.delete('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
