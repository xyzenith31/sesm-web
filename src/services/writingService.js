// contoh-sesm-web/services/writingService.js
import apiClient from '../utils/apiClient';

// Mengambil semua proyek tulisan milik pengguna
const getProjects = () => apiClient.get('/writing/projects');

// Membuat proyek tulisan baru
const createProject = (data) => apiClient.post('/writing/projects', data);

// Memperbarui proyek tulisan yang sudah ada
const updateProject = (id, data) => apiClient.put(`/writing/projects/${id}`, data);

// Menghapus proyek tulisan
const deleteProject = (id) => apiClient.delete(`/writing/projects/${id}`);

const WritingService = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};

export default WritingService;