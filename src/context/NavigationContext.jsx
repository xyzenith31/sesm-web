import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

export const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState(null);
  const [viewProps, setViewProps] = useState({});

  useEffect(() => {
    if (loading) return;

    const authenticatedStudentViews = [
        'home', 'explore', 'bookmark', 'profile', 'rank', 'quiz', 'matematika', 
        'membaca', 'menulis', 'berhitung', 'pai', 'bahasaIndonesia', 'bahasaInggris', 
        'pkn', 'ipa', 'ips', 'accountSettings', 'dailyChallenge', 'creativeZone', 
        'interactiveStory', 'diary', 'studyReport', 'worksheet', 'quizForm', 'drawing', 'writing'
    ];
    
    const authenticatedGuruViews = [
        'dashboardGuru', 'manajemenMateri', 'manajemenNilai', 'manajemenKuis', 'evaluasiKuis'
    ];

    if (!user) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setCurrentView('welcome');
      } else {
        // Jika tidak ada user dan view saat ini adalah halaman yang butuh login,
        // arahkan ke login. Ini mencegah user stuck di halaman seperti 'home' setelah logout.
        if ([...authenticatedStudentViews, ...authenticatedGuruViews].includes(currentView)) {
            setCurrentView('login');
        } else if (!currentView) { // Jika baru pertama kali load tanpa user
            setCurrentView('login');
        }
      }
    } else {
      if (user.role === 'guru') {
        if (!authenticatedGuruViews.includes(currentView)) {
           setCurrentView('dashboardGuru');
        }
      } else { // Siswa
        if (user.jenjang) {
          if (!authenticatedStudentViews.includes(currentView)) {
            setCurrentView('home');
          }
        } else {
          setCurrentView('levelSelection');
        }
      }
    }
  // [PERBAIKAN] Hapus `currentView` dari dependency array.
  // Ini memastikan logika di atas hanya berjalan saat status `user` atau `loading` berubah,
  // bukan setiap kali navigasi terjadi.
  }, [user, loading]); 

  const navigate = (view, props = {}) => {
    if (view === 'login') {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    setViewProps(props);
    setCurrentView(view);
  };

  const value = {
    currentView,
    navigate,
    viewProps,
  };

  return (
    <NavigationContext.Provider value={value}>
      {/* Tampilkan children hanya jika currentView sudah di-set */}
      {currentView ? children : null}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  return useContext(NavigationContext);
};