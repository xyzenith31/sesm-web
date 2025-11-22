import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

export const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('lastView') || null;
  });
  const [viewProps, setViewProps] = useState({});

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
        setViewProps(event.state.props || {});
        localStorage.setItem('lastView', event.state.view);
      } 
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (loading) return; 

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
      window.history.replaceState({ view: targetView, props: {} }, "", `#${targetView}`);
    }

  }, [user, loading]);

  const navigate = (view, props = {}) => {
    if (view === 'login') {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    
    localStorage.setItem('lastView', view);
    setViewProps(props);
    setCurrentView(view);

    window.history.pushState({ view, props }, "", `#${view}`);
  };

  useEffect(() => {
    if (currentView && !loading) {
       if (!window.history.state || window.history.state.view !== currentView) {
           window.history.replaceState({ view: currentView, props: viewProps }, "", `#${currentView}`);
       }
    }
  }, [currentView, loading]);


  const value = {
    currentView,
    navigate,
    viewProps,
  };

  if (loading || !currentView) {
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