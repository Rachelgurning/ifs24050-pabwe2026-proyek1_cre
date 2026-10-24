import 'dotenv/config';

const DEV_JWT_SECRET = 'dev-only-secret-do-not-use-in-production';
const MIN_PRODUCTION_SECRET_LENGTH = 32;

const isProduction = process.env.NODE_ENV === 'production';

function readJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (isProduction && (!secret || secret.length < MIN_PRODUCTION_SECRET_LENGTH)) {
    throw new Error(
      `JWT_SECRET wajib diisi (minimal ${MIN_PRODUCTION_SECRET_LENGTH} karakter) pada mode production.`,
    );
  }

  return secret || DEV_JWT_SECRET;
}

function readList(value, fallback) {
  const source = value ?? fallback;
  return source
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction,
  port: Number(process.env.PORT) || 3000,
  jwtSecret: readJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  dbPath: process.env.DB_PATH ?? 'data/votedel.sqlite',
  corsOrigins: readList(process.env.CORS_ORIGINS, 'http://localhost:5173'),
  trustProxy: process.env.TRUST_PROXY === 'true',
  seedOnStart: process.env.SEED_ON_START !== 'false',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'Admin#12345',
  authRateLimitMax: 20,
  apiRateLimitMax: 600,
});
