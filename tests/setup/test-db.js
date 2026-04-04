import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-schafkopf.db');
const PROD_DB_PATH = path.join(process.cwd(), 'data', 'schafkopf.db');

export function setupTestDatabase() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  const db = new Database(TEST_DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      game_type TEXT DEFAULT 'schafkopf',
      players TEXT,
      stake REAL DEFAULT 0.50,
      bock INTEGER DEFAULT 1,
      wizard_status TEXT,
      created_at TEXT NOT NULL,
      archived_at TEXT,
      game_variant TEXT DEFAULT 'skat_3er',
      skat_bock_level INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      avatar TEXT DEFAULT '🃏',
      created_at TEXT NOT NULL,
      character_type TEXT DEFAULT 'dramatic',
      voice_name TEXT
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      seq INTEGER NOT NULL,
      type TEXT NOT NULL,
      player TEXT NOT NULL,
      partner TEXT,
      won INTEGER NOT NULL,
      schneider INTEGER DEFAULT 0,
      schwarz INTEGER DEFAULT 0,
      laufende INTEGER DEFAULT 0,
      bock INTEGER DEFAULT 1,
      klopfer TEXT,
      spielwert REAL NOT NULL,
      changes TEXT,
      created_at TEXT NOT NULL,
      archived_at TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wizard_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      round_number INTEGER NOT NULL,
      predictions TEXT,
      tricks TEXT,
      scores TEXT,
      created_at TEXT NOT NULL,
      archived_at TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skat_games (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      seq INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      archived_at TEXT,
      game_type TEXT NOT NULL,
      declarer TEXT NOT NULL,
      partner TEXT,
      contra TEXT,
      won INTEGER,
      schneider INTEGER,
      schwarz INTEGER,
      laufende INTEGER DEFAULT 0,
      klopfer TEXT,
      bock INTEGER DEFAULT 1,
      kontra_multiplier INTEGER DEFAULT 1,
      points INTEGER,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
  `);

  return db;
}

export function cleanupTestDatabase() {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}
