import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthService from '../services/authService';
import DataService from '../services/dataService';

export const useAuth = () => {
  const { user, setUser, loading, refreshUser } = useContext(AuthContext);

  const handleAuthentication = (userData) => {
    if (userData && userData.accessToken) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };
  
  // Fungsi login & register sekarang hanya memanggil service
  const login = (identifier, password) => {
    return AuthService.login(identifier, password);
  };

  const register = (formData) => {
    return AuthService.register(formData);
  }

  // Fungsi baru untuk login setelah verifikasi OTP
  const loginWithOtp = async (code, identifier) => {
    const response = await AuthService.verifyAndLogin(code, identifier);
    handleAuthentication(response.data);
    return response.data;
  }

  const logout = () => {
    AuthService.logout();
    localStorage.removeItem('hasSeenWelcome');
    setUser(null);
  };
  
  const updateProfile = async (updatedData) => {
    try {
      await DataService.updateUserProfile(updatedData);
      const currentUser = AuthService.getCurrentUser();
      const updatedUser = { ...currentUser, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      refreshUser();
      return { success: true, message: 'Profil berhasil diperbarui!' };
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      const errorMessage = error.response?.data?.message || 'Gagal terhubung ke server.';
      return { success: false, message: errorMessage };
    }
  };

  const updateUserLocally = (newData) => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...newData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      refreshUser();
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    loginWithOtp, // Ekspor fungsi baru
    updateProfile,
    updateUserLocally,
    handleAuthentication,
  };
};