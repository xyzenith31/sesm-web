import apiClient from './index.js';

const UserService = {
  updateLevelAndClass: (levelData) => {
    return apiClient.put('/user/profile/level', levelData);
  }
};

export default UserService;