import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Impor semua halaman
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LevelSelectionPage from './pages/LevelSelectionPage';
import ChooseSelectionPage from './pages/ChooseSelectionPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ActivityLogPage from './pages/ActivityLogPage';
import DiaryPage from './pages/DiaryPage';

// Impor layout utama
import MainLayout from './layouts/MainLayout';

function App() {
  // State untuk mengontrol halaman mana yang sedang aktif
  const [currentView, setCurrentView] = useState('welcome');

  // Fungsi navigasi utama yang akan digunakan di dalam MainLayout
  const navigate = (view) => setCurrentView(view);

  // Fungsi navigasi untuk alur sebelum masuk ke layout utama
  const showLoginPage = () => setCurrentView('login');
  const showRegisterPage = () => setCurrentView('register');
  const showLevelSelectionPage = () => setCurrentView('levelSelection'); 
  const showChooseSelectionPage = () => setCurrentView('chooseSelection');
  const showHomePage = () => setCurrentView('home');
  
  // Konfigurasi animasi transisi antar halaman
  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.98 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.4
  };
  
  // Fungsi untuk menentukan halaman mana yang akan dirender
  const renderView = () => {
    // Daftar halaman yang akan menggunakan MainLayout (dengan Sidebar & BottomNavBar)
    const viewsInMainLayout = ['home', 'profile', 'activityLog', 'diary', 'explore', 'bookmark'];

    // Jika halaman saat ini ada di dalam daftar, gunakan MainLayout
    if (viewsInMainLayout.includes(currentView)) {
      let pageComponent;
      
      // Tentukan komponen halaman berdasarkan 'currentView'
      if (currentView === 'home') pageComponent = <HomePage />;
      if (currentView === 'profile') pageComponent = <ProfilePage onNavigate={navigate} />;
      if (currentView === 'activityLog') pageComponent = <ActivityLogPage onNavigate={navigate} />;
      if (currentView === 'diary') pageComponent = <DiaryPage onNavigate={navigate} />;
      // Anda bisa menambahkan halaman 'explore' dan 'bookmark' di sini nanti
      // if (currentView === 'explore') pageComponent = <ExplorePage />;
      // if (currentView === 'bookmark') pageComponent = <BookmarkPage />;

      return (
        <MainLayout activePage={currentView} onNavigate={navigate}>
          <motion.div 
            key={currentView} 
            variants={pageVariants} 
            initial="initial" 
            animate="in" 
            exit="out" 
            transition={pageTransition}
          >
            {pageComponent}
          </motion.div>
        </MainLayout>
      );
    }
    
    // Jika halaman tidak ada di daftar, render secara individual (untuk alur login/register)
    switch (currentView) {
      case 'login':
        return (
          <motion.div key="login" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <LoginPage onSwitchToRegister={showRegisterPage} onLoginSuccess={showLevelSelectionPage} />
          </motion.div>
        );
      case 'register':
        return (
          <motion.div key="register" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <RegisterPage onSwitchToLogin={showLoginPage} />
          </motion.div>
        );
      case 'levelSelection':
        return (
          <motion.div key="levelSelection" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <LevelSelectionPage onSelectSD={showChooseSelectionPage} />
          </motion.div>
        );
      case 'chooseSelection':
        return (
          <motion.div key="chooseSelection" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <ChooseSelectionPage onSelectionComplete={showHomePage} />
          </motion.div>
        );
      default: // Halaman default adalah 'welcome'
        return (
          <motion.div key="welcome" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <WelcomePage onExplore={showLoginPage} />
          </motion.div>
        );
    }
  };

  return (
    <div className="font-sans">
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </div>
  );
}

export default App;