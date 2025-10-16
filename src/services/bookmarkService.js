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
const gradeSubmission = (submissionId, score, answers) => apiClient.post(`/admin/bookmarks/submissions/${submissionId}/grade`, { score, answers });
const getMySubmissions = () => apiClient.get('/bookmarks/my-submissions');
// --- FUNGSI BARU UNTUK SISWA MELIHAT DETAIL NILAI ---
const getStudentSubmissionDetails = (submissionId) => apiClient.get(`/bookmarks/submissions/${submissionId}`);


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
  getStudentSubmissionDetails, // <-- Export fungsi baru
};

export default BookmarkService;