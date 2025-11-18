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

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };
  
  const updateProfile = async (profileData, avatarFile) => {
    try {
      const response = await DataService.updateUserProfile(profileData, avatarFile);
      const currentUser = AuthService.getCurrentUser();
      
      const { password, ...dataToSaveLocally } = profileData;
      
      const updatedUser = { ...currentUser, ...dataToSaveLocally };

      if (response.data.avatar !== undefined) {
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