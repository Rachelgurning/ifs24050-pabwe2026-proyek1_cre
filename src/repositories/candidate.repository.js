function toCandidate(row) {
  if (!row) return null;
  return {
    id: row.id,
    electionId: row.election_id,
    number: row.number,
    name: row.name,
    vision: row.vision,
    mission: row.mission,
  };
}

export function createCandidateRepository(db) {
  const findByElectionStmt = db.prepare(
    'SELECT * FROM candidates WHERE election_id = ? ORDER BY number ASC',
  );
  const findByIdStmt = db.prepare('SELECT * FROM candidates WHERE id = ?');
  const findByNumberStmt = db.prepare(
    'SELECT * FROM candidates WHERE election_id = ? AND number = ?',
  );
  const insertStmt = db.prepare(
    `INSERT INTO candidates (election_id, number, name, vision, mission)
     VALUES (@electionId, @number, @name, @vision, @mission)`,
  );
  const updateStmt = db.prepare(
    `UPDATE candidates
     SET number = @number, name = @name, vision = @vision, mission = @mission
     WHERE id = @id`,
  );
  const deleteStmt = db.prepare('DELETE FROM candidates WHERE id = ?');

  return {
    findByElection: (electionId) => findByElectionStmt.all(electionId).map(toCandidate),
    findById: (id) => toCandidate(findByIdStmt.get(id)),
    findByNumber: (electionId, number) => toCandidate(findByNumberStmt.get(electionId, number)),

    create(data) {
      const { lastInsertRowid } = insertStmt.run(data);
      return toCandidate(findByIdStmt.get(lastInsertRowid));
    },

    update(id, data) {
      updateStmt.run({ id, ...data });
      return toCandidate(findByIdStmt.get(id));
    },

    remove: (id) => deleteStmt.run(id).changes > 0,
  };
}
