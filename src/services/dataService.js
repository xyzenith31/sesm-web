import apiClient from '../utils/apiClient';

// --- FUNGSI LAMA (TIDAK BERUBAH) ---
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

// (UNTUK SISWA)
const getMateriDetail = (materiKey) => {
  return apiClient.get(`/materi/${materiKey}`);
};

// --- FUNGSI-FUNGSI BARU UNTUK ADMIN ---

// (UNTUK GURU) - Mendapatkan semua daftar bab materi
const getAllMateriForAdmin = () => {
  return apiClient.get('/admin/materi');
};

// (UNTUK GURU) - Menambah soal baru
const addQuestion = (materiKey, questionData) => {
  return apiClient.post(`/admin/materi/${materiKey}/questions`, questionData);
};

// (UNTUK GURU) - Mengupdate soal
const updateQuestion = (materiKey, questionId, questionData) => {
  return apiClient.put(`/admin/materi/${materiKey}/questions/${questionId}`, questionData);
};

// (UNTUK GURU) - Menghapus soal
const deleteQuestion = (materiKey, questionId) => {
  return apiClient.delete(`/admin/materi/${materiKey}/questions/${questionId}`);
};


const DataService = {
  getSubjects,
  updateLevelAndClass,
  updateUserProfile,
  getMateriDetail,
  // --- Daftarkan fungsi baru ---
  getAllMateriForAdmin,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};

export default DataService;