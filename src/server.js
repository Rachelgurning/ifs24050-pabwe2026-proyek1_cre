import { env } from './config/env.js';
import { createApp } from './app.js';
import { createDatabase } from './database/connection.js';
import { seedDatabase } from './database/seed.js';

const db = createDatabase(env.dbPath);
const { app, container } = createApp({ db, config: env });

if (env.seedOnStart) {
  const created = await seedDatabase({
    repositories: container.repositories,
    passwordHasher: container.passwordHasher,
    adminPassword: env.adminPassword,
  });
  if (created) console.log('Data demo dibuat (database sebelumnya kosong).');
}

const server = app.listen(env.port, () => {
  console.log(`VoteDel API berjalan di port ${env.port} (${env.nodeEnv})`);
});

function shutdown(signal) {
  console.log(`${signal} diterima, menutup server...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
