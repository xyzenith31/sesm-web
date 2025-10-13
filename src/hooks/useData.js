// contoh-sesm-web/hooks/useData.js
import DataService from '../services/dataService';
import { useAuth } from './useAuth';

export const useData = () => {
  const { updateUserLocally } = useAuth();

  const updateLevelAndClass = async (levelData) => {
    const response = await DataService.updateLevelAndClass(levelData);
    updateUserLocally(levelData);
    return response;
  };

  return {
    getSubjects: DataService.getSubjects,
    updateLevelAndClass,
    getPointsSummary: DataService.getPointsSummary,
    getPointsHistory: DataService.getPointsHistory,
    getLeaderboard: DataService.getLeaderboard, // <-- Tambahkan ini
  };
};