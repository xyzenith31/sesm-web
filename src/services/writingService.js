import apiClient from '../utils/apiClient';

const getProjects = () => apiClient.get('/writing/projects');

const createProject = (data) => apiClient.post('/writing/projects', data);

const updateProject = (id, data) => apiClient.put(`/writing/projects/${id}`, data);

const deleteProject = (id) => apiClient.delete(`/writing/projects/${id}`);

const WritingService = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};

export default WritingService;