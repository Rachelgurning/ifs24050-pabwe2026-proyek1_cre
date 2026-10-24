import jwt from 'jsonwebtoken';
import { unauthorized } from './httpError.js';

export function createTokenService({ secret, expiresIn }) {
  return {
    sign(user) {
      return jwt.sign({ role: user.role }, secret, {
        subject: String(user.id),
        expiresIn,
      });
    },

    verify(token) {
      try {
        const payload = jwt.verify(token, secret);
        return { userId: Number(payload.sub), role: payload.role };
      } catch {
        throw unauthorized('Sesi tidak valid atau telah berakhir. Silakan masuk kembali.');
      }
    },
  };
}
