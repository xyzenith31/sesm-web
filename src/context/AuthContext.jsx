import React, { createContext, useState, useContext, useEffect } from 'react';

// Membuat Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cek jika ada data user di localStorage saat aplikasi pertama kali dimuat
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fungsi untuk menyimpan data user saat login
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Fungsi untuk menghapus data user saat logout
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook custom untuk mempermudah penggunaan context
export const useAuth = () => {
  return useContext(AuthContext);
};