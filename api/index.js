/**
 * Adaptor serverless untuk Vercel.
 *
 * Vercel tidak menjalankan server yang hidup terus-menerus (`app.listen`),
 * melainkan memanggil fungsi ini pada setiap permintaan. Karena itu aplikasi
 * Express dirakit sekali lalu dipakai ulang selama instance masih hangat.
 *
 * Catatan: filesystem Vercel hanya dapat ditulis pada /tmp dan isinya bersifat
 * sementara, sehingga data SQLite dapat hilang ketika instance diganti.
 */
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { createDatabase } from '../src/database/connection.js';
import { seedDatabase } from '../src/database/seed.js';

const SERVERLESS_DB_PATH = '/tmp/votedel.sqlite';

let cachedApp = null;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const config = { ...env, dbPath: SERVERLESS_DB_PATH, trustProxy: true };
  const db = createDatabase(config.dbPath);
  const { app, container } = createApp({ db, config });

  if (config.seedOnStart) {
    await seedDatabase({
      repositories: container.repositories,
      passwordHasher: container.passwordHasher,
      adminPassword: config.adminPassword,
    });
  }

  cachedApp = app;
  return app;
}

export default async function handler(req, res) {
  const app = await bootstrap();
  return app(req, res);
}
