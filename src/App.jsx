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
import InteractiveStoryPage from './pages/InteractiveStoryPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import StudyReportPage from './pages/StudyReportPage.jsx';
import AccountSettingsPage from './pages/AccountSettingsPage.jsx';
import RankPage from './pages/RankPage.jsx';

// Impor komponen dan layout
import MainLayout from './layouts/MainLayout.jsx';
import QuizForm from './components/QuizForm.jsx';

// 1. Impor AuthService untuk mengecek data user dari localStorage
import AuthService from './api/auth.js';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const navigate = (view) => setCurrentView(view);

  const handleSelectQuiz = (quizData) => {
    setSelectedQuiz(quizData);
    navigate('quizForm');
  };

  const handleCompleteQuiz = () => {
    setSelectedQuiz(null);
    navigate('quiz');
  };

  const showLoginPage = () => setCurrentView('login');
  const showRegisterPage = () => setCurrentView('register');
  const showHomePage = () => setCurrentView('home');

  // 2. Buat fungsi onLoginSuccess yang lebih pintar
  const onLoginSuccess = () => {
    const user = AuthService.getCurrentUser(); // Ambil data user yang baru login

    // Cek jika user sudah punya data 'jenjang' (bukan null atau undefined)
    if (user && user.jenjang) {
      // Jika sudah ada, langsung ke halaman utama
      setCurrentView('home');
    } else {
      // Jika belum ada (user baru), arahkan ke halaman pemilihan jenjang
      setCurrentView('levelSelection');
    }
  };

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
      'home', 'explore', 'bookmark', 'profile', 'activityLog', 'diary', 'dailyChallenge', 
      'creativeZone', 'studyReport', 'accountSettings', 'rank', 'quiz'
    ];

    if (viewsInMainLayout.includes(currentView)) {
      let pageComponent;

      if (currentView === 'home') pageComponent = <HomePage onNavigate={navigate} />;
      if (currentView === 'explore') pageComponent = <ExplorePage onNavigate={navigate} />;
      if (currentView === 'bookmark') pageComponent = <BookmarkPage />;
      if (currentView === 'profile') pageComponent = <ProfilePage onNavigate={navigate} />;
      if (currentView === 'rank') pageComponent = <RankPage onNavigate={navigate} />;
      if (currentView === 'studyReport') pageComponent = <StudyReportPage onNavigate={navigate} />;
      if (currentView === 'accountSettings') pageComponent = <AccountSettingsPage onNavigate={navigate} />;
      if (currentView === 'diary') pageComponent = <DiaryPage onNavigate={navigate} />;
      if (currentView === 'creativeZone') pageComponent = <CreativeZonePage onNavigate={navigate} />;
      if (currentView === 'dailyChallenge') pageComponent = <DailyChallengePage onNavigate={navigate} />;
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
      // 3. Ganti 'onLoginSuccess' di sini dengan fungsi yang baru
      case 'login': return <motion.div key="login" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}><LoginPage onSwitchToRegister={showRegisterPage} onLoginSuccess={onLoginSuccess} /></motion.div>;
      
      case 'register': return <motion.div key="register" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}><RegisterPage onSwitchToLogin={showLoginPage} /></motion.div>;
      
      // Navigasi dari halaman level selection tetap sama
      case 'levelSelection': return <motion.div key="levelSelection" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}><LevelSelectionPage onSelectSD={() => navigate('chooseSelection')} onSelectTK={showHomePage} onExit={showLoginPage} /></motion.div>;
      case 'chooseSelection': return <motion.div key="chooseSelection" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}><ChooseSelectionPage onExit={showLoginPage} onSelectClass1={showHomePage} onSelectClass2={showHomePage} onSelectClass3_4={showHomePage} onSelectClass5={showHomePage} onSelectClass6={showHomePage} /></motion.div>;

      // Case lainnya tidak berubah
      case 'matematika1': return <motion.div key="matematika1" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}><MatematikaPage onNavigate={navigate} /></motion.div>;
      case 'drawing': return <motion.div key="drawing" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}><DrawingPage onNavigate={navigate} /></motion.div>;
      case 'writing': return <motion.div key="writing" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}><WritingPage onNavigate={navigate} /></motion.div>;
      case 'interactiveStory': return <motion.div key="interactiveStory" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}><InteractiveStoryPage onNavigate={navigate} /></motion.div>;
      
      case 'quizForm':
        return (
          <motion.div key="quizForm" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <QuizForm quizData={selectedQuiz} onCompleteQuiz={handleCompleteQuiz} />
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