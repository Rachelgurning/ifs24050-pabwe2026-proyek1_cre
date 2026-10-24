import { assertValid, checkLength, cleanText } from './common.js';

const NIM_PATTERN = /^[A-Za-z0-9]{5,15}$/;
const PASSWORD_MAX_LENGTH = 72;

export function normalizeNim(value) {
  return cleanText(value).toUpperCase();
}

export function validateRegisterInput(body = {}) {
  const errors = {};
  const nim = normalizeNim(body.nim);
  const name = cleanText(body.name);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!NIM_PATTERN.test(nim)) {
    errors.nim = 'NIM harus 5-15 karakter berupa huruf atau angka.';
  }

  checkLength(errors, 'name', name, { label: 'Nama', min: 3, max: 100 });

  if (password.length < 8 || password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Kata sandi harus ${8}-${PASSWORD_MAX_LENGTH} karakter.`;
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Kata sandi harus mengandung huruf dan angka.';
  }

  assertValid(errors);
  return { nim, name, password };
}

export function validateLoginInput(body = {}) {
  const errors = {};
  const nim = normalizeNim(body.nim);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!nim) errors.nim = 'NIM wajib diisi.';
  if (!password) errors.password = 'Kata sandi wajib diisi.';

  assertValid(errors);
  return { nim, password };
}
