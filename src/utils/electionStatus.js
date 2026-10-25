export const ELECTION_STATUS = Object.freeze({
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  CLOSED: 'closed',
});

/** Menentukan status pemilihan berdasarkan jadwal dan waktu saat ini. */
export function computeElectionStatus(startAt, endAt, now = new Date()) {
  const current = now.toISOString();

  if (current < startAt) return ELECTION_STATUS.UPCOMING;
  if (current >= endAt) return ELECTION_STATUS.CLOSED;
  return ELECTION_STATUS.ACTIVE;
}
