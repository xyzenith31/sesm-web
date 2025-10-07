import apiClient from './index.js';

const UserService = {
  // Fungsi untuk mengirim data jenjang dan kelas ke backend
  updateLevelAndClass: (levelData) => {
    // `levelData` adalah objek, contoh: { jenjang: 'SD', kelas: 1 }
    // atau { jenjang: 'TK', kelas: null }
    return apiClient.put('/user/profile/level', levelData);
  }
};

export default UserService;