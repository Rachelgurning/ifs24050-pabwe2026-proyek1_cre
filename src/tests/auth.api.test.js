import assert from 'node:assert/strict';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { ADMIN_PASSWORD, startTestServer } from './helpers/testServer.js';

describe('Auth API', () => {
  let api;

  beforeAll(async () => {
    api = await startTestServer();
  });
  afterAll(() => api.close());

  it('mendaftarkan mahasiswa baru dan mengembalikan token', async () => {
    const { status, body } = await api.request('/auth/register', {
      method: 'POST',
      body: { nim: '11s24050', name: 'Mahasiswa Uji', password: 'Rahasia123' },
    });

    assert.equal(status, 201);
    assert.equal(body.data.user.nim, '11S24050');
    assert.equal(body.data.user.role, 'student');
    assert.ok(body.data.token);
    assert.equal(body.data.user.passwordHash, undefined);
  });

  it('menolak NIM yang sudah terdaftar', async () => {
    const { status } = await api.request('/auth/register', {
      method: 'POST',
      body: { nim: '11S24001', name: 'Duplikat', password: 'Rahasia123' },
    });
    assert.equal(status, 409);
  });

  it('menolak data registrasi tidak valid dengan detail per field', async () => {
    const { status, body } = await api.request('/auth/register', {
      method: 'POST',
      body: { nim: '1', name: 'A', password: 'pendek' },
    });

    assert.equal(status, 400);
    assert.ok(body.error.details.nim);
    assert.ok(body.error.details.name);
    assert.ok(body.error.details.password);
  });

  it('login berhasil untuk admin dan gagal untuk password salah', async () => {
    const ok = await api.request('/auth/login', {
      method: 'POST',
      body: { nim: 'admin', password: ADMIN_PASSWORD },
    });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.user.role, 'admin');

    const wrong = await api.request('/auth/login', {
      method: 'POST',
      body: { nim: 'admin', password: 'salah-total' },
    });
    assert.equal(wrong.status, 401);
  });

  it('endpoint /auth/me memerlukan token', async () => {
    assert.equal((await api.request('/auth/me')).status, 401);

    const token = await api.login('11S24001', 'Mahasiswa#123');
    const { status, body } = await api.request('/auth/me', { token });
    assert.equal(status, 200);
    assert.equal(body.data.nim, '11S24001');
  });
});
