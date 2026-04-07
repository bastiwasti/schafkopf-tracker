import express from 'express';
import sessionsRouter from './routes/sessions.js';
import gamesRouter from './routes/games.js';
import playersRouter from './routes/players.js';
import wizardRoundsRouter from './routes/wizard/rounds.js';
import wattenGamesRouter from './routes/watten/games.js';
import rommeRoundsRouter from './routes/romme/rounds.js';

const app = express();
app.use(express.json());

app.use('/api/players', playersRouter);
app.use('/api/sessions/:id/games', gamesRouter);
app.use('/api/sessions/:id/wizard-rounds', wizardRoundsRouter);
app.use('/api/sessions/:id/watten', wattenGamesRouter);
app.use('/api/sessions/:id/romme-rounds', rommeRoundsRouter);
app.use('/api/sessions', sessionsRouter);

const PORT = process.env.PORT ?? 3001;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`[${process.env.NODE_ENV ?? 'development'}] Server listening on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
