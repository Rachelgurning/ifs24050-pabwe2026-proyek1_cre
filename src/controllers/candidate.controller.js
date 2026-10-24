import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../validators/common.js';

export function createCandidateController({ candidateService }) {
  return {
    add: asyncHandler((req, res) => {
      const electionId = parseId(req.params.id, 'ID pemilihan');
      res.status(201).json({ data: candidateService.add(electionId, req.body) });
    }),

    update: asyncHandler((req, res) => {
      const candidateId = parseId(req.params.candidateId, 'ID kandidat');
      res.json({ data: candidateService.update(candidateId, req.body) });
    }),

    remove: asyncHandler((req, res) => {
      candidateService.remove(parseId(req.params.candidateId, 'ID kandidat'));
      res.status(204).end();
    }),
  };
}
