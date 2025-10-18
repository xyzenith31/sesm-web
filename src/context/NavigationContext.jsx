import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

export const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  // Gunakan state untuk currentView, inisialisasi dari localStorage jika ada
  const [currentView, setCurrentView] = useState(() => {
    // Coba ambil view terakhir dari localStorage saat inisialisasi
    return localStorage.getItem('lastView') || null;
  });
  const [viewProps, setViewProps] = useState({});

  useEffect(() => {
    if (loading) return; // Jangan lakukan apa-apa jika AuthContext masih loading

    const authenticatedStudentViews = [
        'home', 'explore', 'bookmark', 'profile', 'rank', 'quiz', 'matematika',
        'membaca', 'menulis', 'berhitung', 'pai', 'bahasaIndonesia', 'bahasaInggris',
        'pkn', 'ipa', 'ips', 'accountSettings', 'dailyChallenge', 'creativeZone',
        'interactiveStory', 'diary', 'studyReport', 'worksheet', 'quizForm', 'drawing', 'writing'
    ];

    const authenticatedGuruViews = [
        'dashboardGuru', 'manajemenMateri', 'manajemenNilai', 'manajemenKuis', 'evaluasiKuis',
        'manajemenPengguna', 'manajemenBookmark', 'manajemenCerita', 'teacherProfile' // Pastikan teacherProfile ada di sini
    ];

    let targetView = currentView; // Defaultnya tetap view saat ini

    if (!user) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        targetView = 'welcome';
      } else {
        // Jika tidak ada user dan view saat ini BUTUH login, arahkan ke login
        if ([...authenticatedStudentViews, ...authenticatedGuruViews].includes(currentView)) {
            targetView = 'login';
        } else if (!currentView) { // Jika baru pertama kali load tanpa user & view
            targetView = 'login';
        }
        // Jika view saat ini tidak butuh login (misal 'login' atau 'register'), biarkan saja
      }
    } else { // Jika ada user (sudah login)
      if (user.role === 'guru') {
        // Jika view saat ini BUKAN view guru yang valid, arahkan ke dashboard guru
        if (!authenticatedGuruViews.includes(currentView)) {
           targetView = 'dashboardGuru';
        }
        // Jika SUDAH di view guru yang valid (termasuk teacherProfile), JANGAN redirect
      } else { // Siswa
        if (!user.jenjang) { // Jika siswa belum pilih jenjang
            targetView = 'levelSelection';
        } else { // Jika siswa sudah punya jenjang
          // Jika view saat ini BUKAN view siswa yang valid, arahkan ke home siswa
          if (!authenticatedStudentViews.includes(currentView)) {
            targetView = 'home';
          }
          // Jika SUDAH di view siswa yang valid, JANGAN redirect
        }
      }
    }

    // Hanya update state jika targetView berbeda dari currentView
    // atau jika currentView belum diinisialisasi
    if (targetView !== currentView || !currentView) {
      setCurrentView(targetView);
    }

  // Hapus `currentView` dari dependency array untuk mencegah loop
  // useEffect ini hanya perlu dijalankan ketika status `user` atau `loading` berubah.
  }, [user, loading]);

  const navigate = (view, props = {}) => {
    if (view === 'login') {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    // Simpan view terakhir ke localStorage sebelum navigasi
    localStorage.setItem('lastView', view);
    setViewProps(props);
    setCurrentView(view); // Update state view saat navigasi
  };

  // Simpan view ke localStorage setiap kali berubah
  useEffect(() => {
    if (currentView) {
      localStorage.setItem('lastView', currentView);
    }
  }, [currentView]);


  const value = {
    currentView,
    navigate,
    viewProps,
  };

  // Tampilkan loading indicator atau null jika context auth belum siap atau view belum ditentukan
  if (loading || !currentView) {
      return null; // Atau tampilkan spinner global jika diinginkan
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