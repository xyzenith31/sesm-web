import apiClient from '../utils/apiClient';

const getSubjects = (jenjang, kelas) => {
  let url = `/subjects/${jenjang}`;
  if (jenjang && jenjang.toLowerCase() === 'sd' && kelas) {
    url += `/${kelas}`;
  }
  return apiClient.get(url);
};

const updateLevelAndClass = (levelData) => {
  return apiClient.put('/user/profile/level', levelData);
};

const updateUserProfile = (profileData) => {
  return apiClient.put('/user', profileData); 
};

const DataService = {
  getSubjects,
  updateLevelAndClass,
  updateUserProfile,
};

export default DataService;