import { forbidden, unauthorized } from '../utils/httpError.js';

const BEARER_PREFIX = 'Bearer ';

function extractToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) return null;
  return header.slice(BEARER_PREFIX.length).trim() || null;
}

export function createAuthMiddleware({ tokenService, userRepository }) {
  function resolveUser(token) {
    const { userId } = tokenService.verify(token);
    const user = userRepository.findById(userId);
    if (!user) throw unauthorized('Akun tidak ditemukan.');
    return { id: user.id, nim: user.nim, name: user.name, role: user.role };
  }

  return {
    /** Wajib login: menolak permintaan tanpa token yang valid. */
    authenticate(req, _res, next) {
      try {
        const token = extractToken(req);
        if (!token) throw unauthorized();
        req.user = resolveUser(token);
        next();
      } catch (error) {
        next(error);
      }
    },

    /**
     * Login opsional: mengisi req.user bila token valid. Token yang kedaluwarsa atau rusak
     * diperlakukan sebagai tamu agar rute publik tetap dapat diakses.
     */
    optionalAuthenticate(req, _res, next) {
      try {
        const token = extractToken(req);
        if (token) req.user = resolveUser(token);
      } catch {
        req.user = undefined;
      }
      next();
    },

    requireRole: (...roles) => (req, _res, next) => {
      if (!roles.includes(req.user?.role)) {
        return next(forbidden());
      }
      return next();
    },
  };
}
