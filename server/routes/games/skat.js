import express from 'express';
import { randomUUID } from 'crypto';
import db from '../../db.js';

const router = express.Router();

// Helper: Nächste Sequenz
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
    console.log('POST /skat called');
    console.log('req.params:', req.params);
    console.log('req.body:', req.body);
    const { game_type, declarer, partner, contra, won, schneider, schwarz, laufende, kontra_multiplier, bock } = req.body;
    const sessionId = req.params.id;
    console.log('sessionId:', sessionId);

  // Grundwerte
  const CARD_VALUES = {
    grand: 24,
    kreuz: 12,
    pik: 11,
    herz: 10,
    null: 23,
  };

  const getTrumpfCount = (gameType, laufende) => {
    if (gameType !== "grand") return laufende;
    return laufende + 4;
  };

  const calculateBasePoints = (gameType, laufende) => {
    let baseValue = CARD_VALUES[gameType];
    
    if (gameType === "grand") {
      const trumpfCount = getTrumpfCount(gameType, laufende);
      baseValue += trumpfCount;
    } else if (gameType !== "null") {
      baseValue += laufende;
    }
    
    return baseValue;
  };

  const getSchneiderMultiplier = (schneider, schwarz) => {
    if (schwarz) return 3;
    if (schneider) return 2;
    return 1;
  };

  // Spielwert berechnen
  let points;
  
  if (game_type === "kontra") {
    const baseValue = calculateBasePoints("grand", laufende);
    const schneiderMultiplier = getSchneiderMultiplier(schneider, schwarz);
    const kontraMult = kontra_multiplier ?? 1;
    const bockMult = Math.pow(2, (bock ?? 1) - 1);
    points = baseValue * schneiderMultiplier * kontraMult * bockMult;
  } else {
    const baseValue = calculateBasePoints(game_type, laufende);
    const schneiderMultiplier = getSchneiderMultiplier(schneider, schwarz);
    const bockMult = Math.pow(2, (bock ?? 1) - 1);
    points = baseValue * schneiderMultiplier * bockMult;
  }

  const game = {
    id: randomUUID(),
    session_id: sessionId,
    seq: getNextSeq(sessionId),
    created_at: new Date().toISOString(),
    game_type,
    declarer,
    partner: partner ?? null,
    contra: contra ?? null,
    won: won ? 1 : 0,
    schneider: schneider ? 1 : 0,
    schwarz: schwarz ? 1 : 0,
    laufende,
    klopfer: JSON.stringify([]),
    bock: bock ?? 1,
    kontra_multiplier: kontra_multiplier ?? 1,
    points,
  };

  const stmt = db.prepare(`
    INSERT INTO skat_games (
      id, session_id, seq, created_at,
      game_type, declarer, partner, contra,
      won, schneider, schwarz, laufende,
      klopfer, kontra_multiplier, bock, points
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    game.id, game.session_id, game.seq, game.created_at,
    game.game_type, game.declarer, game.partner, game.contra,
    game.won, game.schneider, game.schwarz, game.laufende,
    game.klopfer, game.kontra_multiplier, game.bock, game.points
  );

  // Session game_count aktualisieren
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

    // Archivierung
    if (req.body.archived_at !== undefined) {
      db.prepare('UPDATE skat_games SET archived_at = ? WHERE id = ?')
        .run(req.body.archived_at, gameId);
      const archived = db.prepare('SELECT * FROM skat_games WHERE id = ?').get(gameId);
      return res.json(archived);
    }

    const { game_type, declarer, partner, contra, won, schneider, schwarz, laufende, kontra_multiplier, bock } = req.body;

  // Grundwerte
  const CARD_VALUES = {
    grand: 24,
    kreuz: 12,
    pik: 11,
    herz: 10,
    null: 23,
  };

  const getTrumpfCount = (gameType, laufende) => {
    if (gameType !== "grand") return laufende;
    return laufende + 4;
  };

  const calculateBasePoints = (gameType, laufende) => {
    let baseValue = CARD_VALUES[gameType];
    
    if (gameType === "grand") {
      const trumpfCount = getTrumpfCount(gameType, laufende);
      baseValue += trumpfCount;
    } else if (gameType !== "null") {
      baseValue += laufende;
    }
    
    return baseValue;
  };

  const getSchneiderMultiplier = (schneider, schwarz) => {
    if (schwarz) return 3;
    if (schneider) return 2;
    return 1;
  };

  // Spielwert neu berechnen
  let points;
  
  if (game_type === "kontra") {
    const baseValue = calculateBasePoints("grand", laufende);
    const schneiderMultiplier = getSchneiderMultiplier(schneider, schwarz);
    const kontraMult = kontra_multiplier ?? 1;
    const bockMult = Math.pow(2, (bock ?? 1) - 1);
    points = baseValue * schneiderMultiplier * kontraMult * bockMult;
  } else {
    const baseValue = calculateBasePoints(game_type, laufende);
    const schneiderMultiplier = getSchneiderMultiplier(schneider, schwarz);
    const bockMult = Math.pow(2, (bock ?? 1) - 1);
    points = baseValue * schneiderMultiplier * bockMult;
  }

    db.prepare(`
      UPDATE skat_games SET
        game_type = ?, declarer = ?, partner = ?, contra = ?,
        won = ?, schneider = ?, schwarz = ?, laufende = ?,
        kontra_multiplier = ?, bock = ?, points = ?
      WHERE id = ?
    `).run(game_type, declarer, partner, contra, won ? 1 : 0, schneider ? 1 : 0, schwarz ? 1 : 0, laufende, kontra_multiplier, bock, points, gameId);

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

  // Letztes Spiel finden
  const lastGame = db.prepare(`
    SELECT id FROM skat_games
    WHERE session_id = ? AND archived_at IS NULL
    ORDER BY seq DESC LIMIT 1
  `).get(sessionId);

  if (lastGame) {
    db.prepare('DELETE FROM skat_games WHERE id = ?').run(lastGame.id);

    // Session game_count aktualisieren
    const gameCount = db.prepare('SELECT COUNT(*) as count FROM skat_games WHERE session_id = ?')
      .get(sessionId).count;
    db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?')
      .run(gameCount, sessionId);
  }

  res.json({ success: true });
});

// Bockrunde ändern
router.patch('/bock', (req, res) => {
  const { bock } = req.body;
  const sessionId = req.params.id;
  db.prepare('UPDATE sessions SET skat_bock_level = ? WHERE id = ?')
    .run(bock, sessionId);
  res.json({ success: true });
});

export default router;
