import apiClient from '../utils/apiClient';

const getAllStories = () => {
    return apiClient.get('/interactive-stories');
};

const getStoryData = (id) => {
    return apiClient.get(`/interactive-stories/${id}`);
};

const completeStory = (id, endingKey) => {
    return apiClient.post(`/interactive-stories/${id}/complete`, { endingKey });
};

const buildFormData = (payload) => {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('synopsis', payload.synopsis);
    formData.append('category', payload.category);
    formData.append('read_time', payload.read_time);
    formData.append('total_endings', payload.total_endings);

    formData.append('story_data', JSON.stringify(payload.story_data));

    if (payload.cover_image instanceof File) {
        formData.append('cover_image', payload.cover_image);
    }

    if (payload.node_images) {
        Object.keys(payload.node_images).forEach(nodeId => {
            const file = payload.node_images[nodeId];
            if (file instanceof File) {
                formData.append('node_images', file, nodeId);
            }
        });
    }

    return formData;
};

const createStory = (payload) => {
    const formData = buildFormData(payload);
    
    return apiClient.post('/admin/interactive-stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const updateStory = (id, payload) => {
    const formData = buildFormData(payload);
    
    return apiClient.put(`/admin/interactive-stories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteStory = (id) => {
    return apiClient.delete(`/admin/interactive-stories/${id}`);
};

const getSubmissions = (id) => {
    return apiClient.get(`/admin/interactive-stories/${id}/submissions`);
};


const InteractiveStoryService = {
  getAllStories,
  getStoryData,
  completeStory,
  createStory,
  updateStory,
  deleteStory,
  getSubmissions,
};

export default InteractiveStoryService;