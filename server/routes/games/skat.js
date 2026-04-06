import express from 'express';
import { randomUUID } from 'crypto';
import db from '../../db.js';

const router = express.Router({ mergeParams: true });

const NULL_VALUES = {
  'Null': 23,
  'Null Hand': 35,
  'Null Ouvert': 46,
  'Null Ouvert Hand': 59,
};

const CARD_VALUES = { grand: 24, kreuz: 12, pik: 11, herz: 10, karo: 9 };

function calculateSkatPoints({ game_type, spitzen = 1, schneider = false, schwarz = false, re = false, bock = false, hirsch = false }) {
  const reBoekMult = 1 + (re ? 1 : 0) + (bock ? 1 : 0) + (hirsch ? 1 : 0);

  if (NULL_VALUES[game_type] !== undefined) {
    return NULL_VALUES[game_type] * reBoekMult;
  }

  const baseValue = CARD_VALUES[game_type.toLowerCase()];
  const schneiderBonus = schwarz ? 2 : schneider ? 1 : 0;
  const multiplier = spitzen + 1 + schneiderBonus;
  return baseValue * multiplier * reBoekMult;
}

function getNextSeq(sessionId) {
  const result = db.prepare(`
    SELECT COALESCE(MAX(seq), 0) + 1 as next_seq
    FROM skat_games
    WHERE session_id = ?
  `).get(sessionId);
  return result?.next_seq ?? 1;
}

// Spiel erstellen
router.post('/', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { game_type, declarer, mit_ohne = 'mit', spitzen = 1, won, schneider = false, schwarz = false, re = false, bock = false, hirsch = false, ramsch_points, active_players } = req.body;

    const isRamsch = game_type === 'Ramsch';
    const points = isRamsch ? 0 : calculateSkatPoints({ game_type, spitzen, schneider, schwarz, re, bock, hirsch });

    const game = {
      id: randomUUID(),
      session_id: sessionId,
      seq: getNextSeq(sessionId),
      created_at: new Date().toISOString(),
      game_type,
      declarer: isRamsch ? '' : declarer,
      mit_ohne: isRamsch ? null : mit_ohne,
      spitzen: isRamsch ? null : spitzen,
      won: isRamsch ? null : (won ? 1 : 0),
      schneider: schneider ? 1 : 0,
      schwarz: schwarz ? 1 : 0,
      re: re ? 1 : 0,
      bock: bock ? 1 : 0,
      hirsch: hirsch ? 1 : 0,
      ramsch_points: isRamsch ? JSON.stringify(ramsch_points || {}) : null,
      active_players: active_players ? JSON.stringify(active_players) : null,
      points,
    };

    db.prepare(`
      INSERT INTO skat_games (
        id, session_id, seq, created_at,
        game_type, declarer, mit_ohne, spitzen,
        won, schneider, schwarz, re, bock, hirsch, ramsch_points, active_players, points
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      game.id, game.session_id, game.seq, game.created_at,
      game.game_type, game.declarer, game.mit_ohne, game.spitzen,
      game.won, game.schneider, game.schwarz, game.re, game.bock, game.hirsch, game.ramsch_points, game.active_players, game.points
    );

    const gameCount = db.prepare('SELECT COUNT(*) as count FROM skat_games WHERE session_id = ?')
      .get(sessionId).count;
    db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?')
      .run(gameCount, sessionId);

    res.json(game);
  } catch (error) {
    console.error('Error creating skat game:', error);
    res.status(500).json({ error: error.message });
  }
});

// Spiele abrufen
router.get('/', (req, res) => {
  const sessionId = req.params.id;
  const games = db.prepare(`
    SELECT * FROM skat_games
    WHERE session_id = ?
    ORDER BY seq
  `).all(sessionId);

  res.json(games);
});

// Spiel bearbeiten / archivieren
router.patch('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    if (req.body.archived_at !== undefined) {
      db.prepare('UPDATE skat_games SET archived_at = ? WHERE id = ?')
        .run(req.body.archived_at, gameId);
      const archived = db.prepare('SELECT * FROM skat_games WHERE id = ?').get(gameId);
      return res.json(archived);
    }

    const { game_type, declarer, mit_ohne = 'mit', spitzen = 1, won, schneider = false, schwarz = false, re = false, bock = false, hirsch = false, ramsch_points, active_players } = req.body;
    const isRamsch = game_type === 'Ramsch';
    const points = isRamsch ? 0 : calculateSkatPoints({ game_type, spitzen, schneider, schwarz, re, bock, hirsch });

    db.prepare(`
      UPDATE skat_games SET
        game_type = ?, declarer = ?, mit_ohne = ?, spitzen = ?,
        won = ?, schneider = ?, schwarz = ?, re = ?, bock = ?, hirsch = ?, ramsch_points = ?, active_players = ?, points = ?
      WHERE id = ?
    `).run(
      game_type,
      isRamsch ? '' : declarer,
      isRamsch ? null : mit_ohne,
      isRamsch ? null : spitzen,
      isRamsch ? null : (won ? 1 : 0),
      schneider ? 1 : 0, schwarz ? 1 : 0, re ? 1 : 0, bock ? 1 : 0, hirsch ? 1 : 0,
      isRamsch ? JSON.stringify(ramsch_points || {}) : null,
      active_players ? JSON.stringify(active_players) : null,
      points, gameId
    );

    const updated = db.prepare('SELECT * FROM skat_games WHERE id = ?').get(gameId);
    res.json(updated);
  } catch (error) {
    console.error('Error updating skat game:', error);
    res.status(500).json({ error: error.message });
  }
});

// Letztes Spiel löschen
router.delete('/last', (req, res) => {
  const sessionId = req.params.id;

  const lastGame = db.prepare(`
    SELECT id FROM skat_games
    WHERE session_id = ? AND archived_at IS NULL
    ORDER BY seq DESC LIMIT 1
  `).get(sessionId);

  if (lastGame) {
    db.prepare('DELETE FROM skat_games WHERE id = ?').run(lastGame.id);

    const gameCount = db.prepare('SELECT COUNT(*) as count FROM skat_games WHERE session_id = ?')
      .get(sessionId).count;
    db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?')
      .run(gameCount, sessionId);
  }

  res.json({ success: true });
});

export default router;
