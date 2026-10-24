import { createApp } from '../../app.js';
import { createDatabase, IN_MEMORY_DB } from '../../database/connection.js';
import { seedDatabase } from '../../database/seed.js';

export const ADMIN_PASSWORD = 'Admin#12345';
export const STUDENT_PASSWORD = 'Mahasiswa#123';

const TEST_CONFIG = Object.freeze({
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  corsOrigins: ['http://localhost:5173'],
  trustProxy: false,
  authRateLimitMax: 1000,
  apiRateLimitMax: 10000,
});

/** Menjalankan API pada port acak dengan database in-memory berisi data demo. */
export async function startTestServer() {
  const db = createDatabase(IN_MEMORY_DB);
  const { app, container } = createApp({ db, config: TEST_CONFIG });
  await seedDatabase({
    repositories: container.repositories,
    passwordHasher: container.passwordHasher,
    adminPassword: ADMIN_PASSWORD,
  });

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  async function request(path, { method = 'GET', body, token } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  }

  async function login(nim, password) {
    const { body } = await request('/auth/login', { method: 'POST', body: { nim, password } });
    return body.data.token;
  }

  return {
    request,
    login,
    close: () =>
      new Promise((resolve) => {
        server.close(() => {
          db.close();
          resolve();
        });
      }),
  };
}
