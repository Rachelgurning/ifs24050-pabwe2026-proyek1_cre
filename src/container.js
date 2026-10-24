import { createAuthController } from './controllers/auth.controller.js';
import { createCandidateController } from './controllers/candidate.controller.js';
import { createElectionController } from './controllers/election.controller.js';
import { createVoteController } from './controllers/vote.controller.js';
import { createAuthMiddleware } from './middlewares/auth.middleware.js';
import { createCandidateRepository } from './repositories/candidate.repository.js';
import { createElectionRepository } from './repositories/election.repository.js';
import { createUserRepository } from './repositories/user.repository.js';
import { createVoteRepository } from './repositories/vote.repository.js';
import { createAuthService } from './services/auth.service.js';
import { createCandidateService } from './services/candidate.service.js';
import { createElectionService } from './services/election.service.js';
import { createVoteService } from './services/vote.service.js';
import { hashPassword, verifyPassword } from './utils/password.js';
import { createTokenService } from './utils/token.js';

/**
 * Composition root: satu-satunya tempat seluruh dependensi dirangkai.
 * Layer atas (controller) hanya mengenal service, service hanya mengenal repository.
 */
export function createContainer({ db, config, clock }) {
  const repositories = {
    userRepository: createUserRepository(db),
    electionRepository: createElectionRepository(db),
    candidateRepository: createCandidateRepository(db),
    voteRepository: createVoteRepository(db),
  };

  const tokenService = createTokenService({
    secret: config.jwtSecret,
    expiresIn: config.jwtExpiresIn,
  });
  const passwordHasher = { hash: hashPassword, verify: verifyPassword };

  const services = {
    authService: createAuthService({
      userRepository: repositories.userRepository,
      tokenService,
      passwordHasher,
    }),
    electionService: createElectionService({ ...repositories, clock }),
    candidateService: createCandidateService(repositories),
    voteService: createVoteService({ ...repositories, clock }),
  };

  return {
    repositories,
    services,
    passwordHasher,
    auth: createAuthMiddleware({ tokenService, userRepository: repositories.userRepository }),
    controllers: {
      authController: createAuthController(services),
      electionController: createElectionController(services),
      candidateController: createCandidateController(services),
      voteController: createVoteController(services),
    },
  };
}
