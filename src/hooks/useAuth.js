import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthService from '../services/authService';
import DataService from '../services/dataService';

export const useAuth = () => {
  const { user, setUser, loading, refreshUser } = useContext(AuthContext);

  const login = async (identifier, password) => {
    const response = await AuthService.login(identifier, password);
    if (response.data.accessToken) {
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
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

  // --- TAMBAHKAN FUNGSI INI ---
  // Fungsi ini hanya untuk memperbarui data user di local storage dan state,
  // tanpa mengirim data lagi ke server.
  const updateUserLocally = (newData) => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      // Gabungkan data user lama dengan data baru
      const updatedUser = { ...currentUser, ...newData };
      // Simpan kembali ke local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Refresh state global
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
    updateUserLocally, // <-- PASTIKAN FUNGSI INI DI-EXPORT DI SINI
  };
};