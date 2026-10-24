# VoteDel — Backend (Express + SQLite)

Repo backend terpisah untuk REST API VoteDel. Menyimpan akun, kandidat, pemilihan, dan suara ke SQLite.

## Menjalankan lokal

1. Gunakan **Node.js 22.13 atau lebih baru** karena backend memakai `node:sqlite`.
2. `npm install`
3. Salin `.env.example` menjadi `.env`.
4. Atur `JWT_SECRET` menjadi string acak minimal 32 karakter. Untuk development, `.env.example` memiliki placeholder yang perlu diganti.
5. `npm run dev`

API lokal berjalan di `http://localhost:3000`; endpoint API berada di `/api`. Database default berada di `data/votedel.sqlite` dan seed demo berjalan otomatis saat database kosong.

## Uji

- `npm test`
- `npm run lint`

## Deploy backend

Deploy repo ini sebagai **Node.js Web Service** pada host yang mendukung Node.js 22.13+ dan persistent disk/volume. SQLite harus berada pada disk persisten agar data tidak hilang saat instance restart/redeploy.

Environment variables yang harus disetel pada host:

- `NODE_ENV=production`
- `JWT_SECRET=` string acak rahasia minimal 32 karakter
- `PORT` biasanya disediakan otomatis oleh platform
- `DB_PATH=/var/data/votedel.sqlite` jika volume persisten dipasang di `/var/data`
- `CORS_ORIGINS=https://ifs24050-pabwe2026-proyek1.vercel.app` (tambahkan origin frontend yang benar, tanpa slash di akhir)
- `TRUST_PROXY=true` bila host berjalan di belakang reverse proxy
- `SEED_ON_START=true` hanya jika ingin seed demo ketika database kosong
- `ADMIN_PASSWORD=` ganti dengan kata sandi admin yang kuat sebelum deploy

Start command: `npm start`.

Setelah deploy, uji `https://URL-BACKEND/api/health` jika route health tersedia, atau buka `https://URL-BACKEND/api` untuk memastikan server merespons. Lalu masukkan `https://URL-BACKEND/api` sebagai `VITE_API_URL` pada Vercel frontend dan redeploy frontend.

## Penting

Jangan deploy backend SQLite ke fungsi serverless tanpa disk persisten. Sistem file lokal serverless umumnya tidak cocok untuk menyimpan data aplikasi secara permanen. Jangan commit `.env` atau mengirim nilai `JWT_SECRET` ke orang lain.
