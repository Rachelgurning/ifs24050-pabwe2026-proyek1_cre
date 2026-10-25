import { Router } from 'express';
import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

function createLimiter(max) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { message: 'Terlalu banyak permintaan. Coba lagi beberapa saat lagi.' } },
  });
}

export function createApiRouter({ controllers, auth, config }) {
  const { authController, electionController, candidateController, voteController } = controllers;
  const { authenticate, optionalAuthenticate, requireRole } = auth;
  const adminOnly = [authenticate, requireRole('admin')];

  const router = Router();
  router.use(createLimiter(config.apiRateLimitMax));

  router.get('/health', (_req, res) => res.json({ data: { status: 'ok' } }));

  const authLimiter = createLimiter(config.authRateLimitMax);
  router.post('/auth/register', authLimiter, authController.register);
  router.post('/auth/login', authLimiter, authController.login);
  router.get('/auth/me', authenticate, authController.me);

  router.get('/elections', optionalAuthenticate, electionController.list);
  router.post('/elections', ...adminOnly, electionController.create);
  router.get('/elections/:id', optionalAuthenticate, electionController.detail);
  router.put('/elections/:id', ...adminOnly, electionController.update);
  router.delete('/elections/:id', ...adminOnly, electionController.remove);
  router.get('/elections/:id/results', optionalAuthenticate, electionController.results);

  router.post('/elections/:id/candidates', ...adminOnly, candidateController.add);
  router.put('/candidates/:candidateId', ...adminOnly, candidateController.update);
  router.delete('/candidates/:candidateId', ...adminOnly, candidateController.remove);

  router.post('/elections/:id/votes', authenticate, voteController.cast);
  router.get('/votes/me', authenticate, voteController.history);

  return router;
}
