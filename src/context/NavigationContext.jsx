// contoh-sesm-web/context/NavigationContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

export const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('lastView') || null);
  const [viewProps, setViewProps] = useState({});
  // State baru untuk mengontrol loading bar
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const authenticatedStudentViews = [
        'home', 'explore', 'bookmark', 'profile', 'rank', 'quiz', 'matematika',
        'membaca', 'menulis', 'berhitung', 'pai', 'bahasaIndonesia', 'bahasaInggris',
        'pkn', 'ipa', 'ips', 'accountSettings', 'dailyChallenge', 'creativeZone',
        'interactiveStory', 'diary', 'studyReport', 'worksheet', 'quizForm', 'drawing', 'writing'
    ];

    const authenticatedGuruViews = [
        'dashboardGuru', 'manajemenMateri', 'manajemenNilai', 'manajemenKuis', 'evaluasiKuis',
        'manajemenPengguna', 'manajemenBookmark', 'manajemenCerita', 'teacherProfile'
    ];

    let targetView = currentView;

    if (!user) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        targetView = 'welcome';
      } else {
        if ([...authenticatedStudentViews, ...authenticatedGuruViews].includes(currentView)) {
            targetView = 'login';
        } else if (!currentView) {
            targetView = 'login';
        }
      }
    } else {
      if (user.role === 'guru') {
        if (!authenticatedGuruViews.includes(currentView)) {
           targetView = 'dashboardGuru';
        }
      } else {
        if (!user.jenjang) {
            targetView = 'levelSelection';
        } else {
          if (!authenticatedStudentViews.includes(currentView)) {
            targetView = 'home';
          }
        }
      }
    }

    if (targetView !== currentView || !currentView) {
      setCurrentView(targetView);
    }
  }, [user, authLoading, currentView]);

  const navigate = (view, props = {}) => {
    if (currentView === view) return; // Jangan lakukan apa-apa jika tujuannya sama

    setIsLoading(true); // Mulai loading bar

    if (view === 'login') {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    localStorage.setItem('lastView', view);
    setViewProps(props);
    setCurrentView(view);
  };

  useEffect(() => {
    if (currentView) {
      localStorage.setItem('lastView', currentView);
    }
  }, [currentView]);


  const value = {
    currentView,
    navigate,
    viewProps,
    isLoading,
    setIsLoading, // Ekspor fungsi ini
  };

  if (authLoading || !currentView) {
      return null;
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  return useContext(NavigationContext);
};