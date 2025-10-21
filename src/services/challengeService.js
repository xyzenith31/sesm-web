// src/services/challengeService.js
import apiClient from '../utils/apiClient'; // Pastikan path ini benar

/**
 * Mengambil daftar tantangan harian untuk pengguna saat ini.
 * (Backend akan menentukan tantangan mana yang ditampilkan)
 */
const getTodaysChallenges = () => {
  return apiClient.get('/challenges/today');
};

/**
 * Mengirimkan data bahwa pengguna telah menyelesaikan tantangan.
 * Backend akan menghitung poin random dan mencatatnya.
 * @param {string} challengeId - ID unik dari tantangan yang diselesaikan.
 * @returns {Promise<Object>} - Promise berisi response dari backend, termasuk pointsAwarded.
 */
const completeDailyChallenge = (challengeId) => {
  // Backend endpoint: POST /api/challenges/:challengeId/complete
  return apiClient.post(`/challenges/${challengeId}/complete`);
};

const ChallengeService = {
  getTodaysChallenges,
  completeDailyChallenge,
};

export default ChallengeService;