import DataService from '../services/dataService';
import { useAuth } from './useAuth';

export const useData = () => {
  const { updateUserLocally } = useAuth();

  const updateLevelAndClass = async (levelData) => {
    // 1. Kirim data pilihan (misal: { jenjang: 'SD', kelas: 6 }) ke server
    const response = await DataService.updateLevelAndClass(levelData);
    
    // 2. Setelah berhasil, perbarui data pengguna di aplikasi secara lokal
    updateUserLocally(levelData);
    
    return response;
  };

  return {
    getSubjects: DataService.getSubjects,
    updateLevelAndClass,
  };
};