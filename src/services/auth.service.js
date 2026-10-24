import { conflict, notFound, unauthorized } from '../utils/httpError.js';
import { validateLoginInput, validateRegisterInput } from '../validators/auth.validator.js';

const INVALID_CREDENTIALS_MESSAGE = 'NIM atau kata sandi salah.';

function toPublicUser({ id, nim, name, role }) {
  return { id, nim, name, role };
}

export function createAuthService({ userRepository, tokenService, passwordHasher }) {
  return {
    async register(body) {
      const { nim, name, password } = validateRegisterInput(body);

      if (userRepository.findByNim(nim)) {
        throw conflict('NIM sudah terdaftar.');
      }

      const passwordHash = await passwordHasher.hash(password);
      const user = userRepository.create({ nim, name, passwordHash, role: 'student' });

      return { token: tokenService.sign(user), user: toPublicUser(user) };
    },

    async login(body) {
      const { nim, password } = validateLoginInput(body);
      const user = userRepository.findByNim(nim);

      if (!user) {
        // Tetap melakukan hashing agar waktu respons tidak membocorkan keberadaan NIM.
        await passwordHasher.hash(password);
        throw unauthorized(INVALID_CREDENTIALS_MESSAGE);
      }

      const isMatch = await passwordHasher.verify(password, user.passwordHash);
      if (!isMatch) {
        throw unauthorized(INVALID_CREDENTIALS_MESSAGE);
      }

      return { token: tokenService.sign(user), user: toPublicUser(user) };
    },

    getProfile(userId) {
      const user = userRepository.findById(userId);
      if (!user) throw notFound('Pengguna tidak ditemukan.');
      return toPublicUser(user);
    },
  };
}
