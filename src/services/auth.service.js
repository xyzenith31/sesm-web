import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

class AuthService {
  // Fungsi untuk login
  login(username, password) {
    return axios
      .post(API_URL + 'login', {
        login: username,
        password,
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  // Fungsi untuk logout
  logout() {
    localStorage.removeItem('user');
  }

  // Fungsi untuk register
  register(username, email, nama, umur, password, konfirmasi_password, jenjang, kelas) {
    return axios.post(API_URL + 'register', {
      username,
      email,
      nama,
      umur,
      password,
      konfirmasi_password,
      jenjang,
      kelas,
    });
  }

  // Fungsi untuk mendapatkan data user yang sedang login
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
}

export default new AuthService();