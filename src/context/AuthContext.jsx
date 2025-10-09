import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';

// Membuat context baru
export const AuthContext = createContext();

// Membuat komponen Provider
export const AuthProvider = ({ children }) => {
  // State untuk menyimpan data user dan status loading
  const [user, setUser] = useState(AuthService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  // useEffect untuk menandakan pengecekan user awal telah selesai
  useEffect(() => {
    setLoading(false);
  }, []);

  // Fungsi untuk me-refresh data user dari localStorage
  const refreshUser = () => {
    setUser(AuthService.getCurrentUser());
  };

  // Nilai yang akan dibagikan ke seluruh komponen via context
  const value = {
    user,
    setUser,
    loading,
    refreshUser,
  };

  // Render children hanya setelah loading selesai
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};