const DAY_MS = 24 * 60 * 60 * 1000;
const DEMO_STUDENT_PASSWORD = 'Mahasiswa#123';

const DEMO_STUDENTS = [
  { nim: '11S24001', name: 'Rina Situmorang' },
  { nim: '11S24002', name: 'Budi Hutapea' },
  { nim: '11S24003', name: 'Clara Simanjuntak' },
];

const daysFromNow = (now, days) => new Date(now.getTime() + days * DAY_MS).toISOString();

const DEMO_ELECTIONS = [
  {
    title: 'Pemilihan Ketua BEM IT Del 2026/2027',
    description:
      'Pemilihan Ketua Badan Eksekutif Mahasiswa periode 2026/2027. Gunakan hak suara Anda untuk menentukan arah organisasi kemahasiswaan.',
    startOffsetDays: -2,
    endOffsetDays: 14,
    candidates: [
      {
        number: 1,
        name: 'Daniel Pasaribu',
        vision: 'BEM yang terbuka, kolaboratif, dan dekat dengan mahasiswa.',
        mission: 'Forum aspirasi bulanan; transparansi anggaran; kolaborasi lintas program studi.',
      },
      {
        number: 2,
        name: 'Maria Siregar',
        vision: 'Mewujudkan ekosistem kampus yang inovatif dan berprestasi.',
        mission: 'Program inkubasi proyek mahasiswa; kemitraan industri; pelatihan kepemimpinan.',
      },
      {
        number: 3,
        name: 'Samuel Napitupulu',
        vision: 'Kampus yang sejahtera, inklusif, dan peduli lingkungan.',
        mission: 'Layanan konseling sebaya; gerakan kampus hijau; dukungan mahasiswa berkebutuhan khusus.',
      },
    ],
  },
  {
    title: 'Pemilihan Ketua Himpunan Mahasiswa Informatika',
    description: 'Pemilihan ketua himpunan periode sebelumnya. Hasil sudah dapat dilihat.',
    startOffsetDays: -30,
    endOffsetDays: -16,
    candidates: [
      {
        number: 1,
        name: 'Grace Tampubolon',
        vision: 'Himpunan yang aktif berbagi ilmu.',
        mission: 'Kelas belajar bersama; seminar teknologi; mentoring angkatan.',
      },
      {
        number: 2,
        name: 'Kevin Manurung',
        vision: 'Himpunan yang produktif dan solid.',
        mission: 'Hackathon internal; kolaborasi alumni; publikasi karya mahasiswa.',
      },
    ],
    votes: [1, 1, 2],
  },
  {
    title: 'Pemilihan Ketua Majelis Perwakilan Mahasiswa',
    description: 'Pemilihan ketua MPM akan dibuka dalam waktu dekat. Pelajari profil kandidat lebih awal.',
    startOffsetDays: 20,
    endOffsetDays: 34,
    candidates: [
      {
        number: 1,
        name: 'Hotma Sihombing',
        vision: 'Lembaga legislatif mahasiswa yang berintegritas.',
        mission: 'Pengawasan kinerja terbuka; kajian kebijakan; sosialisasi aspirasi.',
      },
      {
        number: 2,
        name: 'Natalia Lumbantobing',
        vision: 'Perwakilan yang responsif dan akuntabel.',
        mission: 'Kotak aspirasi digital; laporan berkala; dengar pendapat terbuka.',
      },
    ],
  },
];

function seedStudents({ userRepository, passwordHash }) {
  return DEMO_STUDENTS.map((student) =>
    userRepository.create({ ...student, passwordHash, role: 'student' }),
  );
}

function seedElections({ electionRepository, candidateRepository, voteRepository, students, now }) {
  for (const spec of DEMO_ELECTIONS) {
    const election = electionRepository.create({
      title: spec.title,
      description: spec.description,
      startAt: daysFromNow(now, spec.startOffsetDays),
      endAt: daysFromNow(now, spec.endOffsetDays),
    });

    const candidates = spec.candidates.map((candidate) =>
      candidateRepository.create({ electionId: election.id, ...candidate }),
    );

    (spec.votes ?? []).forEach((candidateNumber, index) => {
      const candidate = candidates.find((item) => item.number === candidateNumber);
      voteRepository.create({
        electionId: election.id,
        candidateId: candidate.id,
        userId: students[index].id,
      });
    });
  }
}

/**
 * Mengisi data demo (admin, mahasiswa, pemilihan) hanya jika tabel pengguna masih kosong.
 * @returns {Promise<boolean>} true bila data demo baru saja dibuat.
 */
export async function seedDatabase({ repositories, passwordHasher, adminPassword, now = new Date() }) {
  const { userRepository, electionRepository, candidateRepository, voteRepository } = repositories;
  if (userRepository.count() > 0) return false;

  userRepository.create({
    nim: 'ADMIN',
    name: 'Administrator VoteDel',
    passwordHash: await passwordHasher.hash(adminPassword),
    role: 'admin',
  });

  const students = seedStudents({
    userRepository,
    passwordHash: await passwordHasher.hash(DEMO_STUDENT_PASSWORD),
  });

  seedElections({ electionRepository, candidateRepository, voteRepository, students, now });
  return true;
}
