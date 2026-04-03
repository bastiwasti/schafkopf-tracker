import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, 'tracker.db'));

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

export default db;
