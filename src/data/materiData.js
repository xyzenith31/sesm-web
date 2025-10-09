// contoh-sesm-web/src/data/materiData.js

// Kunci (e.g., 'pai_1') harus unik untuk setiap bab
export const materiData = {
  pai_1: {
    judul: "Rukun Iman dan Rukun Islam",
    mapel: "Pendidikan Agama Islam",
    questions: [
      {
        type: 'multiple-choice',
        question: 'Ada berapa Rukun Iman dalam ajaran Islam?',
        options: ['Empat', 'Lima', 'Enam', 'Tujuh'],
        correctAnswer: 'Enam'
      },
      {
        type: 'essay',
        question: 'Sebutkan Rukun Islam yang pertama!',
        correctAnswer: 'Syahadat' // Jawaban isian bisa diperiksa secara sederhana (opsional)
      },
      {
        type: 'multiple-choice',
        question: 'Percaya kepada Malaikat termasuk dalam rukun...',
        options: ['Islam', 'Iman', 'Sholat', 'Haji'],
        correctAnswer: 'Iman'
      },
      {
        type: 'essay',
        question: 'Apa arti dari "iman"?',
      }
    ]
  },
  pai_2: {
    judul: "Kisah Nabi dan Rasul",
    mapel: "Pendidikan Agama Islam",
    questions: [
    ]
  },
  // Tambahkan data untuk mapel lain di sini, contoh:
  matematika_1: {
    judul: "Bilangan Sampai 10",
    mapel: "Matematika",
    questions: [
      {
        type: 'multiple-choice',
        question: 'Angka setelah 7 adalah...',
        options: ['6', '8', '9', '5'],
        correctAnswer: '8'
      },
    ]
  }
};