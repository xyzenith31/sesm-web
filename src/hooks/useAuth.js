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
      setUser(userData);
    }
    return response.data;
  };

  // --- FUNGSI LOGOUT DIPERBARUI UNTUK KEMBALI KE WELCOME PAGE ---
  const logout = () => {
    // Hapus data pengguna dari state dan local storage
    AuthService.logout(); // Ini akan menghapus item 'user'
    
    // HAPUS PENANDA 'hasSeenWelcome' AGAR KEMBALI KE WELCOME PAGE
    localStorage.removeItem('hasSeenWelcome');
    
    // Kosongkan state pengguna di AuthContext, yang akan memicu redirect
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