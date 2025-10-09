// contoh-sesm-web/src/services/dataService.js
import apiClient from '../utils/apiClient';

// --- FUNGSI LAMA (SISWA) ---
const getSubjects = (jenjang, kelas) => {
  let url = `/subjects/${jenjang}`;
  if (jenjang && jenjang.toLowerCase() === 'sd' && kelas) {
    url += `/${kelas}`;
  }
  return apiClient.get(url);
};

const updateLevelAndClass = (levelData) => {
  return apiClient.put('/user/profile/level', levelData);
};

const updateUserProfile = (profileData) => {
  return apiClient.put('/user', profileData);
};

const getMateriDetail = (materiKey) => {
  return apiClient.get(`/materi/${materiKey}`);
};


// --- FUNGSI-FUNGSI BARU UNTUK ADMIN (GURU) ---

// Mendapatkan daftar Mapel dan Bab untuk dashboard admin berdasarkan jenjang & kelas
const getMateriForAdmin = (jenjang, kelas) => {
  // Menggunakan query params: /api/admin/materi?jenjang=SD&kelas=1
  return apiClient.get('/admin/materi', { params: { jenjang, kelas } });
};

// Mendapatkan detail soal dari satu bab (dengan kunci jawaban)
const getDetailMateriForAdmin = (materiKey) => {
    return apiClient.get(`/admin/materi/${materiKey}`);
};

// Menambah bab baru
const addChapter = (chapterData) => {
  // chapterData = { judul, mapel, jenjang, kelas }
  return apiClient.post('/admin/materi/chapters', chapterData);
};

// Menambah soal baru ke bab
const addQuestion = (materiKey, questionData) => {
  return apiClient.post(`/admin/materi/${materiKey}/questions`, questionData);
};

// Menghapus bab berdasarkan materiKey
const deleteChapter = (materiKey) => {
  return apiClient.delete(`/admin/materi/chapters/${materiKey}`);
};

// Menghapus soal berdasarkan ID soal
const deleteQuestion = (questionId) => {
  return apiClient.delete(`/admin/materi/questions/${questionId}`);
};

const getChaptersForSubject = (jenjang, kelas, subjectName) => {
    let url = `/mapel/${jenjang}`;
    if (kelas) {
        url += `/${kelas}`;
    }
    url += `/${encodeURIComponent(subjectName)}`;
    return apiClient.get(url);
};

const DataService = {
  // Siswa
  getSubjects,
  updateLevelAndClass,
  updateUserProfile,
  getMateriDetail,
  // Guru / Admin
  getMateriForAdmin,
  getDetailMateriForAdmin,
  addChapter,
  addQuestion,
  deleteChapter,
  deleteQuestion,
  getChaptersForSubject,
};

export default DataService;