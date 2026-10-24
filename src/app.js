
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createContainer } from './container.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { createApiRouter } from './routes/index.js';

const JSON_BODY_LIMIT = '10kb';

const corsOptions = {
  origin: [
    'https://ifs24050-pabwe2026-proyek1-fe.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export function createApp({ db, config, clock }) {
  const container = createContainer({ db, config, clock });
  const app = express();

  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');

  // Security headers
  app.use(helmet());

  // CORS: izinkan frontend online dan frontend lokal
  app.use(cors(corsOptions));

  // Membaca request body berbentuk JSON
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  // API routes
  app.use('/api', createApiRouter({ ...container, config }));

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, container };
}
