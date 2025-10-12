import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthService from '../services/authService';
import DataService from '../services/dataService';

export const useAuth = () => {
  const { user, setUser, loading, refreshUser } = useContext(AuthContext);

  // --- FUNGSI BARU UNTUK SENTRALISASI LOGIN ---
  const handleAuthentication = (userData) => {
    if (userData && userData.accessToken) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const login = async (identifier, password) => {
    const response = await AuthService.login(identifier, password);
    handleAuthentication(response.data); // Gunakan fungsi baru
    return response.data;
  };

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
    register: AuthService.register,
    updateProfile,
    updateUserLocally,
    handleAuthentication, // Ekspor fungsi baru
  };
};