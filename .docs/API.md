# Dokumentasi API VoteDel

Semua respons sukses berbentuk `{ "data": ... }`; error berbentuk `{ "error": { "message", "details" } }`.
Autentikasi memakai header `Authorization: Bearer <token>`.

| Metode | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| POST | /api/auth/register | Publik | Body: nim, name, password |
| POST | /api/auth/login | Publik | Body: nim, password |
| GET | /api/auth/me | Login | Profil pengguna |
| GET | /api/elections | Publik | Daftar pemilihan + status (hasVoted bila login) |
| GET | /api/elections/:id | Publik | Detail + kandidat |
| GET | /api/elections/:id/results | Selesai / Admin | Perolehan suara |
| POST | /api/elections/:id/votes | Mahasiswa | Body: candidateId (satu suara per pemilihan) |
| GET | /api/votes/me | Login | Riwayat partisipasi (tanpa pilihan) |
| POST | /api/elections | Admin | title, description, startAt, endAt |
| PUT / DELETE | /api/elections/:id | Admin | Dikunci bila sudah ada suara |
| POST | /api/elections/:id/candidates | Admin | number, name, vision, mission |
| PUT / DELETE | /api/candidates/:candidateId | Admin | Dikunci bila sudah ada suara |

Kode status: 400 validasi, 401 belum login/token salah, 403 tidak berhak, 404 tidak ada, 409 konflik (mis. sudah memilih).
