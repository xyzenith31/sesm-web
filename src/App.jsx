import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LevelSelectionPage from './pages/LevelSelectionPage';
import ChooseSelectionPage from './pages/ChooseSelectionPage';
import HomePage from './pages/HomePage'; // 1. Impor HomePage

function App() {
  // 2. Tambahkan 'home' sebagai kemungkinan view
  const [currentView, setCurrentView] = useState('welcome');

  // Fungsi navigasi
  const showLoginPage = () => setCurrentView('login');
  const showRegisterPage = () => setCurrentView('register');
  const showLevelSelectionPage = () => setCurrentView('levelSelection'); 
  const showChooseSelectionPage = () => setCurrentView('chooseSelection');
  const showHomePage = () => setCurrentView('home'); // 3. Buat fungsi untuk menampilkan HomePage
  
  // Konfigurasi animasi transisi
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
  
  const renderView = () => {
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
            {/* 4. Kirim fungsi `showHomePage` sebagai prop `onSelectionComplete` */}
            <ChooseSelectionPage onSelectionComplete={showHomePage} />
          </motion.div>
        );
      // 5. Tambahkan case untuk merender HomePage
      case 'home':
        return (
          <motion.div key="home" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <HomePage />
          </motion.div>
        );
      default: // Halaman 'welcome'
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