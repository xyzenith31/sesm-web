import apiClient from '../utils/apiClient';

const register = (userData) => {
  return apiClient.post('/auth/register', userData);
};

const login = (identifier, password) => {
  return apiClient.post('/auth/login', { identifier, password });
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const forgotPassword = (identifier) => {
  return apiClient.post('/auth/forgot-password', { identifier });
};

// Diperbarui: menerima identifier
const verifyCode = (code, identifier) => {
  return apiClient.post('/auth/verify-code', { code, identifier });
};

// Diperbarui: menerima identifier
const resetPassword = (code, identifier, password, konfirmasi_password) => {
  return apiClient.post('/auth/reset-password', { code, identifier, password, konfirmasi_password });
};

const resendCode = (identifier) => {
  return apiClient.post('/auth/resend-code', { identifier });
};

// --- FUNGSI BARU ---
const loginWithCode = (code, identifier) => {
    return apiClient.post('/auth/login-with-code', { code, identifier });
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
  loginWithCode, // diekspor
};

export default AuthService;