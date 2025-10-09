import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthService from '../services/authService';
// Impor DataService yang sudah diperbarui
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
  
  // --- FUNGSI UPDATE PROFILE DIPERBAIKI DI SINI ---
  const updateProfile = async (updatedData) => {
    try {
      // 1. Kirim data pembaruan ke backend (baris ini diaktifkan)
      await DataService.updateUserProfile(updatedData);

      // 2. Jika pengiriman ke backend berhasil, perbarui data lokal
      const currentUser = AuthService.getCurrentUser();
      const updatedUser = { ...currentUser, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 3. Perbarui state global agar semua komponen mendapat data baru
      refreshUser();

      return { success: true, message: 'Profil berhasil diperbarui!' };

    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      const errorMessage = error.response?.data?.message || 'Gagal terhubung ke server.';
      return { success: false, message: errorMessage };
    }
  };


  return {
    user,
    loading,
    login,
    logout,
    register: AuthService.register,
    updateProfile,
  };
};