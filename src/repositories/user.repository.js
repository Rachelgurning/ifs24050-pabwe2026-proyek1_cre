function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    nim: row.nim,
    name: row.name,
    role: row.role,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export function createUserRepository(db) {
  const findByNimStmt = db.prepare('SELECT * FROM users WHERE nim = ?');
  const findByIdStmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const insertStmt = db.prepare(
    'INSERT INTO users (nim, name, password_hash, role) VALUES (@nim, @name, @passwordHash, @role)',
  );
  const countStmt = db.prepare('SELECT COUNT(*) AS total FROM users');

  return {
    findByNim: (nim) => toUser(findByNimStmt.get(nim)),
    findById: (id) => toUser(findByIdStmt.get(id)),
    count: () => countStmt.get().total,

    create({ nim, name, passwordHash, role = 'student' }) {
      const { lastInsertRowid } = insertStmt.run({ nim, name, passwordHash, role });
      return toUser(findByIdStmt.get(lastInsertRowid));
    },
  };
}
