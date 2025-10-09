import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

export const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState(null); // Mulai dari null untuk mencegah kedipan

  // useEffect ini sekarang HANYA berjalan saat status login/loading berubah.
  // Tugasnya adalah menentukan halaman mana yang harus ditampilkan saat aplikasi pertama dimuat,
  // atau saat pengguna login/logout.
  useEffect(() => {
    // Jangan lakukan apa-apa sampai status otentikasi selesai diperiksa
    if (loading) {
      return;
    }

    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

    // Jika TIDAK ADA user (belum login)
    if (!user) {
      if (!hasSeenWelcome) {
        setCurrentView('welcome');
      } else {
        setCurrentView('login');
      }
    } 
    // Jika ADA user (sudah login)
    else {
      if (user.jenjang) {
        // Jika sudah memilih jenjang, langsung ke home.
        // PENTING: Cek dulu apakah currentView sudah di dalam area aplikasi utama.
        // Ini mencegah 'home' menimpa navigasi yang sedang berlangsung (misal ke 'ipa').
        const mainAppViews = ['home', 'explore', 'profile', 'matematika', 'ipa', 'pkn']; // Tambahkan view lain di sini jika perlu
        if (!currentView || !mainAppViews.includes(currentView)) {
           setCurrentView('home');
        }
      } else {
        // Jika belum memilih jenjang
        setCurrentView('levelSelection');
      }
    }
  }, [user, loading]);

  // Fungsi navigate sekarang menjadi satu-satunya cara untuk berpindah halaman
  // setelah halaman awal ditentukan.
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

  // Tampilkan aplikasi hanya setelah view awal berhasil ditentukan
  return (
    <NavigationContext.Provider value={value}>
      {currentView ? children : null /* Atau tampilkan loading screen di sini */}
    </NavigationContext.Provider>
  );
};

// Hook kustom (tidak berubah)
export const useNavigation = () => {
  return useContext(NavigationContext);
};