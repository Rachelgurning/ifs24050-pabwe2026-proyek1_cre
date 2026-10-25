import assert from 'node:assert/strict';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { ADMIN_PASSWORD, STUDENT_PASSWORD, startTestServer } from './helpers/testServer.js';

const ACTIVE_ELECTION_ID = 1;
const CLOSED_ELECTION_ID = 2;
const UPCOMING_ELECTION_ID = 3;

describe('Voting API', () => {
  let api;
  let studentToken;
  let adminToken;

  beforeAll(async () => {
    api = await startTestServer();
    studentToken = await api.login('11S24001', STUDENT_PASSWORD);
    adminToken = await api.login('ADMIN', ADMIN_PASSWORD);
  });
  afterAll(() => api.close());

  it('menampilkan daftar pemilihan lengkap dengan status', async () => {
    const { status, body } = await api.request('/elections');
    assert.equal(status, 200);

    const statuses = Object.fromEntries(body.data.map((item) => [item.id, item.status]));
    assert.equal(statuses[ACTIVE_ELECTION_ID], 'active');
    assert.equal(statuses[CLOSED_ELECTION_ID], 'closed');
    assert.equal(statuses[UPCOMING_ELECTION_ID], 'upcoming');
  });

  it('rute publik tetap dapat diakses dengan token kedaluwarsa atau rusak', async () => {
    const { status, body } = await api.request('/elections', { token: 'token.rusak.sekali' });
    assert.equal(status, 200);
    assert.ok(body.data.every((item) => item.hasVoted === false));
  });

  it('menolak pemberian suara tanpa login', async () => {
    const { status } = await api.request(`/elections/${ACTIVE_ELECTION_ID}/votes`, {
      method: 'POST',
      body: { candidateId: 1 },
    });
    assert.equal(status, 401);
  });

  it('menolak suara pada pemilihan yang belum dibuka atau sudah ditutup', async () => {
    for (const id of [CLOSED_ELECTION_ID, UPCOMING_ELECTION_ID]) {
      const detail = await api.request(`/elections/${id}`);
      const candidateId = detail.body.data.candidates[0].id;
      const { status } = await api.request(`/elections/${id}/votes`, {
        method: 'POST',
        token: studentToken,
        body: { candidateId },
      });
      assert.equal(status, 409);
    }
  });

  it('menolak kandidat dari pemilihan lain', async () => {
    const other = await api.request(`/elections/${CLOSED_ELECTION_ID}`);
    const { status } = await api.request(`/elections/${ACTIVE_ELECTION_ID}/votes`, {
      method: 'POST',
      token: studentToken,
      body: { candidateId: other.body.data.candidates[0].id },
    });
    assert.equal(status, 400);
  });

  it('mencatat satu suara dan menolak suara kedua', async () => {
    const detail = await api.request(`/elections/${ACTIVE_ELECTION_ID}`);
    const candidateId = detail.body.data.candidates[0].id;
    const payload = { method: 'POST', token: studentToken, body: { candidateId } };

    const first = await api.request(`/elections/${ACTIVE_ELECTION_ID}/votes`, payload);
    assert.equal(first.status, 201);

    const second = await api.request(`/elections/${ACTIVE_ELECTION_ID}/votes`, payload);
    assert.equal(second.status, 409);

    const after = await api.request(`/elections/${ACTIVE_ELECTION_ID}`, { token: studentToken });
    assert.equal(after.body.data.hasVoted, true);
    assert.equal(after.body.data.totalVotes, 1);
  });

  it('riwayat suara tidak membocorkan pilihan kandidat', async () => {
    const { status, body } = await api.request('/votes/me', { token: studentToken });
    assert.equal(status, 200);
    assert.equal(body.data.length, 2);
    for (const entry of body.data) {
      assert.equal(entry.candidateId, undefined);
    }
  });

  it('hasil disembunyikan saat berlangsung, terbuka setelah ditutup, dan selalu terbuka untuk admin', async () => {
    const hidden = await api.request(`/elections/${ACTIVE_ELECTION_ID}/results`, {
      token: studentToken,
    });
    assert.equal(hidden.status, 403);

    const closed = await api.request(`/elections/${CLOSED_ELECTION_ID}/results`);
    assert.equal(closed.status, 200);
    assert.equal(closed.body.data.totalVotes, 3);
    assert.equal(closed.body.data.results[0].votes, 2);
    assert.equal(closed.body.data.results[0].isLeading, true);

    const asAdmin = await api.request(`/elections/${ACTIVE_ELECTION_ID}/results`, {
      token: adminToken,
    });
    assert.equal(asAdmin.status, 200);
  });

  it('admin tidak dapat memberikan suara', async () => {
    const { status } = await api.request(`/elections/${ACTIVE_ELECTION_ID}/votes`, {
      method: 'POST',
      token: adminToken,
      body: { candidateId: 1 },
    });
    assert.equal(status, 403);
  });
});
