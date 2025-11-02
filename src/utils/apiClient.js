import axios from 'axios';

// [PERBAIKAN] Ekspor URL dasar server
export const API_BASE_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`, // [PERBAIKAN] Gunakan konstanta
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Ambil user dari localStorage di dalam interceptor
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.accessToken) {
        config.headers['x-access-token'] = user.accessToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
