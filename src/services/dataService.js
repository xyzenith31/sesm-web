// contoh-sesm-web/services/dataService.js
import apiClient from '../utils/apiClient';

// --- FUNGSI SISWA ---
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

const getDetailMateriForSiswa = (materiKey) => {
  return apiClient.get(`/materi/${materiKey}`);
};

const submitAnswers = (materiKey, answers) => {
  return apiClient.post(`/materi/${materiKey}/submit`, { answers });
};

// --- FUNGSI GURU / ADMIN ---

const getMateriForAdmin = (jenjang, kelas) => {
  return apiClient.get('/admin/materi', { params: { jenjang, kelas } });
};

const getDetailMateriForAdmin = (materiKey) => {
    return apiClient.get(`/admin/materi/${materiKey}`);
};

const addChapter = (chapterData) => {
  return apiClient.post('/admin/materi/chapters', chapterData);
};

// --- PERBAIKI FUNGSI INI ---
const addQuestion = (materiKey, questionData) => {
  // 1. Buat objek FormData baru
  const formData = new FormData();

  // 2. Tambahkan semua data teks ke formData
  formData.append('type', questionData.type);
  formData.append('question', questionData.question);
  formData.append('correctAnswer', questionData.correctAnswer);
  formData.append('essayAnswer', questionData.essayAnswer || '');
  
  // Opsi adalah array, jadi kita stringify sebelum dikirim
  if (questionData.options) {
    formData.append('options', JSON.stringify(questionData.options));
  }

  // 3. Tambahkan setiap file media ke formData dengan key 'media'
  if (questionData.media && questionData.media.length > 0) {
    questionData.media.forEach(file => {
      formData.append('media', file); // 'media' harus sama dengan nama di upload.array()
    });
  }

  // 4. Kirim formData. Axios akan otomatis mengatur header menjadi 'multipart/form-data'
  // Perhatikan kita tidak lagi mengirim JSON biasa, tapi objek formData
  return apiClient.post(`/admin/materi/${materiKey}/questions`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


const deleteChapter = (materiKey) => {
  return apiClient.delete(`/admin/materi/chapters/${materiKey}`);
};

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

// --- FUNGSI MANAJEMEN NILAI ---
const updateGradingMode = (chapterId, mode) => {
  return apiClient.put(`/admin/chapters/${chapterId}/grading-mode`, { mode });
};

const getAllSubmissionsForChapter = (chapterId) => {
  return apiClient.get(`/admin/nilai/chapter/${chapterId}`);
};

const getSubmissionDetails = (submissionId) => {
    return apiClient.get(`/admin/nilai/submission/${submissionId}`);
};

const gradeSubmission = (submissionId, score) => {
  return apiClient.post(`/admin/nilai/submission/${submissionId}`, { score });
};

const overrideAnswer = (answerId, isCorrect) => {
  return apiClient.patch(`/admin/nilai/answer/${answerId}`, { isCorrect });
};

// --- EXPORT SEMUA FUNGSI ---
const DataService = {
  // Siswa
  getSubjects,
  updateLevelAndClass,
  updateUserProfile,
  submitAnswers,
  getDetailMateriForSiswa,
  
  // Guru / Admin
  getMateriForAdmin,
  getDetailMateriForAdmin,
  addChapter,
  addQuestion,
  deleteChapter,
  deleteQuestion,
  getChaptersForSubject,

  // Penilaian
  updateGradingMode,
  getAllSubmissionsForChapter,
  getSubmissionDetails,
  gradeSubmission,
  overrideAnswer,
};

export default DataService;