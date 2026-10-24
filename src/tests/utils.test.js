import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { ELECTION_STATUS, computeElectionStatus } from '../utils/electionStatus.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { validateElectionInput } from '../validators/election.validator.js';

describe('computeElectionStatus', () => {
  const start = '2026-01-10T00:00:00.000Z';
  const end = '2026-01-20T00:00:00.000Z';

  it('mengenali status upcoming, active, dan closed', () => {
    assert.equal(computeElectionStatus(start, end, new Date('2026-01-01T00:00:00Z')), ELECTION_STATUS.UPCOMING);
    assert.equal(computeElectionStatus(start, end, new Date('2026-01-15T00:00:00Z')), ELECTION_STATUS.ACTIVE);
    assert.equal(computeElectionStatus(start, end, new Date('2026-01-20T00:00:00Z')), ELECTION_STATUS.CLOSED);
  });
});

describe('password', () => {
  it('menghasilkan hash berbeda untuk password sama dan dapat diverifikasi', async () => {
    const [first, second] = await Promise.all([hashPassword('Rahasia123'), hashPassword('Rahasia123')]);
    assert.notEqual(first, second);
    assert.equal(await verifyPassword('Rahasia123', first), true);
    assert.equal(await verifyPassword('Salah12345', first), false);
    assert.equal(await verifyPassword('apa-saja', 'format-rusak'), false);
  });
});

describe('validateElectionInput', () => {
  it('mengubah tanggal menjadi ISO dan merapikan teks', () => {
    const result = validateElectionInput({
      title: '  Pemilihan Contoh  ',
      description: '',
      startAt: '2026-02-01T08:00:00+07:00',
      endAt: '2026-02-02T08:00:00+07:00',
    });
    assert.equal(result.title, 'Pemilihan Contoh');
    assert.equal(result.startAt, '2026-02-01T01:00:00.000Z');
  });
});
