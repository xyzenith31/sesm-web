import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  // State untuk melacak halaman mana yang aktif: 'welcome', 'login', atau 'register'
  const [currentView, setCurrentView] = useState('welcome');

  // Fungsi navigasi
  const showLoginPage = () => setCurrentView('login');
  const showRegisterPage = () => setCurrentView('register');
  
  // Konfigurasi animasi transisi antar halaman
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -20
    }
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
            <LoginPage onSwitchToRegister={showRegisterPage} />
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
      default: // Halaman 'welcome' akan menjadi default
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