import apiClient from '../utils/apiClient';

const getProjects = () => apiClient.get('/drawing/projects');

const createProject = (data) => apiClient.post('/drawing/projects', data);

const updateProject = (id, data) => apiClient.put(`/drawing/projects/${id}`, data);

const deleteProject = (id) => apiClient.delete(`/drawing/projects/${id}`);

const DrawingService = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};

export default DrawingService;