import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM players ORDER BY name ASC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { id, name, avatar = '🃏', character_type = 'optimist', voice_name = null } = req.body;
  if (!id || !name?.trim()) {
    return res.status(400).json({ error: 'id and name are required' });
  }
  try {
    db.prepare('INSERT INTO players (id, name, avatar, character_type, voice_name, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, name.trim(), avatar, character_type, voice_name, new Date().toISOString()
    );
  } catch (e) {
    if (e.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Name bereits vergeben' });
    }
    throw e;
  }
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id);
  res.status(201).json(player);
});

router.patch('/:id', (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Spieler nicht gefunden' });

  const { name, avatar, character_type, voice_name } = req.body;
  try {
    if (name !== undefined) {
      db.prepare('UPDATE players SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
    }
    if (avatar !== undefined) {
      db.prepare('UPDATE players SET avatar = ? WHERE id = ?').run(avatar, req.params.id);
    }
    if (character_type !== undefined) {
      db.prepare('UPDATE players SET character_type = ? WHERE id = ?').run(character_type, req.params.id);
    }
    if (voice_name !== undefined) {
      db.prepare('UPDATE players SET voice_name = ? WHERE id = ?').run(voice_name, req.params.id);
    }
  } catch (e) {
    if (e.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Name bereits vergeben' });
    }
    throw e;
  }
  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Spieler nicht gefunden' });
  db.prepare('DELETE FROM players WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
