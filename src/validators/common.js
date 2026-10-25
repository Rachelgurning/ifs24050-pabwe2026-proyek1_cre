import { badRequest } from '../utils/httpError.js';

export const VALIDATION_MESSAGE = 'Data yang dikirim tidak valid.';

/** Mengembalikan string yang sudah di-trim, atau string kosong bila bukan string. */
export function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/** Melempar 400 apabila objek errors berisi minimal satu pesan kesalahan. */
export function assertValid(errors) {
  if (Object.keys(errors).length > 0) {
    throw badRequest(VALIDATION_MESSAGE, errors);
  }
}

/** Memeriksa panjang teks dan mencatat pesan kesalahan pada field terkait. */
export function checkLength(errors, field, value, { label, min = 0, max }) {
  if (value.length < min) {
    errors[field] = min === 1 ? `${label} wajib diisi.` : `${label} minimal ${min} karakter.`;
  } else if (value.length > max) {
    errors[field] = `${label} maksimal ${max} karakter.`;
  }
}

/** Mengubah parameter URL menjadi ID bilangan bulat positif. */
export function parseId(value, label = 'ID') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest(`${label} tidak valid.`);
  }
  return id;
}
