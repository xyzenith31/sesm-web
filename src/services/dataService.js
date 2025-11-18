import apiClient from '../utils/apiClient';

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

const getAllUsers = () => {
  return apiClient.get('/admin/users');
};
const createUserByAdmin = (userData) => {
  return apiClient.post('/admin/users', userData);
};
const updateUserByAdmin = (userId, userData) => {
  return apiClient.put(`/admin/users/${userId}`, userData);
};
const deleteUserByAdmin = (userId) => {
  return apiClient.delete(`/admin/users/${userId}`);
};

const getMateriForAdmin = (jenjang, kelas) => { return apiClient.get('/admin/materi', { params: { jenjang, kelas } }); };
const getDetailMateriForAdmin = (materiKey) => { return apiClient.get(`/admin/materi/${materiKey}`); };
const addChapter = (chapterData) => { return apiClient.post('/admin/materi/chapters', chapterData); };
const addQuestion = (materiKey, questionData) => {
  const formData = new FormData();
   Object.keys(questionData).forEach(key => {
      if (key === 'options' || key === 'media_urls' || key === 'links' || key === 'texts' || key === 'media') { 
          if(key === 'media' && Array.isArray(questionData.media)) {
             questionData.media.forEach(file => formData.append('media', file));
          } else {
             formData.append(key, JSON.stringify(questionData[key]));
          }
      } else {
          formData.append(key, questionData[key]);
      }
  });
  return apiClient.post(`/admin/materi/${materiKey}/questions`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
const updateQuestion = (questionId, questionData) => {
    const formData = new FormData();
    if (questionData.attachments) {
        formData.append('attachments', JSON.stringify(questionData.attachments));
    }
    if (questionData.newMedia && questionData.newMedia.length > 0) {
        questionData.newMedia.forEach(file => { formData.append('media', file); });
    }
    formData.append('type', questionData.type);
    formData.append('question', questionData.question);
    formData.append('essayAnswer', questionData.essayAnswer || '');
    if (questionData.options) {
        formData.append('options', JSON.stringify(questionData.options));
        formData.append('correctAnswer', questionData.correctAnswer || '');
    }

    return apiClient.put(`/admin/materi/questions/${questionId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, });
};
const deleteChapter = (materiKey) => { return apiClient.delete(`/admin/materi/chapters/${materiKey}`); };
const deleteQuestion = (questionId) => { return apiClient.delete(`/admin/materi/questions/${questionId}`); };

const getChaptersForSubject = (jenjang, kelas, subjectName) => {
    let url = `/mapel/${jenjang}`;
    if (jenjang && jenjang.toLowerCase() === 'sd' && kelas) {
      url += `/${kelas}`;
    }
    url += `/${encodeURIComponent(subjectName)}`;
    return apiClient.get(url);
};

const addQuestionsFromBankToChapter = (materiKey, questionIds) => {
    return apiClient.post(`/admin/materi/${materiKey}/add-from-bank`, { questionIds });
};

const updateQuiz = (quizId, formData) => {
    return apiClient.put(`/admin/quizzes/${quizId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

};

const updateChapterSettings = (chapterId, settings) => {
    return apiClient.put(`/admin/materi/chapters/${chapterId}/settings`, settings);
};

const updateGradingMode = (chapterId, mode) => { return apiClient.put(`/admin/chapters/${chapterId}/grading-mode`, { mode }); };
const getAllSubmissionsForChapter = (chapterId) => { return apiClient.get(`/admin/nilai/chapter/${chapterId}`); };
const getSubmissionDetails = (submissionId) => { return apiClient.get(`/admin/nilai/submission/${submissionId}`); };

const gradeSubmission = (submissionId, score, answers) => {
  return apiClient.post(`/admin/nilai/submission/${submissionId}`, { score, answers });
};

const overrideAnswer = (answerId, isCorrect) => { return apiClient.patch(`/admin/nilai/answer/${answerId}`, { isCorrect }); };
const getAllQuizzes = () => { return apiClient.get('/quizzes'); };
const getQuizDetailsForAdmin = (quizId) => { return apiClient.get(`/admin/quizzes/${quizId}/details`); };
const createQuiz = (formData) => { return apiClient.post('/admin/quizzes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); };
const getSubmissionsForQuiz = (quizId) => { return apiClient.get(`/admin/quizzes/${quizId}/submissions`); };
const deleteQuiz = (quizId) => { return apiClient.delete(`/admin/quizzes/${quizId}`); };
const deleteAllQuestionsFromQuiz = (quizId) => { console.warn("Delete all questions functionality should be handled server-side."); return Promise.reject("Not implemented client-side"); };
const addQuestionToQuiz = (quizId, formData) => { return apiClient.post(`/admin/quizzes/${quizId}/questions`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, }); };
const updateQuestionInQuiz = (questionId, questionData) => {
    const formData = new FormData();
    formData.append('question_text', questionData.question);
    formData.append('question_type', questionData.type);

    if (questionData.options && questionData.type.includes('pilihan-ganda')) {
        const formattedOptions = questionData.options.map(opt => ({
            text: opt,
            isCorrect: opt === questionData.correctAnswer 
        }));
        formData.append('options', JSON.stringify(formattedOptions));
    }

    const existingMediaUrls = (questionData.media || []) 
                          .filter(m => m.type !== 'new-file' && m.url)
                          .map(({file, ...keepAttrs}) => keepAttrs);
    formData.append('existingMedia', JSON.stringify(existingMediaUrls));

    const newFiles = (questionData.media || []) 
                      .filter(m => m.type === 'new-file')
                      .map(m => m.file);
    newFiles.forEach(file => formData.append('mediaFiles', file)); 

    formData.append('essayAnswer', questionData.essayAnswer || ''); 

    return apiClient.put(`/admin/quizzes/questions/${questionId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteQuestionFromQuiz = (questionId) => { return apiClient.delete(`/admin/quizzes/questions/${questionId}`); };
const getAllQuestionsForBank = (jenjang, kelas) => { return apiClient.get('/admin/all-questions', { params: { jenjang, kelas } }); };
const addQuestionsFromBank = (quizId, questionIds) => { return apiClient.post(`/admin/quizzes/${quizId}/add-from-bank`, { questionIds }); };
const getQuizForStudent = (quizId) => { return apiClient.get(`/quizzes/${quizId}`); };
const submitQuizAnswers = (quizId, answers) => {
    return apiClient.post(`/quizzes/${quizId}/submit`, { answers });
};

const updateQuizSettings = (quizId, settings) => {
    return apiClient.put(`/admin/quizzes/${quizId}/settings`, settings);
};

const addQuestionsFromBankToBookmark = (bookmarkId, questionIds) => {
    return apiClient.post(`/admin/bookmarks/${bookmarkId}/add-from-bank`, { questionIds });
};

const getPointsSummary = () => { return apiClient.get('/points/summary'); };
const getPointsHistory = () => { return apiClient.get('/points/history'); };
const getLeaderboard = () => { return apiClient.get('/leaderboard'); };
const getQuizHistory = () => { return apiClient.get('/points/quiz-history'); };
const getSubjectHistory = (subjectName) => {
    return apiClient.get(`/points/subject-history/${encodeURIComponent(subjectName)}`);
};

const getDiaryEntries = () => {
    return apiClient.get('/diary');
};
const addDiaryEntry = (content) => {
    return apiClient.post('/diary', { content });
};
const updateDiaryEntry = (id, content) => {
    return apiClient.put(`/diary/${id}`, { content });
};
const deleteDiaryEntry = (id) => {
    return apiClient.delete(`/diary/${id}`);
};

const saveDraft = (draftKey, content) => {
    return apiClient.post('/drafts', { draftKey, content });
};
const getDraft = (draftKey) => {
    return apiClient.get(`/drafts/${draftKey}`);
};
const getAllDrafts = () => {
    return apiClient.get('/drafts');
};
const deleteDraft = (draftKey) => {
    return apiClient.delete(`/drafts/${draftKey}`);
};

const getStudentSubmissionDetails = (submissionId) => {
    return apiClient.get(`/materi/submission/${submissionId}`);
};
const getStudentBookmarkSubmissionDetails = (submissionId) => {
    return apiClient.get(`/bookmarks/submissions/${submissionId}`);
};

const getAgendas = (startDate, endDate) => {
    return apiClient.get('/agendas', { params: { startDate, endDate } });
};
const createAgenda = (agendaData) => {
    return apiClient.post('/agendas', agendaData);
};
const deleteAgenda = (agendaId) => {
    return apiClient.delete(`/agendas/${agendaId}`);
};

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
  getStudentSubmissionDetails,
  getStudentBookmarkSubmissionDetails,
  addQuestion,
  updateQuestion,
  deleteChapter,
  deleteQuestion,
  getChaptersForSubject,
  addQuestionsFromBankToChapter,
  updateChapterSettings,
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  updateGradingMode,
  getAllSubmissionsForChapter,
  getSubmissionDetails,
  gradeSubmission,
  overrideAnswer,
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
  updateQuizSettings,
  getPointsSummary,
  getPointsHistory,
  getLeaderboard,
  getQuizHistory,
  getSubjectHistory,
  getDiaryEntries,
  addDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  saveDraft,
  getDraft,
  getAllDrafts,
  deleteDraft,
  addQuestionsFromBankToBookmark,
  updateQuiz,
  getAgendas,
  createAgenda,
  deleteAgenda,
};

export default DataService;