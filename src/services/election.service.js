import { ELECTION_STATUS, computeElectionStatus } from '../utils/electionStatus.js';
import { conflict, forbidden, notFound } from '../utils/httpError.js';
import { validateElectionInput } from '../validators/election.validator.js';

const PERCENT_FACTOR = 100;

export function createElectionService({
  electionRepository,
  candidateRepository,
  voteRepository,
  clock = () => new Date(),
}) {
  function toElectionDto(election) {
    return {
      id: election.id,
      title: election.title,
      description: election.description,
      startAt: election.startAt,
      endAt: election.endAt,
      status: computeElectionStatus(election.startAt, election.endAt, clock()),
      candidateCount: election.candidateCount,
      totalVotes: election.totalVotes,
    };
  }

  function getElectionOrThrow(id) {
    const election = electionRepository.findById(id);
    if (!election) throw notFound('Pemilihan tidak ditemukan.');
    return election;
  }

  function assertNoVotes(election) {
    if (election.totalVotes > 0) {
      throw conflict('Pemilihan yang sudah memiliki suara tidak dapat diubah atau dihapus.');
    }
  }

  function buildResults(election) {
    const tally = voteRepository.tally(election.id);
    const candidates = candidateRepository.findByElection(election.id);
    const totalVotes = election.totalVotes;
    const topVotes = Math.max(0, ...tally.values());

    const results = candidates.map((candidate) => {
      const votes = tally.get(candidate.id) ?? 0;
      return {
        candidateId: candidate.id,
        number: candidate.number,
        name: candidate.name,
        votes,
        percentage: totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * PERCENT_FACTOR * 10) / 10,
        isLeading: topVotes > 0 && votes === topVotes,
      };
    });

    return { election: toElectionDto(election), totalVotes, results };
  }

  return {
    list(viewer) {
      const votedIds = viewer ? voteRepository.findVotedElectionIds(viewer.id) : new Set();

      return electionRepository.findAll().map((election) => ({
        ...toElectionDto(election),
        hasVoted: votedIds.has(election.id),
      }));
    },

    getDetail(id, viewer) {
      const election = getElectionOrThrow(id);

      return {
        ...toElectionDto(election),
        hasVoted: viewer ? voteRepository.hasVoted(id, viewer.id) : false,
        candidates: candidateRepository.findByElection(id),
      };
    },

    create(body) {
      return toElectionDto(electionRepository.create(validateElectionInput(body)));
    },

    update(id, body) {
      assertNoVotes(getElectionOrThrow(id));
      return toElectionDto(electionRepository.update(id, validateElectionInput(body)));
    },

    remove(id) {
      assertNoVotes(getElectionOrThrow(id));
      electionRepository.remove(id);
    },

    getResults(id, viewer) {
      const election = getElectionOrThrow(id);
      const status = computeElectionStatus(election.startAt, election.endAt, clock());
      const isAdmin = viewer?.role === 'admin';

      if (status !== ELECTION_STATUS.CLOSED && !isAdmin) {
        throw forbidden('Hasil pemilihan baru dapat dilihat setelah pemilihan ditutup.');
      }

      return buildResults(election);
    },
  };
}
