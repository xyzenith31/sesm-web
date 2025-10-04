import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LevelSelectionPage from './pages/LevelSelectionPage';
import ChooseSelectionPage from './pages/ChooseSelectionPage'; // DITAMBAH: Impor halaman baru

function App() {
  // DITAMBAH: 'chooseSelection' sebagai kemungkinan view
  const [currentView, setCurrentView] = useState('welcome');

  // Fungsi navigasi
  const showLoginPage = () => setCurrentView('login');
  const showRegisterPage = () => setCurrentView('register');
  const showLevelSelectionPage = () => setCurrentView('levelSelection'); 
  const showChooseSelectionPage = () => setCurrentView('chooseSelection'); // DITAMBAH: Fungsi untuk halaman baru
  
  // Konfigurasi animasi transisi antar halaman
  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.95 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.4
  };
  
  // Fungsi untuk merender halaman yang sesuai
  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <motion.div
            key="login"
            initial="initial" animate="in" exit="out"
            variants={pageVariants} transition={pageTransition}
          >
            <LoginPage onSwitchToRegister={showRegisterPage} onLoginSuccess={showLevelSelectionPage} />
          </motion.div>
        );
      case 'register':
        return (
          <motion.div
            key="register"
            initial="initial" animate="in" exit="out"
            variants={pageVariants} transition={pageTransition}
          >
            <RegisterPage onSwitchToLogin={showLoginPage} />
          </motion.div>
        );
      case 'levelSelection':
        return (
          <motion.div
            key="levelSelection"
            initial="initial" animate="in" exit="out"
            variants={pageVariants} transition={pageTransition}
          >
            {/* DIUBAH: Mengirim fungsi navigasi ke halaman pemilihan kelas */}
            <LevelSelectionPage onSelectSD={showChooseSelectionPage} />
          </motion.div>
        );
      // DITAMBAH: Case untuk merender halaman pemilihan kelas
      case 'chooseSelection':
        return (
          <motion.div
            key="chooseSelection"
            initial="initial" animate="in" exit="out"
            variants={pageVariants} transition={pageTransition}
          >
            <ChooseSelectionPage />
          </motion.div>
        );
      default: // Halaman 'welcome'
        return (
          <motion.div
            key="welcome"
            initial="initial" animate="in" exit="out"
            variants={pageVariants} transition={pageTransition}
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