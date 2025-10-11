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
const updateLevelAndClass = (levelData) => { return apiClient.put('/user/profile/level', levelData); };
const updateUserProfile = (profileData) => { return apiClient.put('/user', profileData); };
const getDetailMateriForSiswa = (materiKey) => { return apiClient.get(`/materi/${materiKey}`); };
const submitAnswers = (materiKey, answers) => { return apiClient.post(`/materi/${materiKey}/submit`, { answers }); };

// --- FUNGSI GURU / ADMIN ---
const getMateriForAdmin = (jenjang, kelas) => { return apiClient.get('/admin/materi', { params: { jenjang, kelas } }); };
const getDetailMateriForAdmin = (materiKey) => { return apiClient.get(`/admin/materi/${materiKey}`); };
const addChapter = (chapterData) => { return apiClient.post('/admin/materi/chapters', chapterData); };
const addQuestion = (materiKey, questionData) => {
  const formData = new FormData();
  formData.append('type', questionData.type);
  formData.append('question', questionData.question);
  formData.append('correctAnswer', questionData.correctAnswer);
  formData.append('essayAnswer', questionData.essayAnswer || '');
  if (questionData.options) { formData.append('options', JSON.stringify(questionData.options)); }
  if (questionData.media && questionData.media.length > 0) { questionData.media.forEach(file => { formData.append('media', file); }); }
  return apiClient.post(`/admin/materi/${materiKey}/questions`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
const deleteChapter = (materiKey) => { return apiClient.delete(`/admin/materi/chapters/${materiKey}`); };
const deleteQuestion = (questionId) => { return apiClient.delete(`/admin/materi/questions/${questionId}`); };
const getChaptersForSubject = (jenjang, kelas, subjectName) => {
    let url = `/mapel/${jenjang}`;
    if (kelas) { url += `/${kelas}`; }
    url += `/${encodeURIComponent(subjectName)}`;
    return apiClient.get(url);
};

// --- FUNGSI MANAJEMEN NILAI ---
const updateGradingMode = (chapterId, mode) => { return apiClient.put(`/admin/chapters/${chapterId}/grading-mode`, { mode }); };
const getAllSubmissionsForChapter = (chapterId) => { return apiClient.get(`/admin/nilai/chapter/${chapterId}`); };
const getSubmissionDetails = (submissionId) => { return apiClient.get(`/admin/nilai/submission/${submissionId}`); };
const gradeSubmission = (submissionId, score) => { return apiClient.post(`/admin/nilai/submission/${submissionId}`, { score }); };
const overrideAnswer = (answerId, isCorrect) => { return apiClient.patch(`/admin/nilai/answer/${answerId}`, { isCorrect }); };


// --- FUNGSI MANAJEMEN KUIS & BANK SOAL ---

// === FUNGSI UMUM ===
const getAllQuizzes = () => {
    return apiClient.get('/quizzes');
};

// === FUNGSI KHUSUS GURU / ADMIN ===
const getQuizDetailsForAdmin = (quizId) => {
    return apiClient.get(`/admin/quizzes/${quizId}/details`);
};

const createQuiz = (formData) => {
  return apiClient.post('/admin/quizzes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getSubmissionsForQuiz = (quizId) => {
    return apiClient.get(`/admin/quizzes/${quizId}/submissions`);
};

const deleteQuiz = (quizId) => {
  return apiClient.delete(`/admin/quizzes/${quizId}`);
};

const addQuestionToQuiz = (quizId, formData) => {
  return apiClient.post(`/admin/quizzes/${quizId}/questions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteQuestionFromQuiz = (questionId) => {
    return apiClient.delete(`/admin/quizzes/questions/${questionId}`);
};

// --- ▼▼▼ FUNGSI BARU UNTUK BANK SOAL ▼▼▼ ---
const getAllQuestionsForBank = (jenjang, kelas) => {
    return apiClient.get('/admin/all-questions', { params: { jenjang, kelas } });
};

const addQuestionsFromBank = (quizId, questionIds) => {
    return apiClient.post(`/admin/quizzes/${quizId}/add-from-bank`, { questionIds });
};
// --- ▲▲▲ BATAS FUNGSI BARU ▲▲▲ ---


// === FUNGSI KHUSUS SISWA ===
const getQuizForStudent = (quizId) => {
    return apiClient.get(`/quizzes/${quizId}`);
};

const submitQuizAnswers = (quizId, answers) => {
    return apiClient.post(`/quizzes/${quizId}/submit`, { answers });
};


// --- EXPORT SEMUA FUNGSI ---
const DataService = {
  // Siswa
  getSubjects,
  updateLevelAndClass,
  updateUserProfile,
  submitAnswers,
  getDetailMateriForSiswa,
  getQuizForStudent,
  submitQuizAnswers,
  
  // Guru / Admin
  getMateriForAdmin,
  getDetailMateriForAdmin,
  addChapter,
  addQuestion,
  deleteChapter,
  deleteQuestion,
  getChaptersForSubject,
  getAllQuizzes,
  getQuizDetailsForAdmin,
  createQuiz,
  getSubmissionsForQuiz,
  deleteQuiz,
  addQuestionToQuiz,
  deleteQuestionFromQuiz,
  // Bank Soal
  getAllQuestionsForBank,
  addQuestionsFromBank,

  // Penilaian
  updateGradingMode,
  getAllSubmissionsForChapter,
  getSubmissionDetails,
  gradeSubmission,
  overrideAnswer,
};

export default DataService;