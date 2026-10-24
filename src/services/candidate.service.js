import { conflict, notFound } from '../utils/httpError.js';
import { validateCandidateInput } from '../validators/election.validator.js';

const DUPLICATE_NUMBER_MESSAGE = 'Nomor urut sudah digunakan kandidat lain.';

export function createCandidateService({ electionRepository, candidateRepository }) {
  function getElectionOrThrow(id) {
    const election = electionRepository.findById(id);
    if (!election) throw notFound('Pemilihan tidak ditemukan.');
    return election;
  }

  function getCandidateOrThrow(id) {
    const candidate = candidateRepository.findById(id);
    if (!candidate) throw notFound('Kandidat tidak ditemukan.');
    return candidate;
  }

  function assertNoVotes(electionId) {
    if (getElectionOrThrow(electionId).totalVotes > 0) {
      throw conflict('Kandidat tidak dapat diubah karena pemilihan sudah memiliki suara.');
    }
  }

  function assertNumberAvailable(electionId, number, ignoredCandidateId) {
    const existing = candidateRepository.findByNumber(electionId, number);
    if (existing && existing.id !== ignoredCandidateId) {
      throw conflict(DUPLICATE_NUMBER_MESSAGE);
    }
  }

  return {
    add(electionId, body) {
      assertNoVotes(electionId);
      const data = validateCandidateInput(body);
      assertNumberAvailable(electionId, data.number);

      return candidateRepository.create({ electionId, ...data });
    },

    update(candidateId, body) {
      const candidate = getCandidateOrThrow(candidateId);
      assertNoVotes(candidate.electionId);
      const data = validateCandidateInput(body);
      assertNumberAvailable(candidate.electionId, data.number, candidate.id);

      return candidateRepository.update(candidate.id, data);
    },

    remove(candidateId) {
      const candidate = getCandidateOrThrow(candidateId);
      assertNoVotes(candidate.electionId);
      candidateRepository.remove(candidate.id);
    },
  };
}
