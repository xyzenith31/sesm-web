// contoh frontend/services/interactiveStoryService.js
import apiClient from '../utils/apiClient';

// --- FUNGSI UNTUK SISWA ---
const getAllStories = () => {
    return apiClient.get('/interactive-stories');
};

// [PERBAIKAN] Menggunakan nama fungsi yang benar (getStoryData)
const getStoryData = (id) => {
    // getStoryDataById di backend akan dipanggil
    return apiClient.get(`/interactive-stories/${id}`);
};

// [PERBAIKAN] Menggunakan nama fungsi yang benar (completeStory)
const completeStory = (id, endingKey) => {
    // recordCompletion di backend akan dipanggil
    return apiClient.post(`/interactive-stories/${id}/complete`, { endingKey });
};


// --- FUNGSI UNTUK GURU ---

// [PERBAIKAN BESAR] Helper untuk membuat FormData
// 'payload' adalah objek dari StoryEditorModal
const buildFormData = (payload) => {
    const formData = new FormData();

    // 1. Tambahkan data teks
    formData.append('title', payload.title);
    formData.append('synopsis', payload.synopsis);
    formData.append('category', payload.category);
    formData.append('read_time', payload.read_time);
    formData.append('total_endings', payload.total_endings);

    // 2. Tambahkan story_data (objek JSON) sebagai string
    // 'payload.story_data' adalah objek { "node_id": {...} }
    formData.append('story_data', JSON.stringify(payload.story_data));

    // 3. Tambahkan file cover (jika ada file baru)
    // 'payload.cover_image' adalah File object atau null
    if (payload.cover_image instanceof File) {
        // Nama field HARUS 'cover_image'
        formData.append('cover_image', payload.cover_image);
    }

    // 4. Tambahkan file node (jika ada file baru)
    // 'payload.node_images' adalah objek { "node_id": File }
    if (payload.node_images) {
        Object.keys(payload.node_images).forEach(nodeId => {
            const file = payload.node_images[nodeId];
            if (file instanceof File) {
                // Nama field HARUS 'node_images'
                // 'nodeId' dikirim sebagai argumen ke-3 (filename)
                // Backend (story.upload.js) akan membacanya sebagai 'originalname'
                formData.append('node_images', file, nodeId);
            }
        });
    }

    return formData;
};

// [PERBAIKAN] createStory menerima 'payload' objek
const createStory = (payload) => {
    const formData = buildFormData(payload);
    
    return apiClient.post('/admin/interactive-stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// [PERBAIKAN] updateStory menerima 'payload' objek
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
  // Siswa
  getAllStories,
  getStoryData, // Nama yang digunakan di frontend
  completeStory,
  // Guru
  createStory,
  updateStory,
  deleteStory,
  getSubmissions,
};

export default InteractiveStoryService;