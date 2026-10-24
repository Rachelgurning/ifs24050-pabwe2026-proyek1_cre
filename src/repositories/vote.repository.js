const SQLITE_CONSTRAINT_UNIQUE = 2067;

/** Mendeteksi pelanggaran constraint UNIQUE dari node:sqlite (errcode 2067). */
export function isUniqueViolation(error) {
  return (
    error?.errcode === SQLITE_CONSTRAINT_UNIQUE ||
    /UNIQUE constraint failed/i.test(error?.message ?? '')
  );
}

export function createVoteRepository(db) {
  const hasVotedStmt = db.prepare('SELECT 1 FROM votes WHERE election_id = ? AND user_id = ?');
  const insertStmt = db.prepare(
    'INSERT INTO votes (election_id, candidate_id, user_id) VALUES (@electionId, @candidateId, @userId)',
  );
  const historyStmt = db.prepare(
    `SELECT v.election_id, v.created_at, e.title
     FROM votes v
     JOIN elections e ON e.id = v.election_id
     WHERE v.user_id = ?
     ORDER BY v.created_at DESC`,
  );
  const votedElectionIdsStmt = db.prepare('SELECT election_id FROM votes WHERE user_id = ?');
  const tallyStmt = db.prepare(
    `SELECT c.id AS candidate_id, COUNT(v.id) AS votes
     FROM candidates c
     LEFT JOIN votes v ON v.candidate_id = c.id
     WHERE c.election_id = ?
     GROUP BY c.id`,
  );

  return {
    hasVoted: (electionId, userId) => Boolean(hasVotedStmt.get(electionId, userId)),
    create: (data) => insertStmt.run(data),

    findHistoryByUser: (userId) =>
      historyStmt.all(userId).map((row) => ({
        electionId: row.election_id,
        title: row.title,
        votedAt: row.created_at,
      })),

    findVotedElectionIds: (userId) =>
      new Set(votedElectionIdsStmt.all(userId).map((row) => row.election_id)),

    tally: (electionId) =>
      new Map(tallyStmt.all(electionId).map((row) => [row.candidate_id, row.votes])),
  };
}
