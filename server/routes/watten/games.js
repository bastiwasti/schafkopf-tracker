import { Router } from 'express';
import db from '../../db.js';

const router = Router({ mergeParams: true });

const parseRound = (r) => ({
  ...r,
  round_number: Number(r.round_number),
  points: Number(r.points),
  is_machine: Boolean(r.is_machine),
  is_spannt_played: Boolean(r.is_spannt_played),
  is_gegangen: Boolean(r.is_gegangen),
  tricks_team1: Number(r.tricks_team1),
  tricks_team2: Number(r.tricks_team2),
});

const parseGame = (g) => ({
  ...g,
  game_number: Number(g.game_number),
  final_score_team1: Number(g.final_score_team1),
  final_score_team2: Number(g.final_score_team2),
  is_completed: Boolean(g.is_completed),
});

// Alle Runden abrufen
router.get('/rounds', (req, res) => {
  try {
    const { id } = req.params;
    const rounds = db.prepare(`
      SELECT 
        id, 
        session_id, 
        game_id, 
        round_number, 
        winning_team, 
        points, 
        is_machine, 
        is_spannt_played, 
        is_gegangen, 
        tricks_team1, 
        tricks_team2, 
        created_at, 
        archived_at
      FROM watten_rounds
      WHERE session_id = ? AND archived_at IS NULL
      ORDER BY round_number ASC
    `).all(id);
    
    // Runden pro Game gruppieren
    const roundsByGame = {};
    rounds.forEach(r => {
      const gameId = r.game_id || 'active';
      if (!roundsByGame[gameId]) {
        roundsByGame[gameId] = [];
      }
      roundsByGame[gameId].push(parseRound(r));
    });
 
    res.json({
      all: rounds.map(parseRound),
      byGame: roundsByGame
    });
  } catch (error) {
    console.error('Error fetching watten rounds:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Alle Spiele (Bummel) abrufen
router.get('/games', (req, res) => {
  try {
    const { id } = req.params;
    const games = db.prepare(`
      SELECT * FROM watten_games
      WHERE session_id = ? AND archived_at IS NULL
      ORDER BY game_number ASC
    `).all(id);

    // Aktives und abgeschlossene Games trennen
    const activeGame = games.find(g => !g.is_completed);
    const completedGames = games.filter(g => g.is_completed);

    res.json({
      active: activeGame ? parseGame(activeGame) : null,
      completed: completedGames.map(parseGame),
      all: games.map(parseGame)
    });
  } catch (error) {
    console.error('Error fetching watten games:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Neue Runde eintragen
router.post('/rounds', (req, res) => {
  try {
    const { id } = req.params;
    const { winning_team, points, is_machine, is_spannt_played, is_gegangen, tricks_team1, tricks_team2 } = req.body;

    if (!winning_team) {
      return res.status(400).json({ error: 'winning_team is required' });
    }

    // Prüfen ob ein aktives Game existiert
    const activeGame = db.prepare(`
      SELECT * FROM watten_games
      WHERE session_id = ? AND is_completed = 0 AND archived_at IS NULL
      ORDER BY game_number DESC LIMIT 1
    `).get(id);

    let currentGameId;

    if (!activeGame) {
      // Neues aktives Game erstellen
      const { maxGame } = db.prepare('SELECT MAX(game_number) as maxGame FROM watten_games WHERE session_id = ?').get(id);
      const nextGameNumber = (maxGame || 0) + 1;

      currentGameId = db.prepare(`
        INSERT INTO watten_games (session_id, game_number, winner_team, final_score_team1, final_score_team2, is_completed, bommerl_team, created_at)
        VALUES (?, ?, ?, 0, 0, 0, NULL, ?)
      `).run(id, nextGameNumber, 'team1', new Date().toISOString()).lastInsertRowid;
    } else {
      currentGameId = activeGame.id;
    }

    // Nächste Rundennummer bestimmen
    const { maxRound } = db.prepare('SELECT MAX(round_number) as maxRound FROM watten_rounds WHERE session_id = ?').get(id);
    const nextRound = (maxRound || 0) + 1;

    // Round speichern mit game_id
    const roundId = db.prepare(`
      INSERT INTO watten_rounds (session_id, game_id, round_number, winning_team, points, is_machine, is_spannt_played, is_gegangen, tricks_team1, tricks_team2, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      currentGameId,
      nextRound,
      winning_team,
      points || 2,
      is_machine ? 1 : 0,
      is_spannt_played ? 1 : 0,
      is_gegangen ? 1 : 0,
      tricks_team1 || 0,
      tricks_team2 || 0,
      new Date().toISOString()
    ).lastInsertRowid;

     const round = db.prepare('SELECT * FROM watten_rounds WHERE id = ?').get(roundId);
    // Team-Punkte für aktuelles Game berechnen
    const { team1_score, team2_score } = db.prepare(`
      SELECT
        SUM(CASE WHEN winning_team = 'team1' THEN points ELSE 0 END) as team1_score,
        SUM(CASE WHEN winning_team = 'team2' THEN points ELSE 0 END) as team2_score
      FROM watten_rounds WHERE game_id = ?
    `).get(currentGameId) || { team1_score: 0, team2_score: 0 };

    // Prüfen ob Game gewonnen (15 Punkte)
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
    const targetScore = session.watten_target_score || 15;

    if (team1_score >= targetScore || team2_score >= targetScore) {
      const winner = team1_score >= targetScore ? 'team1' : 'team2';
      const loser = team1_score >= targetScore ? 'team2' : 'team1';

      // Aktives Game als abgeschlossen markieren
      db.prepare(`
        UPDATE watten_games
        SET is_completed = 1, winner_team = ?, final_score_team1 = ?, final_score_team2 = ?, bommerl_team = ?
        WHERE id = ?
      `).run(winner, team1_score, team2_score, loser, currentGameId);
    }

    // Session game_count aktualisieren
    const roundCount = db.prepare('SELECT COUNT(*) as count FROM watten_rounds WHERE session_id = ? AND archived_at IS NULL').get(id).count;
    db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?').run(roundCount, id);

    res.status(201).json(parseRound(round));
  } catch (error) {
    console.error('Error creating watten round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Letzte Runde löschen (Undo)
router.delete('/rounds/last', (req, res) => {
  try {
    const { id } = req.params;

    const lastRound = db.prepare(`
      SELECT * FROM watten_rounds
      WHERE session_id = ? AND archived_at IS NULL
      ORDER BY round_number DESC LIMIT 1
    `).get(id);

    if (!lastRound) {
      return res.status(404).json({ error: 'No rounds to undo' });
    }

    const gameId = lastRound.game_id;
    db.prepare('DELETE FROM watten_rounds WHERE id = ?').run(lastRound.id);

    // Prüfen ob das Game noch Runden hat
    const roundsInGame = db.prepare('SELECT COUNT(*) as count FROM watten_rounds WHERE game_id = ? AND archived_at IS NULL').get(gameId).count;

    if (roundsInGame === 0) {
      // Game löschen wenn es keine Runden mehr hat
      db.prepare('DELETE FROM watten_games WHERE id = ?').run(gameId);
    } else {
      // Aktuelles Game neu berechnen wenn Runden noch existieren
      const { team1_score, team2_score } = db.prepare(`
        SELECT
          SUM(CASE WHEN winning_team = 'team1' THEN points ELSE 0 END) as team1_score,
          SUM(CASE WHEN winning_team = 'team2' THEN points ELSE 0 END) as team2_score
        FROM watten_rounds WHERE game_id = ?
      `).get(gameId) || { team1_score: 0, team2_score: 0 };

      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
      const targetScore = session.watten_target_score || 15;

      if (team1_score >= targetScore || team2_score >= targetScore) {
        const winner = team1_score >= targetScore ? 'team1' : 'team2';
        const loser = team1_score >= targetScore ? 'team2' : 'team1';

        db.prepare(`
          UPDATE watten_games
          SET is_completed = 1, winner_team = ?, final_score_team1 = ?, final_score_team2 = ?, bommerl_team = ?
          WHERE id = ?
        `).run(winner, team1_score, team2_score, loser, gameId);
      } else {
        // Game als aktiv markieren wenn Score unter 15
        db.prepare(`
          UPDATE watten_games
          SET is_completed = 0, final_score_team1 = ?, final_score_team2 = ?, bommerl_team = NULL
          WHERE id = ?
        `).run(team1_score, team2_score, gameId);
      }
    }

    // Session game_count aktualisieren
    const roundCount = db.prepare('SELECT COUNT(*) as count FROM watten_rounds WHERE session_id = ? AND archived_at IS NULL').get(id).count;
    db.prepare('UPDATE sessions SET game_count = ? WHERE id = ?').run(roundCount, id);

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting watten round:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Letztes Spiel löschen
router.delete('/games/last', (req, res) => {
  try {
    const { id } = req.params;

    const lastGame = db.prepare(`
      SELECT * FROM watten_games
      WHERE session_id = ? AND archived_at IS NULL
      ORDER BY game_number DESC LIMIT 1
    `).get(id);

    if (!lastGame) {
      return res.status(404).json({ error: 'No games to delete' });
    }

    db.prepare('DELETE FROM watten_games WHERE id = ?').run(lastGame.id);

    // Alle Runden löschen die zu diesem Game gehören
    db.prepare('DELETE FROM watten_rounds WHERE game_id = ?').run(lastGame.id);

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting watten game:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Neues Game starten (wenn aktives Game abgeschlossen oder User will neu starten)
router.post('/games', (req, res) => {
  try {
    const { id } = req.params;

    // Prüfen ob bereits ein aktives Game existiert
    const activeGame = db.prepare(`
      SELECT * FROM watten_games
      WHERE session_id = ? AND is_completed = 0 AND archived_at IS NULL
      ORDER BY game_number DESC LIMIT 1
    `).get(id);

    if (activeGame) {
      return res.status(400).json({ error: 'Es gibt bereits ein aktives Spiel' });
    }

    // Neues Game erstellen
    const { maxGame } = db.prepare('SELECT MAX(game_number) as maxGame FROM watten_games WHERE session_id = ?').get(id);
    const nextGameNumber = (maxGame || 0) + 1;

    const gameId = db.prepare(`
      INSERT INTO watten_games (session_id, game_number, winner_team, final_score_team1, final_score_team2, is_completed, bommerl_team, created_at)
      VALUES (?, ?, ?, 0, 0, 0, NULL, ?)
    `).run(id, nextGameNumber, 'team1', new Date().toISOString()).lastInsertRowid;

    const game = db.prepare('SELECT * FROM watten_games WHERE id = ?').get(gameId);

    res.status(201).json(parseGame(game));
  } catch (error) {
    console.error('Error creating watten game:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;
