import apiClient from '../utils/apiClient'; 

const getTodaysChallenges = () => {
  return apiClient.get('/challenges/today');
};

const completeDailyChallenge = (challengeId) => {
  return apiClient.post(`/challenges/${challengeId}/complete`);
};

const ChallengeService = {
  getTodaysChallenges,
  completeDailyChallenge,
};

export default ChallengeService;