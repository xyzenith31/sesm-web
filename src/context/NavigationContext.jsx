import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

export const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState(null);
  const [viewProps, setViewProps] = useState({}); // State untuk menyimpan props

  useEffect(() => {
    if (loading) return;
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

    if (!user) {
      if (!hasSeenWelcome) {
        setCurrentView('welcome');
      } else {
        setCurrentView('login');
      }
    } else {
      if (user.role === 'guru') {
        if (!['dashboardGuru', 'manajemenMateri', 'manajemenKuis', 'manajemenNilai', 'evaluasiKuis'].includes(currentView)) {
           setCurrentView('dashboardGuru');
        }
      } else {
        if (user.jenjang) {
          setCurrentView('home');
        } else {
          setCurrentView('levelSelection');
        }
      }
    }
  }, [user, loading]); 

  // Fungsi navigate sekarang menerima props
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
    viewProps, // Bagikan props
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