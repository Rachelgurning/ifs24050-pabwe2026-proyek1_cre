import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../validators/common.js';

export function createElectionController({ electionService }) {
  return {
    list: asyncHandler((req, res) => {
      res.json({ data: electionService.list(req.user) });
    }),

    detail: asyncHandler((req, res) => {
      const id = parseId(req.params.id, 'ID pemilihan');
      res.json({ data: electionService.getDetail(id, req.user) });
    }),

    create: asyncHandler((req, res) => {
      res.status(201).json({ data: electionService.create(req.body) });
    }),

    update: asyncHandler((req, res) => {
      const id = parseId(req.params.id, 'ID pemilihan');
      res.json({ data: electionService.update(id, req.body) });
    }),

    remove: asyncHandler((req, res) => {
      electionService.remove(parseId(req.params.id, 'ID pemilihan'));
      res.status(204).end();
    }),

    results: asyncHandler((req, res) => {
      const id = parseId(req.params.id, 'ID pemilihan');
      res.json({ data: electionService.getResults(id, req.user) });
    }),
  };
}
