import { assertValid, checkLength, cleanText } from './common.js';

function parseDate(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time);
}

export function validateElectionInput(body = {}) {
  const errors = {};
  const title = cleanText(body.title);
  const description = cleanText(body.description);
  const startAt = parseDate(body.startAt);
  const endAt = parseDate(body.endAt);

  checkLength(errors, 'title', title, { label: 'Judul', min: 5, max: 120 });
  checkLength(errors, 'description', description, { label: 'Deskripsi', max: 1000 });

  if (!startAt) errors.startAt = 'Waktu mulai tidak valid.';
  if (!endAt) errors.endAt = 'Waktu selesai tidak valid.';
  if (startAt && endAt && endAt <= startAt) {
    errors.endAt = 'Waktu selesai harus setelah waktu mulai.';
  }

  assertValid(errors);
  return {
    title,
    description,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
  };
}

export function validateCandidateInput(body = {}) {
  const errors = {};
  const name = cleanText(body.name);
  const vision = cleanText(body.vision);
  const mission = cleanText(body.mission);
  const number = Number(body.number);

  if (!Number.isInteger(number) || number < 1 || number > 99) {
    errors.number = 'Nomor urut harus bilangan bulat 1-99.';
  }

  checkLength(errors, 'name', name, { label: 'Nama kandidat', min: 3, max: 100 });
  checkLength(errors, 'vision', vision, { label: 'Visi', max: 500 });
  checkLength(errors, 'mission', mission, { label: 'Misi', max: 1500 });

  assertValid(errors);
  return { number, name, vision, mission };
}

export function validateVoteInput(body = {}) {
  const candidateId = Number(body.candidateId);
  const errors = {};

  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    errors.candidateId = 'Kandidat wajib dipilih.';
  }

  assertValid(errors);
  return { candidateId };
}
