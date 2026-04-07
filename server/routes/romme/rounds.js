import { Router } from 'express';
import db from '../../db.js';

const router = Router({ mergeParams: true });

const parseRound = (r) => ({
  ...r,
  seq: Number(r.seq),
  scores: JSON.parse(r.scores || '{}'),
});

// Alle aktiven Runden holen
router.get('/', (req, res) => {
  try {
    const { id } = req.params;

    const rows = db.prepare(`
      SELECT * FROM romme_rounds
      WHERE session_id = ? AND archived_at IS NULL
      ORDER BY seq ASC
    `).all(id);

    res.json(rows.map(r => parseRound(r)));
  } catch (error) {
    console.error('Error fetching romme rounds:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Neue Runde erstellen
router.post('/', (req, res) => {
  try {
    const { id } = req.params;
    const { winner, scores } = req.body;

    if (!winner || !scores || typeof scores !== 'object') {
      return res.status(400).json({ error: 'Missing required fields: winner, scores' });
    }

    // Nächste Sequenz ermitteln
    const seqResult = db.prepare(`
      SELECT COALESCE(MAX(seq), 0) + 1 as next_seq
      FROM romme_rounds
      WHERE session_id = ?
    `).get(id);
    const seq = seqResult?.next_seq ?? 1;

    // Gewinner muss 0 Punkte haben
    const validatedScores = { ...scores };
    validatedScores[winner] = 0;

    const round = {
      session_id: id,
      seq,
      winner,
      scores: JSON.stringify(validatedScores),
      created_at: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO romme_rounds (session_id, seq, winner, scores, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const info = stmt.run(round.session_id, round.seq, round.winner, round.scores, round.created_at);

    const inserted = db.prepare('SELECT * FROM romme_rounds WHERE id = ?').get(info.lastInsertRowid);

    // Session game_count aktualisieren
    const gameCount = db.prepare('SELECT COUNT(*) as count FROM romme_rounds WHERE session_id = ?').get(id).count;
    db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?').run(gameCount, id);



    res.json(parseRound(inserted));
  } catch (error) {
    console.error('Error creating romme round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Runde bearbeiten
router.patch('/:roundId', (req, res) => {
  try {
    const { roundId } = req.params;
    const { winner, scores } = req.body;

    // Gewinner muss 0 Punkte haben
    const validatedScores = { ...scores };
    if (winner) {
      validatedScores[winner] = 0;
    }

    const fields = [];
    const values = [];

    if (winner !== undefined) {
      fields.push('winner = ?');
      values.push(winner);
    }

    if (scores !== undefined) {
      fields.push('scores = ?');
      values.push(JSON.stringify(validatedScores));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(roundId);

    db.prepare(`
      UPDATE romme_rounds SET ${fields.join(', ')} WHERE id = ?
    `).run(...values);

    const updated = db.prepare('SELECT * FROM romme_rounds WHERE id = ?').get(roundId);
    res.json(parseRound(updated));
  } catch (error) {
    console.error('Error updating romme round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Letzte Runde löschen
router.delete('/last', (req, res) => {
  try {
    const { id } = req.params;

    const lastRound = db.prepare(`
      SELECT id FROM romme_rounds
      WHERE session_id = ? AND archived_at IS NULL
      ORDER BY seq DESC LIMIT 1
    `).get(id);

    if (lastRound) {
      db.prepare('DELETE FROM romme_rounds WHERE id = ?').run(lastRound.id);

      // Session game_count aktualisieren
      const gameCount = db.prepare('SELECT COUNT(*) as count FROM romme_rounds WHERE session_id = ?').get(id).count;
      db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?').run(gameCount, id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting romme round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;
