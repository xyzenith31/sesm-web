import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthService from '../services/authService';

export const useAuth = () => {
  const { user, setUser, loading, refreshUser } = useContext(AuthContext);

  const login = async (identifier, password) => {
    const response = await AuthService.login(identifier, password);
    if (response.data.accessToken) {
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData); // Langsung update state, ini lebih cepat
    }
    return response.data;
  };

  // --- FUNGSI LOGOUT DIPERBAIKI DI SINI ---
  const logout = () => {
    // Hapus data pengguna
    AuthService.logout();
    
    // HAPUS PENANDA 'hasSeenWelcome' AGAR KEMBALI KE AWAL
    localStorage.removeItem('hasSeenWelcome');
    
    // Kosongkan state pengguna
    setUser(null);
  };
  
  const updateUserLocally = (updatedData) => {
      const currentUser = AuthService.getCurrentUser();
      const updatedUser = { ...currentUser, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      refreshUser();
  };

  return {
    user,
    loading,
    login,
    logout,
    register: AuthService.register,
    updateUserLocally,
  };
};