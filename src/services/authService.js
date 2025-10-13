import apiClient from '../utils/apiClient';

const register = (userData) => {
  return apiClient.post('/auth/register', userData);
};

const login = (identifier, password) => {
  return apiClient.post('/auth/login', { identifier, password });
};

// --- FUNGSI BARU UNTUK VERIFIKASI & LOGIN ---
const verifyAndLogin = (code, identifier) => {
  return apiClient.post('/auth/verify-and-login', { code, identifier });
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Fungsionalitas Lupa Password tidak berubah
const forgotPassword = (identifier) => {
  return apiClient.post('/auth/forgot-password', { identifier });
};
const verifyCode = (code, identifier) => {
  return apiClient.post('/auth/verify-code', { code, identifier });
};
const resetPassword = (code, identifier, password, konfirmasi_password) => {
  return apiClient.post('/auth/reset-password', { code, identifier, password, konfirmasi_password });
};
const resendCode = (identifier) => {
  return apiClient.post('/auth/resend-code', { identifier });
};


const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  verifyCode,
  resetPassword,
  resendCode,
  verifyAndLogin, // diekspor
};

export default AuthService;