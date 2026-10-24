import { env } from '../config/env.js';
import { createContainer } from '../container.js';
import { createDatabase } from './connection.js';
import { seedDatabase } from './seed.js';

const db = createDatabase(env.dbPath);
const container = createContainer({ db, config: env });

const created = await seedDatabase({
  repositories: container.repositories,
  passwordHasher: container.passwordHasher,
  adminPassword: env.adminPassword,
});

console.log(created ? 'Data demo berhasil dibuat.' : 'Database sudah berisi data, seed dilewati.');
db.close();
