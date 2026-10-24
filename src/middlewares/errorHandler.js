import { HttpError } from '../utils/httpError.js';

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Rute ${req.method} ${req.originalUrl} tidak ditemukan.`));
}

// Express mengenali error handler dari jumlah parameter (4), sehingga `_next` wajib ada.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      error: { message: error.message, details: error.details },
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Format JSON tidak valid.' } });
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: { message: 'Ukuran permintaan terlalu besar.' } });
  }

  console.error('[UnhandledError]', error);
  return res.status(500).json({ error: { message: 'Terjadi kesalahan pada server.' } });
}
