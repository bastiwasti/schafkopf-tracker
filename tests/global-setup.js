import fs from 'fs';
import path from 'path';

export default async function globalSetup() {
  const testDb = path.join(process.cwd(), 'data', 'tracker-test.db');
  for (const file of [testDb, `${testDb}-shm`, `${testDb}-wal`]) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  console.log('Test DB bereinigt');
}
