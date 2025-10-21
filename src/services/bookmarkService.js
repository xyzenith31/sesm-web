// contoh-sesm-web/services/bookmarkService.js
import apiClient from '../utils/apiClient';

const getAllBookmarks = () => apiClient.get('/bookmarks');
const createBookmark = (formData) => apiClient.post('/admin/bookmarks', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// --- MODIFIED FUNCTION ---
const updateBookmark = (bookmarkId, data) => {
    // Note: data should be FormData when files are involved
    return apiClient.put(`/admin/bookmarks/${bookmarkId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' } // Add this header
    });
};
// --- END OF MODIFIED FUNCTION ---

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

// --- Fungsi baru untuk menambahkan soal dari bank ---
const addQuestionsFromBankToBookmark = (bookmarkId, questionIds) => {
    return apiClient.post(`/admin/bookmarks/${bookmarkId}/add-from-bank`, { questionIds });
};


const BookmarkService = {
  getAllBookmarks,
  createBookmark,
  updateBookmark, // Pastikan ini yang terbaru
  deleteBookmark,
  submitAnswers,
  getSubmissions,
  getSubmissionDetails,
  gradeSubmission,
  getMySubmissions,
  getStudentSubmissionDetails,
  addQuestionsFromBankToBookmark // Export fungsi baru
};

export default BookmarkService;