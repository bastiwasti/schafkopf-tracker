import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

mkdirSync(DATA_DIR, { recursive: true });

const NODE_ENV = process.env.NODE_ENV || 'development';

const DB_FILES = {
  production:  'tracker.db',
  development: 'tracker-dev.db',
  test:        'tracker-test.db',
};

const dbFile = DB_FILES[NODE_ENV] ?? 'tracker-dev.db';
console.log(`[${NODE_ENV}] DB: ${dbFile}`);

const db = new Database(join(DATA_DIR, dbFile));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    game_type  TEXT NOT NULL DEFAULT 'schafkopf',
    players    TEXT NOT NULL,
    stake      REAL NOT NULL DEFAULT 0.50,
    bock       INTEGER NOT NULL DEFAULT 1,
    wizard_status TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS players (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    avatar     TEXT NOT NULL DEFAULT '🃏',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS games (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    seq        INTEGER NOT NULL,
    type       TEXT NOT NULL,
    player     TEXT NOT NULL,
    partner    TEXT,
    won        INTEGER NOT NULL,
    schneider  INTEGER NOT NULL DEFAULT 0,
    schwarz    INTEGER NOT NULL DEFAULT 0,
    laufende   INTEGER NOT NULL DEFAULT 0,
    bock       INTEGER NOT NULL DEFAULT 1,
    klopfer    TEXT NOT NULL DEFAULT '[]',
    spielwert  REAL NOT NULL,
    changes    TEXT NOT NULL,
    created_at TEXT NOT NULL,
    archived_at TEXT
  );

  CREATE TABLE IF NOT EXISTS wizard_rounds (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    predictions TEXT NOT NULL,
    tricks       TEXT NOT NULL,
    scores       TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    archived_at TEXT
  );
`);

  // Migrations for existing databases
  try { db.exec('ALTER TABLE sessions ADD COLUMN archived_at TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE sessions ADD COLUMN wizard_status TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE games ADD COLUMN archived_at TEXT'); } catch (e) {}
    try { db.exec("ALTER TABLE players ADD COLUMN character_type TEXT DEFAULT 'dramatic'"); } catch (e) {}
    try { db.exec('ALTER TABLE players ADD COLUMN voice_name TEXT'); } catch (e) {}
    try { db.exec('ALTER TABLE wizard_rounds ADD COLUMN archived_at TEXT'); } catch (e) {}
    try { db.exec('ALTER TABLE sessions ADD COLUMN game_count INTEGER DEFAULT 0'); } catch (e) {}

  // Skat tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS skat_games (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      seq INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      archived_at TEXT,

      game_type TEXT NOT NULL,
      declarer TEXT NOT NULL,
      mit_ohne TEXT DEFAULT 'mit',
      spitzen INTEGER DEFAULT 1,
      won BOOLEAN,
      schneider BOOLEAN,
      schwarz BOOLEAN,
      re BOOLEAN DEFAULT 0,
      bock BOOLEAN DEFAULT 0,
      hirsch BOOLEAN DEFAULT 0,
      ramsch_points TEXT,
      points INTEGER,

      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
  `);

  // Skat migrations for existing databases
  try { db.exec('ALTER TABLE sessions ADD COLUMN game_variant TEXT DEFAULT \'skat_3er\''); } catch (e) {}
  try { db.exec('ALTER TABLE sessions ADD COLUMN skat_bock_level INTEGER DEFAULT 1'); } catch (e) {}
  // New skat_games columns for reworked logic
  try { db.exec('ALTER TABLE skat_games ADD COLUMN mit_ohne TEXT DEFAULT \'mit\''); } catch (e) {}
  try { db.exec('ALTER TABLE skat_games ADD COLUMN spitzen INTEGER DEFAULT 1'); } catch (e) {}
  try { db.exec('ALTER TABLE skat_games ADD COLUMN re BOOLEAN DEFAULT 0'); } catch (e) {}
  try { db.exec('ALTER TABLE skat_games ADD COLUMN hirsch BOOLEAN DEFAULT 0'); } catch (e) {}
  try { db.exec('ALTER TABLE skat_games ADD COLUMN ramsch_points TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE skat_games ADD COLUMN active_players TEXT'); } catch (e) {}

  // Create indexes for skat_games
  db.exec('CREATE INDEX IF NOT EXISTS idx_skat_games_session ON skat_games(session_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_skat_games_created ON skat_games(created_at);');

  // Watten tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS watten_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      game_number INTEGER NOT NULL,
      winner_team TEXT NOT NULL,
      final_score_team1 INTEGER NOT NULL DEFAULT 0,
      final_score_team2 INTEGER NOT NULL DEFAULT 0,
      is_completed BOOLEAN DEFAULT 0,
      bommerl_team TEXT,
      created_at TEXT NOT NULL,
      archived_at TEXT
    );

    CREATE TABLE IF NOT EXISTS watten_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      game_id INTEGER REFERENCES watten_games(id) ON DELETE CASCADE,
      round_number INTEGER NOT NULL,
      winning_team TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 2,
      is_machine BOOLEAN DEFAULT 0,
      is_spannt_played BOOLEAN DEFAULT 0,
      is_gegangen BOOLEAN DEFAULT 0,
      tricks_team1 INTEGER DEFAULT 0,
      tricks_team2 INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      archived_at TEXT
    );
  `);

  // Create indexes for watten
  db.exec('CREATE INDEX IF NOT EXISTS idx_watten_games_session ON watten_games(session_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_watten_rounds_session ON watten_rounds(session_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_watten_rounds_game ON watten_rounds(game_id);');

  // Watten migrations for existing databases
  try { db.exec('ALTER TABLE sessions ADD COLUMN watten_target_score INTEGER DEFAULT 15'); } catch (e) {}
  try { db.exec('ALTER TABLE sessions ADD COLUMN watten_team1_players TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE sessions ADD COLUMN watten_team2_players TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE watten_games ADD COLUMN is_completed BOOLEAN DEFAULT 0'); } catch (e) {}
  try { db.exec('ALTER TABLE watten_games ADD COLUMN bommerl_team TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE watten_rounds ADD COLUMN is_gegangen BOOLEAN DEFAULT 0'); } catch (e) {}

  // Schafkopf optional game modes (Geier, Farbwenz)
  try { db.exec("ALTER TABLE sessions ADD COLUMN schafkopf_options TEXT DEFAULT '{}'"); } catch (e) {}

  // Doppelkopf game fields
  try { db.exec('ALTER TABLE games ADD COLUMN kontra INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
  try { db.exec("ALTER TABLE games ADD COLUMN ansage TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE games ADD COLUMN re_sonderpunkte TEXT NOT NULL DEFAULT '{}'"); } catch (e) {}
  try { db.exec("ALTER TABLE games ADD COLUMN kontra_sonderpunkte TEXT NOT NULL DEFAULT '{}'"); } catch (e) {}
  try { db.exec("ALTER TABLE sessions ADD COLUMN doppelkopf_options TEXT DEFAULT '{}'"); } catch (e) {}

  // Romme tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS romme_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      seq INTEGER NOT NULL,
      winner TEXT NOT NULL,
      scores TEXT NOT NULL,
      created_at TEXT NOT NULL,
      archived_at TEXT
    );
  `);

  // Create indexes for romme
  db.exec('CREATE INDEX IF NOT EXISTS idx_romme_rounds_session ON romme_rounds(session_id);');

  // Romme migrations for existing databases
  try { db.exec('ALTER TABLE sessions ADD COLUMN romme_target_score INTEGER DEFAULT 500'); } catch (e) {}
  try { db.exec("ALTER TABLE sessions ADD COLUMN romme_status TEXT"); } catch (e) {}

export default db;
