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

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;