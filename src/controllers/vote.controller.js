import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../validators/common.js';

export function createVoteController({ voteService }) {
  return {
    cast: asyncHandler((req, res) => {
      const electionId = parseId(req.params.id, 'ID pemilihan');
      res.status(201).json({ data: voteService.castVote(req.user, electionId, req.body) });
    }),

    history: asyncHandler((req, res) => {
      res.json({ data: voteService.getHistory(req.user.id) });
    }),
  };
}
