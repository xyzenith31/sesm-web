import apiClient from '../utils/apiClient';

// --- FUNGSI UNTUK SISWA ---
const getAllStories = () => {
    return apiClient.get('/interactive-stories');
};
const getStoryData = (id) => {
    return apiClient.get(`/interactive-stories/${id}`);
};
// [TAMBAHAN] Fungsi untuk mencatat penyelesaian cerita
const completeStory = (id, endingKey) => {
    return apiClient.post(`/interactive-stories/${id}/complete`, { endingKey });
};

// --- FUNGSI UNTUK GURU ---
const createStory = (formData) => {
    return apiClient.post('/admin/interactive-stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
const updateStory = (id, formData) => {
    return apiClient.put(`/admin/interactive-stories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
const deleteStory = (id) => {
    return apiClient.delete(`/admin/interactive-stories/${id}`);
};
// [TAMBAHAN] Fungsi untuk mengambil data pengerjaan
const getSubmissions = (id) => {
    return apiClient.get(`/admin/interactive-stories/${id}/submissions`);
};


const InteractiveStoryService = {
  // Siswa
  getAllStories,
  getStoryData,
  completeStory, // <-- Ditambahkan
  // Guru
  createStory,
  updateStory,
  deleteStory,
  getSubmissions, // <-- Ditambahkan
};

export default InteractiveStoryService;