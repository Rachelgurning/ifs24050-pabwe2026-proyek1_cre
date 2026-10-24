import assert from 'node:assert/strict';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { ADMIN_PASSWORD, STUDENT_PASSWORD, startTestServer } from './helpers/testServer.js';

const day = 24 * 60 * 60 * 1000;
const newElection = () => ({
  title: 'Pemilihan Uji Coba',
  description: 'Dibuat oleh pengujian otomatis.',
  startAt: new Date(Date.now() + day).toISOString(),
  endAt: new Date(Date.now() + 3 * day).toISOString(),
});

describe('Admin API', () => {
  let api;
  let adminToken;
  let studentToken;

  beforeAll(async () => {
    api = await startTestServer();
    adminToken = await api.login('ADMIN', ADMIN_PASSWORD);
    studentToken = await api.login('11S24001', STUDENT_PASSWORD);
  });
  afterAll(() => api.close());

  it('menolak mahasiswa membuat pemilihan', async () => {
    const { status } = await api.request('/elections', {
      method: 'POST',
      token: studentToken,
      body: newElection(),
    });
    assert.equal(status, 403);
  });

  it('memvalidasi jadwal pemilihan', async () => {
    const { status, body } = await api.request('/elections', {
      method: 'POST',
      token: adminToken,
      body: { ...newElection(), endAt: new Date(Date.now() - day).toISOString() },
    });
    assert.equal(status, 400);
    assert.ok(body.error.details.endAt);
  });

  it('mengelola siklus pemilihan dan kandidat', async () => {
    const created = await api.request('/elections', {
      method: 'POST',
      token: adminToken,
      body: newElection(),
    });
    assert.equal(created.status, 201);
    const electionId = created.body.data.id;

    const candidate = await api.request(`/elections/${electionId}/candidates`, {
      method: 'POST',
      token: adminToken,
      body: { number: 1, name: 'Kandidat Uji', vision: 'Visi', mission: 'Misi' },
    });
    assert.equal(candidate.status, 201);

    const duplicate = await api.request(`/elections/${electionId}/candidates`, {
      method: 'POST',
      token: adminToken,
      body: { number: 1, name: 'Kandidat Kembar' },
    });
    assert.equal(duplicate.status, 409);

    const updated = await api.request(`/elections/${electionId}`, {
      method: 'PUT',
      token: adminToken,
      body: { ...newElection(), title: 'Judul Diperbarui' },
    });
    assert.equal(updated.body.data.title, 'Judul Diperbarui');

    const removed = await api.request(`/elections/${electionId}`, {
      method: 'DELETE',
      token: adminToken,
    });
    assert.equal(removed.status, 204);
  });

  it('melarang penghapusan pemilihan yang sudah memiliki suara', async () => {
    const { status } = await api.request('/elections/2', { method: 'DELETE', token: adminToken });
    assert.equal(status, 409);
  });

  it('mengembalikan 404 untuk rute dan ID yang tidak ada', async () => {
    assert.equal((await api.request('/tidak-ada')).status, 404);
    assert.equal((await api.request('/elections/9999')).status, 404);
    assert.equal((await api.request('/elections/abc')).status, 400);
  });
});
