import { Router } from 'express';
import db from '../db.js';

const router = Router({ mergeParams: true });

const parseGame = (g) => ({
  ...g,
  won: Boolean(g.won),
  schneider: Boolean(g.schneider),
  schwarz: Boolean(g.schwarz),
  klopfer: JSON.parse(g.klopfer),
  changes: JSON.parse(g.changes),
});

router.post('/', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const {
    type, player, partner, won, schneider, schwarz,
    laufende, bock, klopfer, spielwert, changes,
  } = req.body;

  const { maxSeq } = db.prepare(
    'SELECT MAX(seq) as maxSeq FROM games WHERE session_id = ?'
  ).get(req.params.id);
  const seq = (maxSeq || 0) + 1;

  db.prepare(`
    INSERT INTO games
      (session_id, seq, type, player, partner, won, schneider, schwarz,
       laufende, bock, klopfer, spielwert, changes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.params.id, seq, type, player, partner ?? null,
    won ? 1 : 0, schneider ? 1 : 0, schwarz ? 1 : 0,
    laufende, bock,
    JSON.stringify(klopfer ?? []),
    spielwert,
    JSON.stringify(changes),
    new Date().toISOString(),
  );

  const game = db.prepare(
    'SELECT * FROM games WHERE session_id = ? AND seq = ?'
  ).get(req.params.id, seq);

  res.status(201).json(parseGame(game));
});

// Must be before /:gameId to avoid matching "last" as an id
router.delete('/last', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const lastGame = db.prepare(
    'SELECT * FROM games WHERE session_id = ? AND archived_at IS NULL ORDER BY seq DESC LIMIT 1'
  ).get(req.params.id);
  if (!lastGame) return res.status(404).json({ error: 'No games to undo' });

  db.prepare('DELETE FROM games WHERE id = ?').run(lastGame.id);
  res.status(204).end();
});

router.patch('/:gameId', (req, res) => {
  const game = db.prepare(
    'SELECT * FROM games WHERE id = ? AND session_id = ?'
  ).get(req.params.gameId, req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const { type, player, partner, won, schneider, schwarz, laufende, bock, klopfer, spielwert, changes, archived_at } = req.body;

  // Full edit — only allowed on non-archived games
  const isFullEdit = type !== undefined;
  if (isFullEdit && game.archived_at) {
    return res.status(409).json({ error: 'Cannot edit an archived game' });
  }

  if (isFullEdit) {
    db.prepare(`
      UPDATE games SET
        type = ?, player = ?, partner = ?, won = ?, schneider = ?, schwarz = ?,
        laufende = ?, bock = ?, klopfer = ?, spielwert = ?, changes = ?
      WHERE id = ?
    `).run(
      type, player, partner ?? null,
      won ? 1 : 0, schneider ? 1 : 0, schwarz ? 1 : 0,
      laufende, bock,
      JSON.stringify(klopfer ?? []),
      spielwert,
      JSON.stringify(changes),
      req.params.gameId,
    );
  }

  if (archived_at !== undefined) {
    db.prepare('UPDATE games SET archived_at = ? WHERE id = ?').run(
      archived_at, req.params.gameId
    );
  }

  const updated = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.gameId);
  res.json(parseGame(updated));
});

router.delete('/:gameId', (req, res) => {
  const game = db.prepare(
    'SELECT * FROM games WHERE id = ? AND session_id = ?'
  ).get(req.params.gameId, req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.gameId);
  res.status(204).end();
});

export default router;
