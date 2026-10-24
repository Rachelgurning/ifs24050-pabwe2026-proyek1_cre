# ifs24050-pabwe2026-proyek1-backend

REST API **VoteDel** — sistem pemilihan suara online mahasiswa Institut Teknologi Del.
Proyek 1 matakuliah Pengembangan Aplikasi Berbasis Web (PABWE) 2026.

- Framework: **Express.js**
- Database: **SQLite** (modul bawaan `node:sqlite`, tanpa kompilasi native)
- Front-end: repository & deployment **terpisah** → `ifs24050-pabwe2026-proyek1-frontend`
- Pengujian: Vitest (uji API end-to-end dengan database in-memory)

## Menjalankan di komputer lokal

```bash
git clone <url-repo-backend>
cd ifs24050-pabwe2026-proyek1-backend
cp .env.example .env     # ganti JWT_SECRET & CORS_ORIGINS
bun install              # atau: npm install
bun run start            # http://localhost:8000
```

Database otomatis dibuat di `data/votedel.sqlite` dan diisi data demo ketika masih kosong
(`SEED_ON_START=true`). Akun demo: `ADMIN` / `Admin#12345` dan `11S24001` / `Mahasiswa#123`.

## Endpoint utama

| Method   | Endpoint                        | Akses      | Keterangan                       |
| -------- | ------------------------------- | ---------- | -------------------------------- |
| `POST`   | `/api/auth/register`            | Publik     | Registrasi mahasiswa             |
| `POST`   | `/api/auth/login`               | Publik     | Login, mengembalikan JWT         |
| `GET`    | `/api/auth/me`                  | Token      | Profil pengguna aktif            |
| `GET`    | `/api/elections`                | Publik     | Daftar pemilihan + status        |
| `POST`   | `/api/elections`                | Admin      | Buat pemilihan                   |
| `GET`    | `/api/elections/:id`            | Publik     | Detail pemilihan + kandidat      |
| `PUT`    | `/api/elections/:id`            | Admin      | Ubah pemilihan                   |
| `DELETE` | `/api/elections/:id`            | Admin      | Hapus pemilihan                  |
| `GET`    | `/api/elections/:id/results`    | Publik*    | Hasil perolehan suara            |
| `POST`   | `/api/elections/:id/candidates` | Admin      | Tambah kandidat                  |
| `PUT`    | `/api/candidates/:id`           | Admin      | Ubah kandidat                    |
| `DELETE` | `/api/candidates/:id`           | Admin      | Hapus kandidat                   |
| `POST`   | `/api/elections/:id/votes`      | Mahasiswa  | Kirim satu suara                 |
| `GET`    | `/api/votes/me`                 | Token      | Riwayat partisipasi (anonim)     |

\* hasil terbuka setelah pemilihan ditutup; admin dapat melihat kapan saja.

Format respons: `{ "data": ... }` untuk sukses dan
`{ "error": { "message": "...", "details": { ... } } }` untuk kegagalan.
Dokumentasi lengkap: `.docs/API.md`.

## Perintah

| Perintah                | Fungsi                                |
| ----------------------- | ------------------------------------- |
| `bun run start`         | Menjalankan API                       |
| `bun run dev`           | Mode watch                            |
| `bun run seed`          | Mengisi ulang data demo               |
| `bun run lint`          | ESLint                                |
| `bun run test`          | Seluruh pengujian                     |
| `bun run test:coverage` | Pengujian + laporan coverage (`lcov`) |

## Struktur proyek

```
src/
├── server.js        # Titik masuk: koneksi DB, seed, listen
├── app.js           # Perakitan Express (helmet, cors, router, error handler)
├── container.js     # Dependency injection antar lapisan
├── config/          # Pembacaan environment
├── routes/          # Definisi endpoint + rate limit
├── controllers/     # Adaptor HTTP
├── services/        # Aturan bisnis (satu suara per pemilih, jadwal, hasil)
├── repositories/    # Akses SQLite
├── middlewares/     # Autentikasi JWT & penanganan error
├── validators/      # Validasi input per field
├── utils/           # Token, hash password, status pemilihan
├── database/        # Skema, koneksi, seeder
└── tests/           # Uji API & unit (Vitest)
```

## Jaminan keamanan data

- Satu suara per pemilih dijamin `UNIQUE (election_id, user_id)` pada tabel `votes`.
- Riwayat partisipasi tidak pernah mengembalikan `candidateId` sehingga pilihan tetap rahasia.
- Password disimpan sebagai hash `scrypt` dengan salt acak.
- `JWT_SECRET` wajib diisi minimal 32 karakter pada mode production.

## CI/CD

`Jenkinsfile` menjalankan: checkout → install (bun) → test + coverage → Trivy →
SonarQube → Quality Gate → package → publish → deploy. Pipeline dan deployment
terpisah dari repository front-end.
