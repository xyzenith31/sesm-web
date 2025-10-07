import apiClient from './index.js';

const AuthService = {
  // --- Fungsi untuk Registrasi ---
  register: (userData) => {
    // Parameter 'userData' adalah objek yang berisi semua data dari form registrasi
    return apiClient.post('/auth/register', userData);
  },

  // --- Fungsi untuk Login ---
  login: (identifier, password) => {
    return apiClient
      .post('/auth/login', {
        identifier, // Backend mengharapkan 'identifier', bukan 'username'
        password,
      })
      .then(response => {
        // Jika login berhasil dan ada accessToken, simpan data user ke localStorage
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