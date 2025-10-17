// contoh-sesm-web/services/bookmarkService.js
import apiClient from '../utils/apiClient';

const getAllBookmarks = () => apiClient.get('/bookmarks');
const createBookmark = (formData) => apiClient.post('/admin/bookmarks', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
const updateBookmark = (bookmarkId, data) => apiClient.put(`/admin/bookmarks/${bookmarkId}`, data);
const deleteBookmark = (bookmarkId) => apiClient.delete(`/admin/bookmarks/${bookmarkId}`);

// --- FUNGSI UNTUK NILAI ---
const submitAnswers = (bookmarkId, answers) => apiClient.post(`/bookmarks/${bookmarkId}/submit`, { answers });
const getSubmissions = (bookmarkId) => apiClient.get(`/admin/bookmarks/${bookmarkId}/submissions`);
const getSubmissionDetails = (submissionId) => apiClient.get(`/admin/bookmarks/submissions/${submissionId}`);

// --- FUNGSI YANG DIPERBARUI ---
const gradeSubmission = (submissionId, score, answers) => {
    return apiClient.post(`/admin/bookmarks/submissions/${submissionId}/grade`, { score, answers });
};

const getMySubmissions = () => apiClient.get('/bookmarks/my-submissions');
const getStudentSubmissionDetails = (submissionId) => apiClient.get(`/bookmarks/submissions/${submissionId}`);


const BookmarkService = {
  getAllBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  submitAnswers,
  getSubmissions,
  getSubmissionDetails,
  gradeSubmission, // Pastikan ini yang terbaru
  getMySubmissions,
  getStudentSubmissionDetails,
};

export default BookmarkService;