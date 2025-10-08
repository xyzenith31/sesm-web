import apiClient from './index.js';

const AuthService = {
  // --- Fungsi untuk Registrasi ---
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  // --- Fungsi untuk Login ---
  login: (identifier, password) => {
    return apiClient
      .post('/auth/login', {
        identifier,
        password,
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
      });
  },

  // --- Fungsi untuk Logout ---
  logout: () => {
    localStorage.removeItem('user');
  },

  // --- Fungsi untuk mendapatkan data user yang sedang login ---
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};

export default AuthService;