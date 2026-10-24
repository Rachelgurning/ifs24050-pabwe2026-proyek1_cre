/**
 * Skema database VoteDel.
 * Waktu disimpan sebagai string ISO 8601 (UTC) agar dapat dibandingkan secara leksikografis.
 * Constraint UNIQUE(election_id, user_id) pada tabel votes menjamin satu suara per pemilih
 * walaupun terjadi permintaan bersamaan.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nim           TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS elections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_at    TEXT NOT NULL,
  end_at      TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (end_at > start_at)
);

CREATE TABLE IF NOT EXISTS candidates (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  election_id INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  number      INTEGER NOT NULL CHECK (number > 0),
  name        TEXT NOT NULL,
  vision      TEXT NOT NULL DEFAULT '',
  mission     TEXT NOT NULL DEFAULT '',
  UNIQUE (election_id, number)
);

CREATE TABLE IF NOT EXISTS votes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  election_id  INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (election_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_candidates_election ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
`;
