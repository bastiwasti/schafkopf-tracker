# Schafkopf Tracker — Agent Guide

**Agent-specific documentation for implementing features, deployment, and testing.**

## Quick Start for Agents

```bash
# Install dependencies
npm install

# Local development (Vite :5173 + Express :3001)
npm run dev

# Test environment (Playwright + tracker-test.db)
NODE_ENV=test npm run dev:test

# Production server (PM2, tracker.db)
NODE_ENV=production PORT=3002 node server/index.js
```

## Project Structure

```
schafkopf-tracker/
├── server/                 # Express backend
│   ├── index.js           # Main entry point
│   ├── db.js              # SQLite schema & migrations
│   └── routes/            # API endpoints
│       ├── sessions.js
│       ├── games.js        # Schafkopf
│       ├── players.js
│       ├── wizard/rounds.js
│       └── watten/games.js # Watten rounds & games
├── src/                   # React frontend
│   ├── App.jsx            # View router
│   ├── components/        # Shared UI components
│   ├── games/            # Game plugins
│   │   ├── schafkopf/
│   │   ├── wizard/
│   │   └── watten/       # WattenSession, commentary, roundScenarios
│   └── hooks/            # React hooks
├── data/                 # SQLite databases
│   ├── tracker.db        # Production (real games, git-tracked)
│   ├── tracker-dev.db    # Development (testing, git-ignored)
│   └── tracker-test.db   # E2E tests (auto-reset, git-ignored)
├── ecosystem.config.cjs  # PM2 process configuration
├── tests/                # Playwright E2E tests
└── docs/                 # Full documentation
```

## Environment Separation (CRITICAL)

| Environment | URL | Port | Database | Purpose |
|-------------|-----|------|-----------|---------|
| **Local** | localhost:5173 | 3001 | tracker-dev.db | Development |
| **Dev** | dev.schafkopf.eventig.app | 3001 | tracker-dev.db | Feature testing |
| **Prod** | schafkopf.eventig.app | 3002 | tracker.db | Real games |

**CRITICAL RULE:**
- Dev and Prod share the **same `dist/` folder** (built assets)
- Dev and Prod have **separate databases**
- Both run from the **same directory** (`/home/vscode/schafkopf-tracker`)
- **Never test on Prod** — use Dev only

## Database Schema & Architecture

See `docs/architecture.md` for complete details:

- **Sessions table** - Game rounds with players
- **Players table** - Registered players with avatars/characters
- **Games table** - Schafkopf games with scores
- **Wizard rounds** - Wizard predictions/tricks/scores

## Plugin Architecture

All game logic is plugin-based in `src/games/`:

**Schafkopf Plugin:** `src/games/schafkopf/plugin.js`
- Complete game logic, UI, commentary
- Live score calculation
- Bock rounds, klopfer support

**Wizard Plugin:** `src/games/wizard/plugin.js`
- Prediction-based game with phases
- Automatic score calculation
- Live commentary system

**Watten Plugin:** `src/games/watten/plugin.js`
- Bavarian 4-player card game, 2v2 teams
- Gespannt mode, Maschine, Gegangen, Bommerl tracking
- 17-scenario commentary system

## Deployment Process

**Current deployment status:**
- Server: VM with PM2 process manager
- Nginx: Reverse proxy for static files and API
- SSL: Certbot auto-renewal

**Deployment steps (we are already on the VM):**
```bash
# Build and restart Dev
npm run build
pm2 restart schafkopf-dev

# Restart Prod (only when explicitly requested)
pm2 restart schafkopf-prod
```

PM2 processes are configured in `ecosystem.config.cjs` (must be `.cjs` due to `"type": "module"` in package.json).

**PM2 Commands:**
```bash
pm2 list                          # Check status
pm2 logs schafkopf-dev          # Dev logs
pm2 logs schafkopf-prod         # Prod logs
pm2 restart schafkopf-dev        # Restart Dev
pm2 restart schafkopf-prod       # Restart Prod
pm2 monit                        # Monitoring
```

**Database Operations:**
```bash
# Reset Dev database
rm -f data/tracker-dev.db*
pm2 restart schafkopf-dev

# Copy Prod data to Dev (for testing with real data)
pm2 stop schafkopf-dev
cp data/tracker.db* data/tracker-dev.db*
pm2 start schafkopf-dev
```

## Testing

**E2E Testing (Playwright):**
```bash
# Run tests
npm run test:e2e

# Run with clean database
npm run test:e2e:clean

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

**Test Files:**
- `tests/specs/schafkopf.spec.js` - Schafkopf game flow
- `tests/specs/wizard.spec.js` - Wizard round flow
- `tests/specs/wizard-commentary.spec.js` - Wizard commentary
- `tests/specs/player-manager.spec.js` - Player management

**Testing Best Practices:**
1. Always test on Dev first
2. Run `npm run test:e2e` before committing
3. Use `npm run test:e2e:clean` for fresh database
4. Check browser console for errors during tests

## API Reference

See `docs/api.md` for complete API documentation:

**Sessions:**
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PATCH /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

**Schafkopf Games:**
- `GET /api/sessions/:id/games` - List games
- `POST /api/sessions/:id/games` - Create game
- `PATCH /api/sessions/:id/games/:gameId` - Update game
- `DELETE /api/sessions/:id/games/last` - Delete last game

**Wizard Rounds:**
- `GET /api/sessions/:id/wizard-rounds` - List rounds
- `POST /api/sessions/:id/wizard-rounds` - Create round
- `PATCH /api/sessions/:id/wizard-rounds/:roundId` - Update round
- `DELETE /api/sessions/:id/wizard-rounds/last` - Delete last round

**Watten:**
- `GET /api/sessions/:id/watten/rounds` - List rounds (grouped by game)
- `POST /api/sessions/:id/watten/rounds` - Create round
- `DELETE /api/sessions/:id/watten/rounds/last` - Undo last round
- `GET /api/sessions/:id/watten/games` - List games (active + completed)
- `POST /api/sessions/:id/watten/games` - Start new game
- `DELETE /api/sessions/:id/watten/games/last` - Delete last game

**Players:**
- `GET /api/players` - List all players
- `POST /api/players` - Create player
- `PATCH /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

## Feature Implementation Guide

**Adding New Features:**

1. **Identify impact:**
   - Frontend only? → Edit React components
   - Backend only? → Edit Express routes
   - Both? → Edit both layers
   - Database change? → Update `server/db.js` with migrations

2. **Implement changes:**
   - Follow existing code style
   - Use inline styles from `src/components/styles.js`
   - Add proper error handling

3. **Test locally:**
   ```bash
   npm run dev
   # Test in browser at localhost:5173
   ```

4. **Run E2E tests:**
   ```bash
   npm run test:e2e
   ```

5. **Deploy to Dev:**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin master
   # On VM: git pull && npm run build && pm2 restart schafkopf-dev
   ```

6. **Verify on Dev:**
   - Test at dev.schafkopf.eventig.app
   - Check PM2 logs: `pm2 logs schafkopf-dev`

7. **Deploy to Prod (after Dev verification):**
   ```bash
   # On VM: pm2 restart schafkopf-prod
   ```

## Game Logic Reference

**Schafkopf Scoring:**
See `docs/game-logic.md` for complete rules

**Wizard Scoring:**
- Correct prediction: `20 + (tricks * 10)`
- Incorrect prediction: `-(|difference| * 10)`

## Commentary System

See `docs/commentary.md` for:
- 4 commentator personalities (dramatic, tagesschau, bavarian, fan)
- 10 player character types with 15 scenarios each
- TTS integration with Web Speech API
- Template-based commentary generation
- Watten: 17 scenarios × 4 personalities × 3 variants = 204 templates

## Troubleshooting

**Dev and Prod showing same data:**
- Check PM2 status: `pm2 list`
- Check database files: `ls -lah data/`
- Check for rogue systemd service: `sudo systemctl status schafkopf-backend`
- Restart servers: `pm2 restart schafkopf-dev schafkopf-prod`
- Clear browser cache: `Ctrl + Shift + R`

**API not responding:**
- Check PM2 logs: `pm2 logs schafkopf-dev`
- Check port availability: `ss -tlnp | grep 3001`
- Test API directly: `curl http://localhost:3001/api/sessions`

**Build issues:**
- Clear cache: `rm -rf node_modules/.vite`
- Reinstall: `npm install`
- Check package.json scripts

## Complete Documentation

- **[Architecture](./docs/architecture.md)** - System architecture, database schema, data flow
- **[API Reference](./docs/api.md)** - Complete REST API documentation
- **[Game Logic](./docs/game-logic.md)** - Game rules, scoring, plugin system
- **[Commentary](./docs/commentary.md)** - Commentator system, personalities, TTS
- **[Frontend](./docs/frontend.md)** - Component overview, UI structure
- **[Deployment](./docs/deployment.md)** - Hosting, deployment process, CI/CD
- **[Dev/Prod Separation](./docs/dev-prod-separation.md)** - Environment setup and separation

## Tech Stack

- **Frontend:** React 19 + Vite 8
- **Backend:** Express 5
- **Database:** SQLite 3 (better-sqlite3)
- **Styling:** Inline styles (no CSS framework)
- **Testing:** Playwright E2E
- **Language:** JavaScript (ES Modules)

## Code Standards

- Use existing inline styles from `src/components/styles.js`
- Follow React hooks patterns
- Use async/await for API calls
- Add proper error handling
- Write E2E tests for new features
- Keep database migrations backward compatible