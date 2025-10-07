import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiTrendingUp, FiCheckSquare, FiClock } from 'react-icons/fi';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import WelcomeLayout from './layouts/WelcomeLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import BookmarkPage from './pages/BookmarkPage';
import QuizPage from './pages/QuizPage';
import MatematikaPage from './pages/MatematikaPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import StudyReportPage from './pages/StudyReportPage';
import DiaryPage from './pages/DiaryPage';
import RankPage from './pages/RankPage';
import CreativeZonePage from './pages/CreativeZonePage';

// Services
import AuthService from './services/auth.service';

const App = () => {
  // State utama untuk mengontrol halaman yang ditampilkan
  const [currentPage, setCurrentPage] = useState(AuthService.getCurrentUser() ? 'home' : 'login');
  const [pageProps, setPageProps] = useState({});
  
  // State untuk data pengguna
  const [user, setUser] = useState(null);

  // Efek untuk memuat data pengguna saat aplikasi dimuat
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser({
        name: currentUser.username || 'Siswa Cerdas',
        level: 'SD - Kelas 4',
        avatar: currentUser.avatar || 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=SiswaCerdas',
        stats: [
          { icon: FiTrendingUp, value: '15', label: 'Materi dilihat', color: 'text-yellow-300' },
          { icon: FiCheckSquare, value: '8', label: 'Tugas Selesai', color: 'text-green-300' },
          { icon: FiClock, value: '5 Jam', label: 'Waktu Belajar', color: 'text-sky-300' },
        ],
      });
    }
  }, []);

  // Fungsi navigasi yang akan diteruskan ke semua komponen
  const handleNavigate = (page, props = {}) => {
    // Logika logout
    if (page === 'login') {
      AuthService.logout();
      setUser(null);
    }
    setCurrentPage(page);
    setPageProps(props);
  };

  // Fungsi untuk me-render komponen halaman berdasarkan state 'currentPage'
  const renderPage = () => {
    switch (currentPage) {
      // Rute Publik
      case 'welcome': return <WelcomePage onNavigate={handleNavigate} />;
      case 'login': return <LoginPage onNavigate={handleNavigate} />;
      case 'register': return <RegisterPage onNavigate={handleNavigate} />;

      // Rute Privat (dengan MainLayout)
      case 'home': return <HomePage onNavigate={handleNavigate} />;
      case 'explore': return <ExplorePage onNavigate={handleNavigate} />;
      case 'creativeZone': return <CreativeZonePage onNavigate={handleNavigate} />;
      case 'bookmark': return <BookmarkPage onNavigate={handleNavigate} />;
      case 'profile': return <ProfilePage onNavigate={handleNavigate} user={user} setUser={setUser} />;
      
      // Rute Privat (tanpa MainLayout / halaman penuh)
      case 'quiz': return <QuizPage onNavigate={handleNavigate} />;
      case 'matematika1': return <MatematikaPage onNavigate={handleNavigate} />;
      case 'accountSettings': return <AccountSettingsPage onNavigate={handleNavigate} user={user} setUser={setUser} />;
      case 'studyReport': return <StudyReportPage onNavigate={handleNavigate} />;
      case 'diary': return <DiaryPage onNavigate={handleNavigate} />;
      case 'rank': return <RankPage onNavigate={handleNavigate} />;

      // Fallback jika halaman tidak ditemukan
      default:
        // Jika user login tapi halaman tidak ada, arahkan ke home. Jika tidak, ke login.
        return AuthService.getCurrentUser() 
          ? <HomePage onNavigate={handleNavigate} /> 
          : <LoginPage onNavigate={handleNavigate} />;
    }
  };
  
  // Pengaturan animasi transisi halaman
  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 }
  };
  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  // Daftar halaman yang menggunakan layout utama
  const pagesWithMainLayout = ['home', 'explore', 'creativeZone', 'bookmark', 'profile'];
  const authPages = ['login', 'register'];
  const welcomePages = ['welcome'];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {(() => {
          if (pagesWithMainLayout.includes(currentPage)) {
            return (
              <MainLayout onNavigate={handleNavigate} currentPage={currentPage}>
                {renderPage()}
              </MainLayout>
            );
          }
          if (authPages.includes(currentPage)) {
            return <AuthLayout>{renderPage()}</AuthLayout>;
          }
          if (welcomePages.includes(currentPage)) {
            return <WelcomeLayout>{renderPage()}</WelcomeLayout>;
          }
          // Untuk halaman privat lain yang tidak pakai MainLayout
          return renderPage();
        })()}
      </motion.div>
    </AnimatePresence>
  );
};

export default App;