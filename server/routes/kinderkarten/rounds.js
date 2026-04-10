import { Router } from 'express';
import db from '../../db.js';

const router = Router({ mergeParams: true });

const parseRound = (r) => ({
  ...r,
  seq: Number(r.seq),
  winners: JSON.parse(r.winners || '[]'),
  trick_counts: JSON.parse(r.trick_counts || '{}'),
  scores: JSON.parse(r.scores || '{}'),
});

router.get('/', (req, res) => {
  try {
    const { id } = req.params;

    const rows = db.prepare(`
      SELECT * FROM kinderkarten_rounds
      WHERE session_id = ? AND archived_at IS NULL
      ORDER BY seq ASC
    `).all(id);

    res.json(rows.map(r => parseRound(r)));
  } catch (error) {
    console.error('Error fetching kinderkarten rounds:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { id } = req.params;
    const { trick_counts } = req.body;

    if (!trick_counts || typeof trick_counts !== 'object') {
      return res.status(400).json({ error: 'Missing required field: trick_counts' });
    }

    const trickCountsObj = typeof trick_counts === 'string' ? JSON.parse(trick_counts) : trick_counts;

    const maxTricks = Math.max(...Object.values(trickCountsObj));
    const winners = Object.entries(trickCountsObj)
      .filter(([_, count]) => count === maxTricks)
      .map(([player, _]) => player);

    const scores = {};
    Object.entries(trickCountsObj).forEach(([player, count]) => {
      scores[player] = count;
    });

    const seqResult = db.prepare(`
      SELECT COALESCE(MAX(seq), 0) + 1 as next_seq
      FROM kinderkarten_rounds
      WHERE session_id = ?
    `).get(id);
    const seq = seqResult?.next_seq ?? 1;

    const round = {
      session_id: id,
      seq,
      winners: JSON.stringify(winners),
      trick_counts: JSON.stringify(trickCountsObj),
      scores: JSON.stringify(scores),
      created_at: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO kinderkarten_rounds (session_id, seq, winners, trick_counts, scores, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(round.session_id, round.seq, round.winners, round.trick_counts, round.scores, round.created_at);

    const inserted = db.prepare('SELECT * FROM kinderkarten_rounds WHERE id = ?').get(info.lastInsertRowid);

    const gameCount = db.prepare('SELECT COUNT(*) as count FROM kinderkarten_rounds WHERE session_id = ?').get(id).count;
    db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?').run(gameCount, id);

    res.json(parseRound(inserted));
  } catch (error) {
    console.error('Error creating kinderkarten round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

router.patch('/:roundId', (req, res) => {
  try {
    const { roundId } = req.params;
    const { trick_counts, archived_at } = req.body;

    let trickCountsObj;
    let winners = [];
    let scores = {};

    if (trick_counts !== undefined) {
      trickCountsObj = typeof trick_counts === 'string' ? JSON.parse(trick_counts) : trick_counts;
      const maxTricks = Math.max(...Object.values(trickCountsObj));
      winners = Object.entries(trickCountsObj)
        .filter(([_, count]) => count === maxTricks)
        .map(([player, _]) => player);

      Object.entries(trickCountsObj).forEach(([player, count]) => {
        scores[player] = count;
      });
    }

    const fields = [];
    const values = [];

    if (trick_counts !== undefined) {
      fields.push('winners = ?');
      values.push(JSON.stringify(winners));
      fields.push('trick_counts = ?');
      values.push(JSON.stringify(trickCountsObj));
      fields.push('scores = ?');
      values.push(JSON.stringify(scores));
    }

    if (archived_at !== undefined) {
      fields.push('archived_at = ?');
      values.push(archived_at);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(roundId);

    db.prepare(`
      UPDATE kinderkarten_rounds SET ${fields.join(', ')} WHERE id = ?
    `).run(...values);

    const updated = db.prepare('SELECT * FROM kinderkarten_rounds WHERE id = ?').get(roundId);
    res.json(parseRound(updated));
  } catch (error) {
    console.error('Error updating kinderkarten round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

router.delete('/last', (req, res) => {
  try {
    const { id } = req.params;

    const lastRound = db.prepare(`
      SELECT id FROM kinderkarten_rounds
      WHERE session_id = ? AND archived_at IS NULL
      ORDER BY seq DESC LIMIT 1
    `).get(id);

    if (lastRound) {
      db.prepare('DELETE FROM kinderkarten_rounds WHERE id = ?').run(lastRound.id);

      const gameCount = db.prepare('SELECT COUNT(*) as count FROM kinderkarten_rounds WHERE session_id = ?').get(id).count;
      db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?').run(gameCount, id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting kinderkarten round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;
