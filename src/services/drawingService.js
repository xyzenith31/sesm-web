// contoh-sesm-web/services/drawingService.js
import apiClient from '../utils/apiClient';

// Mengambil semua proyek gambar milik pengguna
const getProjects = () => apiClient.get('/drawing/projects');

// Membuat proyek gambar baru
const createProject = (data) => apiClient.post('/drawing/projects', data);

// Memperbarui proyek gambar yang sudah ada
const updateProject = (id, data) => apiClient.put(`/drawing/projects/${id}`, data);

// Menghapus proyek gambar
const deleteProject = (id) => apiClient.delete(`/drawing/projects/${id}`);

const DrawingService = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};

export default DrawingService;