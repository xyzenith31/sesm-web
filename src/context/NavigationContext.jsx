import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

// 1. Buat Context baru
export const NavigationContext = createContext();

// 2. Buat Provider (komponen pembungkus) untuk Context ini
export const NavigationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('welcome'); // Default view selalu 'welcome'

  // 3. Logika utama untuk menentukan halaman mana yang akan ditampilkan
  useEffect(() => {
    // Jangan lakukan apa-apa sampai status otentikasi selesai diperiksa
    if (loading) return;

    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

    // Jika belum pernah lihat Welcome Page, tampilkan 'welcome'
    if (!hasSeenWelcome) {
      setCurrentView('welcome');
    } else {
      // Jika sudah pernah lihat, periksa status login
      if (user) {
        // Jika user ada dan sudah memilih jenjang, langsung ke 'home'
        if (user.jenjang) {
          setCurrentView('home');
        } else {
          // Jika user ada tapi jenjangnya NULL, ke halaman 'levelSelection'
          setCurrentView('levelSelection');
        }
      } else {
        // Jika tidak ada user, arahkan ke 'login'
        setCurrentView('login');
      }
    }
  }, [user, loading]); // Efek ini berjalan setiap kali status user atau loading berubah

  // 4. Fungsi untuk navigasi manual
  const navigate = (view) => {
    // Saat pengguna klik "Explore Now" di Welcome Page,
    // tandai bahwa mereka sudah melihatnya.
    if (view === 'login') {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    setCurrentView(view);
  };

  const value = {
    currentView,
    navigate,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// 5. Hook kustom untuk mempermudah penggunaan context
export const useNavigation = () => {
  return useContext(NavigationContext);
};