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

const deleteAllQuestionsFromQuiz = (quizId) => {
    return apiClient.delete(`/admin/quizzes/${quizId}/questions`);
};

const addQuestionToQuiz = (quizId, formData) => {
  return apiClient.post(`/admin/quizzes/${quizId}/questions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// --- ▼▼▼ FUNGSI BARU UNTUK EDIT & HAPUS SOAL SPESIFIK DI KUIS ▼▼▼ ---
const updateQuestionInQuiz = (questionId, questionData) => {
    const formData = new FormData();
    formData.append('question_text', questionData.question);
    formData.append('question_type', questionData.type);
    
    const formattedOptions = questionData.options.map(opt => ({
        text: opt,
        isCorrect: opt === questionData.correctAnswer
    }));
    formData.append('options', JSON.stringify(formattedOptions));

    // Kirim media yang sudah ada untuk disimpan kembali oleh backend
    formData.append('existingMedia', JSON.stringify(questionData.media));

    // Di sini kita tidak mengirim file baru, karena logic edit hanya untuk teks
    // Jika ingin ada fitur ganti file, logic-nya harus ditambahkan di sini

    return apiClient.put(`/admin/quizzes/questions/${questionId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteQuestionFromQuiz = (questionId) => {
    return apiClient.delete(`/admin/quizzes/questions/${questionId}`);
};
// --- ▲▲▲ BATAS FUNGSI BARU ▲▲▲ ---

// Bank Soal
const getAllQuestionsForBank = (jenjang, kelas) => {
    return apiClient.get('/admin/all-questions', { params: { jenjang, kelas } });
};

const addQuestionsFromBank = (quizId, questionIds) => {
    return apiClient.post(`/admin/quizzes/${quizId}/add-from-bank`, { questionIds });
};


// === FUNGSI KHUSUS SISWA ===
const getQuizForStudent = (quizId) => {
    return apiClient.get(`/quizzes/${quizId}`);
};

const submitQuizAnswers = (quizId, answers) => {
    return apiClient.post(`/quizzes/${quizId}/submit`, { answers });
};

// --- FUNGSI BARU UNTUK MENAMBAHKAN SOAL DARI BANK KE MATERI ---
const addQuestionsFromBankToChapter = (materiKey, questionIds) => {
    return apiClient.post(`/admin/materi/${materiKey}/add-from-bank`, { questionIds });
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
  
  // Guru / Admin Materi
  getMateriForAdmin,
  getDetailMateriForAdmin,
  addChapter,
  addQuestion,
  deleteChapter,
  deleteQuestion,
  getChaptersForSubject,
  addQuestionsFromBankToChapter,
  
  // Guru / Admin Kuis
  getAllQuizzes,
  getQuizDetailsForAdmin,
  createQuiz,
  getSubmissionsForQuiz,
  deleteQuiz,
  deleteAllQuestionsFromQuiz,
  addQuestionToQuiz,
  updateQuestionInQuiz, // <-- Export fungsi edit
  deleteQuestionFromQuiz, // <-- Export fungsi hapus
  
  // Guru / Admin Bank Soal
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