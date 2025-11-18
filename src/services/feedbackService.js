import apiClient from '../utils/apiClient';

const submitFeedback = (formData) => {
  return apiClient.post('/feedback', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getMyFeedbackReports = () => {
  return apiClient.get('/feedback/my-feedback');
};

const getAllFeedbackReports = (params) => {
  return apiClient.get('/admin/feedback', { params });
};

const updateFeedbackStatus = (id, status) => {
  return apiClient.put(`/admin/feedback/${id}/status`, { status });
};

const updateFeedbackAdminNotes = (id, adminNotes) => {
  return apiClient.put(`/admin/feedback/${id}/notes`, { adminNotes });
};

const deleteFeedbackReport = (id) => {
  return apiClient.delete(`/admin/feedback/${id}`);
};

const FeedbackService = {
  submitFeedback,
  getMyFeedbackReports,
  getAllFeedbackReports,
  updateFeedbackStatus,
  updateFeedbackAdminNotes,
  deleteFeedbackReport,
};

export default FeedbackService;