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
        setCurrentView('login');
      }
    } else {
      if (user.role === 'guru') {
        // Jika user guru dan tidak sedang di halaman guru, arahkan ke dashboard guru
        if (!authenticatedGuruViews.includes(currentView)) {
           setCurrentView('dashboardGuru');
        }
      } else { // Jika user adalah siswa
        if (user.jenjang) {
          // Hanya arahkan ke 'home' jika user baru saja login atau dari halaman non-autentikasi.
          // Ini mencegah redirect dari halaman seperti AccountSettings.
          if (!authenticatedStudentViews.includes(currentView)) {
            setCurrentView('home');
          }
        } else {
          setCurrentView('levelSelection');
        }
      }
    }
  }, [user, loading, currentView]); 

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
      {currentView ? children : null}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  return useContext(NavigationContext);
};