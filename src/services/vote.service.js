import { isUniqueViolation } from '../repositories/vote.repository.js';
import { ELECTION_STATUS, computeElectionStatus } from '../utils/electionStatus.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/httpError.js';
import { validateVoteInput } from '../validators/election.validator.js';

const ALREADY_VOTED_MESSAGE = 'Anda sudah memberikan suara pada pemilihan ini.';

export function createVoteService({
  electionRepository,
  candidateRepository,
  voteRepository,
  clock = () => new Date(),
}) {
  return {
    castVote(user, electionId, body) {
      if (user.role !== 'student') {
        throw forbidden('Hanya mahasiswa yang dapat memberikan suara.');
      }

      const { candidateId } = validateVoteInput(body);
      const election = electionRepository.findById(electionId);
      if (!election) throw notFound('Pemilihan tidak ditemukan.');

      const status = computeElectionStatus(election.startAt, election.endAt, clock());
      if (status !== ELECTION_STATUS.ACTIVE) {
        throw conflict('Pemilihan tidak sedang berlangsung.');
      }

      const candidate = candidateRepository.findById(candidateId);
      if (!candidate || candidate.electionId !== electionId) {
        throw badRequest('Kandidat tidak terdaftar pada pemilihan ini.');
      }

      if (voteRepository.hasVoted(electionId, user.id)) {
        throw conflict(ALREADY_VOTED_MESSAGE);
      }

      try {
        voteRepository.create({ electionId, candidateId, userId: user.id });
      } catch (error) {
        if (isUniqueViolation(error)) throw conflict(ALREADY_VOTED_MESSAGE);
        throw error;
      }

      return { electionId, votedAt: clock().toISOString() };
    },

    getHistory: (userId) => voteRepository.findHistoryByUser(userId),
  };
}
