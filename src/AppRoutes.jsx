import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigation } from './hooks/useNavigation';

// --- Impor semua halaman yang ada ---
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LevelSelectionPage from './pages/LevelSelectionPage';
import ChooseSelectionPage from './pages/ChooseSelectionPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import QuizPage from './pages/QuizPage';
import RankPage from './pages/RankPage';
import ExplorePage from './pages/ExplorePage';

// --- Impor halaman-halaman Mapel ---
import MatematikaPage from './pages/mapel/MatematikaPage';
import MembacaPage from './pages/mapel/MembacaPage';
import MenulisPage from './pages/mapel/MenulisPage';
import BerhitungPage from './pages/mapel/BerhitungPage';
import PendidikanAgamaIslamPage from './pages/mapel/PendidikanAgamaIslamPage';
import BahasaIndonesiaPage from './pages/mapel/BahasaIndonesiaPage';
import BahasaInggrisPage from './pages/mapel/BahasaInggrisPage';
import PKNPage from './pages/mapel/PKNPage';
import IPAPage from './pages/mapel/IPAPage';
import IPSPage from './pages/mapel/IPSPage';

// Komponen dan layout
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

  const onLoginSuccess = () => {};

  const handleSelectQuiz = (quizData) => {
    setSelectedQuiz(quizData);
    navigate('quizForm');
  };

  const handleCompleteQuiz = () => {
    setSelectedQuiz(null);
    navigate('quiz');
  };

  const renderView = () => {
    // --- (1) DAFTARKAN SEMUA VIEW YANG MENGGUNAKAN MAINLAYOUT DI SINI ---
    const viewsInMainLayout = [
      'home', 'explore', 'bookmark', 'profile', 'rank', 'quiz',
      // Tambahkan semua kunci navigasi mapel ke dalam array ini
      'matematika', 'membaca', 'menulis', 'berhitung', 'pai', 
      'bahasaIndonesia', 'bahasaInggris', 'pkn', 'ipa', 'ips'
    ];

    if (viewsInMainLayout.includes(currentView)) {
      let pageComponent;
      
      // --- (2) BUAT KONDISI UNTUK SETIAP HALAMAN ---
      if (currentView === 'home') pageComponent = <HomePage onNavigate={navigate} />;
      else if (currentView === 'explore') pageComponent = <ExplorePage onNavigate={navigate} />;
      else if (currentView === 'profile') pageComponent = <ProfilePage onNavigate={navigate} />;
      else if (currentView === 'quiz') pageComponent = <QuizPage onNavigate={navigate} onSelectQuiz={handleSelectQuiz} />;
      else if (currentView === 'rank') pageComponent = <RankPage onNavigate={navigate} />;
      // --- Kondisi untuk Halaman Mapel ---
      else if (currentView === 'matematika') pageComponent = <MatematikaPage onNavigate={navigate} />;
      else if (currentView === 'membaca') pageComponent = <MembacaPage onNavigate={navigate} />;
      else if (currentView === 'menulis') pageComponent = <MenulisPage onNavigate={navigate} />;
      else if (currentView === 'berhitung') pageComponent = <BerhitungPage onNavigate={navigate} />;
      else if (currentView === 'pai') pageComponent = <PendidikanAgamaIslamPage onNavigate={navigate} />;
      else if (currentView === 'bahasaIndonesia') pageComponent = <BahasaIndonesiaPage onNavigate={navigate} />;
      else if (currentView === 'bahasaInggris') pageComponent = <BahasaInggrisPage onNavigate={navigate} />;
      else if (currentView === 'pkn') pageComponent = <PKNPage onNavigate={navigate} />;
      else if (currentView === 'ipa') pageComponent = <IPAPage onNavigate={navigate} />;
      else if (currentView === 'ips') pageComponent = <IPSPage onNavigate={navigate} />;

      // --- (3) RENDER KOMPONEN DI DALAM MAINLAYOUT ---
      return (
        <MainLayout activePage={currentView} onNavigate={navigate}>
          <motion.div key={currentView} variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            {pageComponent}
          </motion.div>
        </MainLayout>
      );
    }

    // Switch case untuk halaman yang TIDAK menggunakan MainLayout
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