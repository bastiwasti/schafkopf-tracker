import express from 'express';
import sessionsRouter from './routes/sessions.js';
import gamesRouter from './routes/games.js';
import playersRouter from './routes/players.js';
import wizardRoundsRouter from './routes/wizard/rounds.js';

const app = express();
app.use(express.json());

app.use('/api/players', playersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/sessions/:id/games', gamesRouter);
app.use('/api/sessions/:id/wizard-rounds', wizardRoundsRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
