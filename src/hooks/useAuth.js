import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthService from '../services/authService';
import DataService from '../services/dataService';
// Hapus 'useNavigation' dari sini

export const useAuth = () => {
  const { user, setUser, loading, refreshUser } = useContext(AuthContext);
  // Hapus pemanggilan 'useNavigation' dari sini

  const handleAuthentication = (userData) => {
    if (userData && userData.accessToken) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };
  
  const login = (identifier, password) => {
    return AuthService.login(identifier, password);
  };

  const register = (formData) => {
    return AuthService.register(formData);
  }

  const loginWithOtp = async (code, identifier) => {
    const response = await AuthService.verifyAndLogin(code, identifier);
    handleAuthentication(response.data);
    return response.data;
  }

  // --- FUNGSI LOGOUT KEMBALI SEPERTI SEMULA ---
  const logout = () => {
    AuthService.logout(); // Hapus data dari local storage
    setUser(null); // Set state user menjadi null
    // Perintah 'navigate' dihapus dari sini
  };
  
  const updateProfile = async (profileData, avatarFile) => {
    try {
      const response = await DataService.updateUserProfile(profileData, avatarFile);
      const currentUser = AuthService.getCurrentUser();
      const updatedUser = { ...currentUser, ...profileData };

      if (response.data.avatar) {
          updatedUser.avatar = response.data.avatar;
      }
      
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
    loginWithOtp,
    updateProfile,
    updateUserLocally,
    handleAuthentication,
  };
};