import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigation } from './hooks/useNavigation';

// Impor semua halaman
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LevelSelectionPage from './pages/LevelSelectionPage';
import ChooseSelectionPage from './pages/ChooseSelectionPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
// ... (Impor semua halaman lainnya)
import RankPage from './pages/RankPage';

// Impor komponen dan layout
import MainLayout from './layouts/MainLayout';
import QuizForm from './components/QuizForm';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.98 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.4,
};

const AppRoutes = () => {
  const { currentView, navigate } = useNavigation();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const onLoginSuccess = () => {
    // Navigasi sudah dihandle oleh `useNavigation` hook
  };

  const handleSelectQuiz = (quizData) => {
    setSelectedQuiz(quizData);
    navigate('quizForm');
  };

  const handleCompleteQuiz = () => {
    setSelectedQuiz(null);
    navigate('quiz');
  };

  const renderView = () => {
    const viewsInMainLayout = [
      'home', 'explore', 'bookmark', 'profile', 'activityLog', 'diary',
      'dailyChallenge', 'creativeZone', 'studyReport', 'accountSettings', 'rank', 'quiz'
    ];

    if (viewsInMainLayout.includes(currentView)) {
      let pageComponent;
      if (currentView === 'home') pageComponent = <HomePage onNavigate={navigate} />;
      if (currentView === 'explore') pageComponent = <ExplorePage onNavigate={navigate} />;
      // ... (tambahkan sisa halaman di MainLayout di sini)
      if (currentView === 'profile') pageComponent = <ProfilePage onNavigate={navigate} />;
      if (currentView === 'quiz') pageComponent = <QuizPage onNavigate={navigate} onSelectQuiz={handleSelectQuiz} />;


      return (
        <MainLayout activePage={currentView} onNavigate={navigate}>
          <motion.div key={currentView} variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            {pageComponent}
          </motion.div>
        </MainLayout>
      );
    }

    switch (currentView) {
      case 'login':
        return <LoginPage onSwitchToRegister={() => navigate('register')} onLoginSuccess={onLoginSuccess} />;
      case 'register':
        return <RegisterPage onSwitchToLogin={() => navigate('login')} />;
      case 'levelSelection':
        return <LevelSelectionPage onSelectSD={() => navigate('chooseSelection')} onSelectTK={() => navigate('home')} onExit={() => navigate('login')} />;
      case 'chooseSelection':
        return <ChooseSelectionPage onExit={() => navigate('login')} onSelectClass1={() => navigate('home')} onSelectClass2={() => navigate('home')} onSelectClass3_4={() => navigate('home')} onSelectClass5={() => navigate('home')} onSelectClass6={() => navigate('home')} />;
      case 'quizForm':
        return <QuizForm quizData={selectedQuiz} onCompleteQuiz={handleCompleteQuiz} />;
      // ... (tambahkan halaman lain yang tidak menggunakan MainLayout di sini)
      default:
        return <WelcomePage onExplore={() => navigate('login')} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentView} variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
};

export default AppRoutes;