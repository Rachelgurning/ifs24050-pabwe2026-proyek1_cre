const SELECT_WITH_COUNTS = `
  SELECT e.*,
    (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.id) AS candidate_count,
    (SELECT COUNT(*) FROM votes v WHERE v.election_id = e.id) AS total_votes
  FROM elections e
`;

function toElection(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startAt: row.start_at,
    endAt: row.end_at,
    createdAt: row.created_at,
    candidateCount: row.candidate_count,
    totalVotes: row.total_votes,
  };
}

export function createElectionRepository(db) {
  const findAllStmt = db.prepare(`${SELECT_WITH_COUNTS} ORDER BY e.start_at DESC, e.id DESC`);
  const findByIdStmt = db.prepare(`${SELECT_WITH_COUNTS} WHERE e.id = ?`);
  const insertStmt = db.prepare(
    `INSERT INTO elections (title, description, start_at, end_at)
     VALUES (@title, @description, @startAt, @endAt)`,
  );
  const updateStmt = db.prepare(
    `UPDATE elections
     SET title = @title, description = @description, start_at = @startAt, end_at = @endAt
     WHERE id = @id`,
  );
  const deleteStmt = db.prepare('DELETE FROM elections WHERE id = ?');

  return {
    findAll: () => findAllStmt.all().map(toElection),
    findById: (id) => toElection(findByIdStmt.get(id)),

    create(data) {
      const { lastInsertRowid } = insertStmt.run(data);
      return toElection(findByIdStmt.get(lastInsertRowid));
    },

    update(id, data) {
      updateStmt.run({ id, ...data });
      return toElection(findByIdStmt.get(id));
    },

    remove: (id) => deleteStmt.run(id).changes > 0,
  };
}
