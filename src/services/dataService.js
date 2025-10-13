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
const updateUserProfile = (profileData, avatarFile) => {
  const formData = new FormData();
  for (const key in profileData) {
    if (profileData[key] !== undefined && profileData[key] !== null) {
        formData.append(key, profileData[key]);
    }
  }
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  return apiClient.put('/user', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
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
  if (questionData.links && questionData.links.length > 0) { formData.append('links', JSON.stringify(questionData.links)); }
  if (questionData.texts && questionData.texts.length > 0) { formData.append('texts', JSON.stringify(questionData.texts)); }
  return apiClient.post(`/admin/materi/${materiKey}/questions`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
const updateQuestion = (questionId, questionData) => {
    const formData = new FormData();
    formData.append('type', questionData.type);
    formData.append('question', questionData.question);
    formData.append('correctAnswer', questionData.correctAnswer);
    formData.append('essayAnswer', questionData.essayAnswer || '');
    if (questionData.options) { formData.append('options', JSON.stringify(questionData.options)); }
    if (questionData.attachments) { formData.append('attachments', JSON.stringify(questionData.attachments)); }
    if (questionData.newMedia && questionData.newMedia.length > 0) { questionData.newMedia.forEach(file => { formData.append('media', file); }); }
    return apiClient.put(`/admin/materi/questions/${questionId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, });
};
const deleteChapter = (materiKey) => { return apiClient.delete(`/admin/materi/chapters/${materiKey}`); };
const deleteQuestion = (questionId) => { return apiClient.delete(`/admin/materi/questions/${questionId}`); };
const getChaptersForSubject = (jenjang, kelas, subjectName) => {
    let url = `/mapel/${jenjang}`;
    if (kelas) { url += `/${kelas}`; }
    url += `/${encodeURIComponent(subjectName)}`;
    return apiClient.get(url);
};

// --- FUNGSI PENGATURAN MATERI (BARU) ---
const updateChapterSettings = (chapterId, settings) => {
    return apiClient.put(`/admin/materi/chapters/${chapterId}/settings`, settings);
};

// --- FUNGSI MANAJEMEN NILAI ---
const updateGradingMode = (chapterId, mode) => { return apiClient.put(`/admin/chapters/${chapterId}/grading-mode`, { mode }); };
const getAllSubmissionsForChapter = (chapterId) => { return apiClient.get(`/admin/nilai/chapter/${chapterId}`); };
const getSubmissionDetails = (submissionId) => { return apiClient.get(`/admin/nilai/submission/${submissionId}`); };
const gradeSubmission = (submissionId, score) => { return apiClient.post(`/admin/nilai/submission/${submissionId}`, { score }); };
const overrideAnswer = (answerId, isCorrect) => { return apiClient.patch(`/admin/nilai/answer/${answerId}`, { isCorrect }); };

// --- FUNGSI MANAJEMEN KUIS & BANK SOAL ---
const getAllQuizzes = () => { return apiClient.get('/quizzes'); };
const getQuizDetailsForAdmin = (quizId) => { return apiClient.get(`/admin/quizzes/${quizId}/details`); };
const createQuiz = (formData) => { return apiClient.post('/admin/quizzes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); };
const getSubmissionsForQuiz = (quizId) => { return apiClient.get(`/admin/quizzes/${quizId}/submissions`); };
const deleteQuiz = (quizId) => { return apiClient.delete(`/admin/quizzes/${quizId}`); };
const deleteAllQuestionsFromQuiz = (quizId) => { return apiClient.delete(`/admin/quizzes/${quizId}/questions`); };
const addQuestionToQuiz = (quizId, formData) => { return apiClient.post(`/admin/quizzes/${quizId}/questions`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, }); };
const updateQuestionInQuiz = (questionId, questionData) => {
    const formData = new FormData();
    formData.append('question_text', questionData.question);
    formData.append('question_type', questionData.type);
    const formattedOptions = questionData.options.map(opt => ({ text: opt, isCorrect: opt === questionData.correctAnswer }));
    formData.append('options', JSON.stringify(formattedOptions));
    formData.append('existingMedia', JSON.stringify(questionData.media));
    return apiClient.put(`/admin/quizzes/questions/${questionId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, });
};
const deleteQuestionFromQuiz = (questionId) => { return apiClient.delete(`/admin/quizzes/questions/${questionId}`); };
const getAllQuestionsForBank = (jenjang, kelas) => { return apiClient.get('/admin/all-questions', { params: { jenjang, kelas } }); };
const addQuestionsFromBank = (quizId, questionIds) => { return apiClient.post(`/admin/quizzes/${quizId}/add-from-bank`, { questionIds }); };
const getQuizForStudent = (quizId) => { return apiClient.get(`/quizzes/${quizId}`); };
const submitQuizAnswers = (quizId, answers) => { return apiClient.post(`/quizzes/${quizId}/submit`, { answers }); };
const addQuestionsFromBankToChapter = (materiKey, questionIds) => { return apiClient.post(`/admin/materi/${materiKey}/add-from-bank`, { questionIds }); };

// --- FUNGSI POIN & LEADERBOARD ---
const getPointsSummary = () => { return apiClient.get('/points/summary'); };
const getPointsHistory = () => { return apiClient.get('/points/history'); };
const getLeaderboard = () => { return apiClient.get('/leaderboard'); };


// --- EXPORT SEMUA FUNGSI ---
const DataService = {
  getSubjects,
  updateLevelAndClass,
  updateUserProfile,
  submitAnswers,
  getDetailMateriForSiswa,
  getQuizForStudent,
  submitQuizAnswers,
  getMateriForAdmin,
  getDetailMateriForAdmin,
  addChapter,
  addQuestion,
  updateQuestion,
  deleteChapter,
  deleteQuestion,
  getChaptersForSubject,
  addQuestionsFromBankToChapter,
  updateChapterSettings, // <-- Fungsi baru diekspor di sini
  getAllQuizzes,
  getQuizDetailsForAdmin,
  createQuiz,
  getSubmissionsForQuiz,
  deleteQuiz,
  deleteAllQuestionsFromQuiz,
  addQuestionToQuiz,
  updateQuestionInQuiz,
  deleteQuestionFromQuiz,
  getAllQuestionsForBank,
  addQuestionsFromBank,
  updateGradingMode,
  getAllSubmissionsForChapter,
  getSubmissionDetails,
  gradeSubmission,
  overrideAnswer,
  getPointsSummary,
  getPointsHistory,
  getLeaderboard,
};

export default DataService;