// contoh-sesm-web/services/feedbackService.js
import apiClient from '../utils/apiClient';

/**
 * Mengirimkan laporan feedback (bug, fitur, saran, kendala) ke server.
 * @param {FormData} formData - Data laporan dalam format FormData.
 * @returns {Promise<Object>} Respons dari API.
 */
const submitFeedback = (formData) => {
  return apiClient.post('/feedback', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * ✅ BARU: Mengambil riwayat laporan feedback milik user yang login.
 * @returns {Promise<Object>} Daftar laporan milik user.
 */
const getMyFeedbackReports = () => {
  return apiClient.get('/feedback/my-feedback');
};

/**
 * Mengambil semua laporan feedback untuk admin/guru.
 * @param {Object} params - Parameter query (page, limit, sortBy, sortDir, status, type).
 * @returns {Promise<Object>} Daftar laporan dan info pagination.
 */
const getAllFeedbackReports = (params) => {
  return apiClient.get('/admin/feedback', { params });
};

/**
 * Memperbarui status laporan feedback oleh admin/guru.
 * @param {number|string} id - ID laporan.
 * @param {string} status - Status baru ('baru', 'dilihat', 'diproses', 'selesai', 'ditolak').
 * @returns {Promise<Object>} Respons dari API.
 */
const updateFeedbackStatus = (id, status) => {
  return apiClient.put(`/admin/feedback/${id}/status`, { status });
};

/**
 * Memperbarui catatan admin pada laporan feedback.
 * @param {number|string} id - ID laporan.
 * @param {string} adminNotes - Catatan baru dari admin.
 * @returns {Promise<Object>} Respons dari API.
 */
const updateFeedbackAdminNotes = (id, adminNotes) => {
  return apiClient.put(`/admin/feedback/${id}/notes`, { adminNotes });
};

/**
 * Menghapus laporan feedback oleh admin/guru.
 * @param {number|string} id - ID laporan.
 * @returns {Promise<Object>} Respons dari API.
 */
const deleteFeedbackReport = (id) => {
  return apiClient.delete(`/admin/feedback/${id}`);
};

const FeedbackService = {
  submitFeedback,
  getMyFeedbackReports, // ✅ Tambahkan fungsi baru
  getAllFeedbackReports,
  updateFeedbackStatus,
  updateFeedbackAdminNotes,
  deleteFeedbackReport,
};

export default FeedbackService;