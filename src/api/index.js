import axios from 'axios';

// Membuat instance axios dengan konfigurasi dasar
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // URL dasar backend Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  Interceptor untuk menambahkan token JWT ke setiap request jika user sudah login.
  Ini akan sangat berguna nanti saat Anda memiliki halaman yang butuh otentikasi.
*/
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.accessToken) {
      config.headers['x-access-token'] = user.accessToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;