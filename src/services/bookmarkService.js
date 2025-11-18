import apiClient from '../utils/apiClient';

const getAllBookmarks = () => apiClient.get('/bookmarks');
const createBookmark = (formData) => apiClient.post('/admin/bookmarks', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

const updateBookmark = (bookmarkId, data) => {
    return apiClient.put(`/admin/bookmarks/${bookmarkId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' } 
    });
};

const deleteBookmark = (bookmarkId) => apiClient.delete(`/admin/bookmarks/${bookmarkId}`);
const submitAnswers = (bookmarkId, answers) => apiClient.post(`/bookmarks/${bookmarkId}/submit`, { answers });
const getSubmissions = (bookmarkId) => apiClient.get(`/admin/bookmarks/${bookmarkId}/submissions`);
const getSubmissionDetails = (submissionId) => apiClient.get(`/admin/bookmarks/submissions/${submissionId}`);
const gradeSubmission = (submissionId, score, answers) => {
    return apiClient.post(`/admin/bookmarks/submissions/${submissionId}/grade`, { score, answers });
};

const getMySubmissions = () => apiClient.get('/bookmarks/my-submissions');
const getStudentSubmissionDetails = (submissionId) => apiClient.get(`/bookmarks/submissions/${submissionId}`);

const addQuestionsFromBankToBookmark = (bookmarkId, questionIds) => {
    return apiClient.post(`/admin/bookmarks/${bookmarkId}/add-from-bank`, { questionIds });
};


const BookmarkService = {
  getAllBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  submitAnswers,
  getSubmissions,
  getSubmissionDetails,
  gradeSubmission,
  getMySubmissions,
  getStudentSubmissionDetails,
  addQuestionsFromBankToBookmark,
};

export default BookmarkService;