import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createContainer } from './container.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { createApiRouter } from './routes/index.js';

const JSON_BODY_LIMIT = '10kb';

/**
 * Membangun aplikasi Express tanpa menjalankan server,
 * sehingga mudah diuji dengan database in-memory.
 */
export function createApp({ db, config, clock }) {
  const container = createContainer({ db, config, clock });
  const app = express();

  if (config.trustProxy) app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.use('/api', createApiRouter({ ...container, config }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, container };
}
