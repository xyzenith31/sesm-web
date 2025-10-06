import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Impor semua halaman yang ada
import WelcomePage from './pages/WelcomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LevelSelectionPage from './pages/LevelSelectionPage.jsx';
import ChooseSelectionPage from './pages/ChooseSelectionPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ActivityLogPage from './pages/ActivityLogPage.jsx';
import DiaryPage from './pages/DiaryPage.jsx';
import BookmarkPage from './pages/BookmarkPage.jsx';
import MatematikaPage from './pages/MatematikaPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import DailyChallengePage from './pages/DailyChallengePage.jsx';
import CreativeZonePage from './pages/CreativeZonePage.jsx';
import DrawingPage from './pages/DrawingPage.jsx';
import WritingPage from './pages/WritingPage.jsx';
import InteractiveStoryPage from './pages/InteractiveStoryPage.jsx'; // <-- IMPOR HALAMAN BARU

// Impor layout utama
import MainLayout from './layouts/MainLayout.jsx';

function App() {
  const [currentView, setCurrentView] = useState('welcome');

  const navigate = (view) => setCurrentView(view);

  // Fungsi navigasi yang disederhanakan
  const showLoginPage = () => setCurrentView('login');
  const showRegisterPage = () => setCurrentView('register');
  const showLevelSelectionPage = () => setCurrentView('levelSelection');
  const showChooseSelectionPage = () => setCurrentView('chooseSelection');
  const showHomePage = () => setCurrentView('home');

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
    const viewsInMainLayout = [
      'home',
      'explore',
      'bookmark',
      'profile',
      'activityLog',
      'diary',
      'dailyChallenge',
      'creativeZone'
    ];

    if (viewsInMainLayout.includes(currentView)) {
      let pageComponent;

      if (currentView === 'home') pageComponent = <HomePage onNavigate={navigate} />;
      if (currentView === 'explore') pageComponent = <ExplorePage onNavigate={navigate} />;
      if (currentView === 'bookmark') pageComponent = <BookmarkPage />;
      if (currentView === 'profile') pageComponent = <ProfilePage onNavigate={navigate} />;
      if (currentView === 'activityLog') pageComponent = <ActivityLogPage onNavigate={navigate} />;
      if (currentView === 'diary') pageComponent = <DiaryPage onNavigate={navigate} />;
      if (currentView === 'dailyChallenge') pageComponent = <DailyChallengePage onNavigate={navigate} />;
      if (currentView === 'creativeZone') pageComponent = <CreativeZonePage onNavigate={navigate} />;

      return (
        <MainLayout activePage={currentView} onNavigate={navigate}>
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
            <LevelSelectionPage onSelectSD={showChooseSelectionPage} onSelectTK={showHomePage} />
          </motion.div>
        );
      case 'chooseSelection':
        return (
          <motion.div key="chooseSelection" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <ChooseSelectionPage
              onSelectClass1={showHomePage}
              onSelectClass2={showHomePage}
              onSelectClass3_4={showHomePage}
              onSelectClass5={showHomePage}
              onSelectClass6={showHomePage}
            />
          </motion.div>
        );
      case 'matematika1':
        return (
          <motion.div key="matematika1" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <MatematikaPage onNavigate={navigate} />
          </motion.div>
        );
      case 'drawing':
        return (
          <motion.div key="drawing" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <DrawingPage onNavigate={navigate} />
          </motion.div>
        );
      case 'writing':
        return (
          <motion.div key="writing" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <WritingPage onNavigate={navigate} />
          </motion.div>
        );
      case 'interactiveStory': // <-- TAMBAHKAN CASE BARU
        return (
          <motion.div key="interactiveStory" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <InteractiveStoryPage onNavigate={navigate} />
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