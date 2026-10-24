import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { SCHEMA_SQL } from './schema.js';

export const IN_MEMORY_DB = ':memory:';

/**
 * Membuka koneksi SQLite memakai modul bawaan Node.js (node:sqlite, Node >= 22.13),
 * sehingga tidak memerlukan kompilasi native / Visual Studio di Windows.
 * @param {string} dbPath lokasi file database atau ':memory:' untuk pengujian.
 */
export function createDatabase(dbPath) {
  if (dbPath !== IN_MEMORY_DB) {
    fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA_SQL);

  return db;
}
