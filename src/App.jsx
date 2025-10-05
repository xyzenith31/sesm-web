import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Impor semua halaman yang ada
import WelcomePage from './pages/WelcomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LevelSelectionPage from './pages/LevelSelectionPage.jsx';
import ChooseSelectionPage from './pages/ChooseSelectionPage.jsx';
import HomePageTK from './pages/HomePageTK.jsx';
import HomePageSD1 from './pages/HomePageSD1.jsx';
import HomePageSD2 from './pages/HomePageSD2.jsx';
import HomePageSD3_4 from './pages/HomePageSD3-4.jsx';
import HomePageSD5 from './pages/HomePageSD5.jsx';
import HomePageSD6 from './pages/HomePageSD6.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ActivityLogPage from './pages/ActivityLogPage.jsx';
import DiaryPage from './pages/DiaryPage.jsx';
import BookmarkPage from './pages/BookmarkPage.jsx';
import MatematikaPage from './pages/MatematikaPage.jsx';

// Impor layout utama
import MainLayout from './layouts/MainLayout.jsx';

function App() {
  const [currentView, setCurrentView] = useState('welcome');

  const navigate = (view) => setCurrentView(view);

  // Fungsi lainnya tetap sama
  const showLoginPage = () => setCurrentView('login');
  const showRegisterPage = () => setCurrentView('register');
  const showLevelSelectionPage = () => setCurrentView('levelSelection');
  const showChooseSelectionPage = () => setCurrentView('chooseSelection');
  const showHomePageTK = () => setCurrentView('homeTK');
  const showHomePageSD1 = () => setCurrentView('homeSD1');
  const showHomePageSD2 = () => setCurrentView('homeSD2');
  const showHomePageSD3_4 = () => setCurrentView('homeSD3_4');
  const showHomePageSD5 = () => setCurrentView('homeSD5');
  const showHomePageSD6 = () => setCurrentView('homeSD6');
  
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
    // Daftar view di dalam MainLayout (MatematikaPage DIHAPUS dari sini)
    const viewsInMainLayout = [
      'homeTK', 'homeSD1', 'homeSD2', 'homeSD3_4', 'homeSD5', 'homeSD6',
      'profile', 'activityLog', 'diary', 'explore', 'bookmark',
    ];
    
    const getActivePage = () => {
      const homeViews = ['homeTK', 'homeSD1', 'homeSD2', 'homeSD3_4', 'homeSD5', 'homeSD6'];
      if (homeViews.includes(currentView)) {
        return 'home';
      }
      return currentView;
    };

    if (viewsInMainLayout.includes(currentView)) {
      let pageComponent;

      if (currentView === 'homeTK') pageComponent = <HomePageTK onNavigate={navigate} />;
      if (currentView === 'homeSD1') pageComponent = <HomePageSD1 onNavigate={navigate} />;
      if (currentView === 'homeSD2') pageComponent = <HomePageSD2 onNavigate={navigate} />;
      if (currentView === 'homeSD3_4') pageComponent = <HomePageSD3_4 onNavigate={navigate} />;
      if (currentView === 'homeSD5') pageComponent = <HomePageSD5 onNavigate={navigate} />;
      if (currentView === 'homeSD6') pageComponent = <HomePageSD6 onNavigate={navigate} />;
      if (currentView === 'profile') pageComponent = <ProfilePage onNavigate={navigate} />;
      if (currentView === 'activityLog') pageComponent = <ActivityLogPage onNavigate={navigate} />;
      if (currentView === 'diary') pageComponent = <DiaryPage onNavigate={navigate} />;
      if (currentView === 'bookmark') pageComponent = <BookmarkPage />;
      
      return (
        <MainLayout activePage={getActivePage()} onNavigate={navigate}>
          <motion.div key={currentView} variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            {pageComponent}
          </motion.div>
        </MainLayout>
      );
    }

    // Render halaman individual di luar MainLayout
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
            <LevelSelectionPage onSelectSD={showChooseSelectionPage} onSelectTK={showHomePageTK} />
          </motion.div>
        );
      case 'chooseSelection':
        return (
          <motion.div key="chooseSelection" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <ChooseSelectionPage
              onSelectClass1={showHomePageSD1}
              onSelectClass2={showHomePageSD2}
              onSelectClass3_4={showHomePageSD3_4}
              onSelectClass5={showHomePageSD5}
              onSelectClass6={showHomePageSD6}
            />
          </motion.div>
        );
      // Case baru untuk MatematikaPage
      case 'matematika1':
        return (
          <motion.div key="matematika1" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <MatematikaPage onNavigate={navigate} />
          </motion.div>
        );
      default:
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