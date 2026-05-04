import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db.js';
import sessionsRouter from './routes/sessions.js';
import gamesRouter from './routes/games.js';
import playersRouter from './routes/players.js';
import wizardRoundsRouter from './routes/wizard/rounds.js';
import wattenGamesRouter from './routes/watten/games.js';
import rommeRoundsRouter from './routes/romme/rounds.js';
import kinderkartenRoundsRouter from './routes/kinderkarten/rounds.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

app.use('/api/players', playersRouter);
app.use('/api/sessions/:id/games', gamesRouter);
app.use('/api/sessions/:id/wizard-rounds', wizardRoundsRouter);
app.use('/api/sessions/:id/watten', wattenGamesRouter);
app.use('/api/sessions/:id/romme-rounds', rommeRoundsRouter);
app.use('/api/sessions/:id/kinderkarten-rounds', kinderkartenRoundsRouter);
app.use('/api/sessions', sessionsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: process.env.npm_package_version ?? 'unknown' });
});

const countStmts = {
  players:           db.prepare('SELECT COUNT(*) AS n FROM players'),
  sessions:          db.prepare('SELECT COUNT(*) AS n FROM sessions'),
  games:             db.prepare('SELECT COUNT(*) AS n FROM games'),
  wizardRounds:      db.prepare('SELECT COUNT(*) AS n FROM wizard_rounds'),
  wattenGames:       db.prepare('SELECT COUNT(*) AS n FROM watten_games'),
  rommeRounds:       db.prepare('SELECT COUNT(*) AS n FROM romme_rounds'),
  kinderkartenRounds:db.prepare('SELECT COUNT(*) AS n FROM kinderkarten_rounds'),
};

app.get('/api/stats', (_req, res) => {
  try {
    const rounds =
      countStmts.games.get().n +
      countStmts.wizardRounds.get().n +
      countStmts.wattenGames.get().n +
      countStmts.rommeRounds.get().n +
      countStmts.kinderkartenRounds.get().n;
    res.json({
      timestamp: new Date().toISOString(),
      players:  { total: countStmts.players.get().n },
      sessions: { total: countStmts.sessions.get().n },
      rounds:   { total: rounds },
    });
  } catch (err) {
    console.error('[stats] failed:', err);
    res.status(500).json({ error: 'stats_unavailable' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  app.get('/*path', (_req, res) => res.sendFile(join(__dirname, '../dist/index.html')));
}

const PORT = process.env.PORT ?? 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[${process.env.NODE_ENV ?? 'development'}] Server listening on http://0.0.0.0:${PORT}`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
