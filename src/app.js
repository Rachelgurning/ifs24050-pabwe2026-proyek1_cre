import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createContainer } from './container.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { createApiRouter } from './routes/index.js';

const JSON_BODY_LIMIT = '10kb';

// Origin yang selalu diizinkan: frontend produksi (Vercel) dan frontend lokal.
// Origin tambahan dapat diatur lewat environment variable CORS_ORIGINS (pisahkan dengan koma).
const DEFAULT_ORIGINS = [
  'https://ifs24050-pabwe2026-proyek1-fe.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

export function createApp({ db, config, clock }) {
  const container = createContainer({ db, config, clock });
  const app = express();

  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');

  // Security headers
  app.use(helmet());

  // CORS: frontend default + origin dari CORS_ORIGINS
  app.use(
    cors({
      origin: [...new Set([...DEFAULT_ORIGINS, ...(config.corsOrigins ?? [])])],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Membaca request body berbentuk JSON
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  // API routes
  app.use('/api', createApiRouter({ ...container, config }));

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, container };
}
