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

const addQuestion = (materiKey, questionData) => {
  return apiClient.post(`/admin/materi/${materiKey}/questions`, questionData);
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