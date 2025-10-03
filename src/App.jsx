import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LevelSelectionPage from './pages/LevelSelectionPage'; // 1. Impor halaman baru

function App() {
  // 2. Tambahkan 'levelSelection' sebagai kemungkinan view
  const [currentView, setCurrentView] = useState('welcome');

  // Fungsi navigasi
  const showLoginPage = () => setCurrentView('login');
  const showRegisterPage = () => setCurrentView('register');
  // 3. Buat fungsi untuk menampilkan halaman baru
  const showLevelSelectionPage = () => setCurrentView('levelSelection'); 
  
  // Konfigurasi animasi transisi antar halaman
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };
  
  // Fungsi untuk merender halaman yang sesuai
  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <motion.div
            key="login"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {/* 4. Kirim fungsi navigasi baru sebagai prop */}
            <LoginPage onSwitchToRegister={showRegisterPage} onLoginSuccess={showLevelSelectionPage} />
          </motion.div>
        );
      case 'register':
        return (
          <motion.div
            key="register"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <RegisterPage onSwitchToLogin={showLoginPage} />
          </motion.div>
        );
      // 5. Tambahkan case untuk merender halaman baru
      case 'levelSelection':
        return (
          <motion.div
            key="levelSelection"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <LevelSelectionPage />
          </motion.div>
        );
      default: // Halaman 'welcome'
        return (
          <motion.div
            key="welcome"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
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