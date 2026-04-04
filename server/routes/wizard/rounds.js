import { Router } from 'express';
import db from '../../db.js';

const router = Router({ mergeParams: true });

const parseRound = (r) => ({
  ...r,
  round_number: Number(r.round_number),
  predictions: JSON.parse(r.predictions || '{}'),
  tricks: JSON.parse(r.tricks || '{}'),
  scores: JSON.parse(r.scores || '{}'),
});

// Alle aktiven Runden holen
router.get('/', (req, res) => {
  try {
    const { id } = req.params;
    
    const rows = db.prepare(`
      SELECT wr.*, COUNT(CASE WHEN wr.archived_at IS NULL THEN 1 END) as round_count
      FROM wizard_rounds wr
      WHERE wr.session_id = ? AND wr.archived_at IS NULL
      GROUP BY wr.id
      ORDER BY wr.round_number ASC
    `).all(id);

    res.json(rows.map(r => parseRound(r)));
  } catch (error) {
    console.error('Error fetching wizard rounds:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Archivierte Runden holen
router.get('/archived', (req, res) => {
  const { id } = req.params;
  
  const rows = db.prepare(`
    SELECT wr.*, s.name as session_name, s.players as session_players
    FROM wizard_rounds wr
    JOIN sessions s ON s.id = wr.session_id
    WHERE wr.session_id = ? AND wr.archived_at IS NOT NULL
    ORDER BY wr.round_number ASC
  `).all(id);

  res.json(rows.map(r => ({
    ...parseRound(r),
    session_name: r.session_name,
    session_players: JSON.parse(r.session_players),
  })));
});

// Neue Runde eintragen
router.post('/', (req, res) => {
  try {
    const { id } = req.params;
    const { predictions, tricks } = req.body;

    if (!predictions || !tricks) {
      return res.status(400).json({ error: 'predictions and tricks are required' });
    }

    // Scores berechnen
    const players = Object.keys(predictions);
    const scores = {};
    players.forEach(p => {
      const pred = predictions[p] ?? 0;
      const actual = tricks[p] ?? 0;
      const diff = pred - actual;
      
      if (diff === 0) {
        // Korrekte Vorhersage
        scores[p] = 20 + (actual * 10);
      } else {
        // Falsche Vorhersage
        scores[p] = -(Math.abs(diff) * 10);
      }
    });

    // Nächste Rundennummer bestimmen
    const { maxRound } = db.prepare(
      'SELECT MAX(round_number) as maxRound FROM wizard_rounds WHERE session_id = ?'
    ).get(id);
    const nextRound = (maxRound || 0) + 1;

    const insert = db.prepare(`
      INSERT INTO wizard_rounds
        (session_id, round_number, predictions, tricks, scores, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      nextRound,
      JSON.stringify(predictions),
      JSON.stringify(tricks),
      JSON.stringify(scores),
      new Date().toISOString(),
    );

    const round = db.prepare(
      'SELECT * FROM wizard_rounds WHERE id = ?'
    ).get(insert.lastInsertRowid);

    res.status(201).json(parseRound(round));
  } catch (error) {
    console.error('Error creating wizard round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Runde bearbeiten
router.patch('/:roundId', (req, res) => {
  try {
    const { id, roundId } = req.params;
    const { predictions, tricks, archived_at } = req.body;

    const round = db.prepare(
      'SELECT * FROM wizard_rounds WHERE id = ? AND session_id = ?'
    ).get(roundId, id);

    if (!round) return res.status(404).json({ error: 'Round not found' });

    // Full Edit - nur erlaubt bei nicht archivierten Runden
    const isFullEdit = predictions !== undefined;
    if (isFullEdit && round.archived_at) {
      return res.status(409).json({ error: 'Cannot edit an archived round' });
    }

    if (isFullEdit) {
      // Scores neu berechnen
      const players = Object.keys(predictions);
      const scores = {};
      players.forEach(p => {
        const pred = predictions[p] ?? 0;
        const actual = tricks[p] ?? 0;
        const diff = pred - actual;
        
        if (diff === 0) {
          scores[p] = 20 + (actual * 10);
        } else {
          scores[p] = -(Math.abs(diff) * 10);
        }
      });

      db.prepare(`
        UPDATE wizard_rounds SET
          predictions = ?, tricks = ?, scores = ?
        WHERE id = ?
      `).run(
        JSON.stringify(predictions),
        JSON.stringify(tricks),
        JSON.stringify(scores),
        roundId,
      );
    }

    // Archivieren / Wiederherstellen
    if (archived_at !== undefined) {
      db.prepare('UPDATE wizard_rounds SET archived_at = ? WHERE id = ?').run(
        archived_at, roundId
      );
    }

    const updated = db.prepare(
      'SELECT * FROM wizard_rounds WHERE id = ?'
    ).get(roundId);

    res.json(parseRound(updated));
  } catch (error) {
    console.error('Error updating wizard round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Letzte Runde löschen (Undo)
router.delete('/last', (req, res) => {
  const { id } = req.params;

  const lastRound = db.prepare(`
    SELECT * FROM wizard_rounds
    WHERE session_id = ? AND archived_at IS NULL
    ORDER BY round_number DESC
    LIMIT 1
  `).get(id);

  if (!lastRound) return res.status(404).json({ error: 'No rounds to undo' });

  db.prepare('DELETE FROM wizard_rounds WHERE id = ?').run(lastRound.id);
  res.status(204).end();
});

// Runde endgültig löschen
router.delete('/:roundId', (req, res) => {
  const { id, roundId } = req.params;

  const round = db.prepare(
    'SELECT * FROM wizard_rounds WHERE id = ? AND session_id = ?'
  ).get(roundId, id);

  if (!round) return res.status(404).json({ error: 'Round not found' });

  db.prepare('DELETE FROM wizard_rounds WHERE id = ?').run(roundId);
  res.status(204).end();
});

export default router;
