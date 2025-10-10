import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigation } from './hooks/useNavigation';

// --- Impor semua halaman ---
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
import AccountSettingsPage from './pages/AccountSettingsPage';
import BookmarkPage from './pages/BookmarkPage';

// Halaman Mapel
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
import WorksheetPage from './pages/WorksheetPage';

// --- Impor Halaman dan Layout Guru ---
import AdminLayout from './layouts/AdminLayout';
import DashboardGuru from './pages/admin/DashboardGuru';
import ManajemenMateri from './pages/admin/ManajemenMateri';
import ManajemenNilai from './pages/admin/ManajemenNilai';
import ManajemenKuis from './pages/admin/ManajemenKuis';
import EvaluasiKuis from './pages/admin/EvaluasiKuis'; // <-- 1. Impor halaman baru

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

function App() {
  const { currentView, navigate } = useNavigation();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedChapterInfo, setSelectedChapterInfo] = useState(null);

  const handleSelectQuiz = (quizData) => {
    setSelectedQuiz(quizData);
    navigate('quizForm');
  };

  const handleCompleteQuiz = () => {
    setSelectedQuiz(null);
    navigate('quiz');
  };

  const handleNavigateToWorksheet = (chapterInfo) => {
    setSelectedChapterInfo(chapterInfo);
    navigate('worksheet');
  };

  const renderView = () => {
    const subjectPageProps = {
        onNavigate: navigate,
        onNavigateToWorksheet: handleNavigateToWorksheet,
    };

    const viewsInMainLayout = [
      'home', 'explore', 'bookmark', 'profile', 'rank', 'quiz',
      'matematika', 'membaca', 'menulis', 'berhitung', 'pai',
      'bahasaIndonesia', 'bahasaInggris', 'pkn', 'ipa', 'ips',
      'accountSettings'
    ];

    // --- 2. Tambahkan 'evaluasiKuis' ke dalam daftar ---
    const viewsInAdminLayout = ['dashboardGuru', 'manajemenMateri', 'manajemenNilai', 'manajemenKuis', 'evaluasiKuis'];

    if (viewsInMainLayout.includes(currentView)) {
      let pageComponent;
      const pageMap = {
        home: <HomePage onNavigate={navigate} />,
        explore: <ExplorePage onNavigate={navigate} />,
        profile: <ProfilePage onNavigate={navigate} />,
        quiz: <QuizPage onNavigate={navigate} onSelectQuiz={handleSelectQuiz} />,
        rank: <RankPage onNavigate={navigate} />,
        bookmark: <BookmarkPage onNavigate={navigate} />,
        accountSettings: <AccountSettingsPage onNavigate={navigate} />,
        matematika: <MatematikaPage {...subjectPageProps} />,
        membaca: <MembacaPage {...subjectPageProps} />,
        menulis: <MenulisPage {...subjectPageProps} />,
        berhitung: <BerhitungPage {...subjectPageProps} />,
        pai: <PendidikanAgamaIslamPage {...subjectPageProps} />,
        bahasaIndonesia: <BahasaIndonesiaPage {...subjectPageProps} />,
        bahasaInggris: <BahasaInggrisPage {...subjectPageProps} />,
        pkn: <PKNPage {...subjectPageProps} />,
        ipa: <IPAPage {...subjectPageProps} />,
        ips: <IPSPage {...subjectPageProps} />,
      };
      pageComponent = pageMap[currentView] || <HomePage onNavigate={navigate} />;

      return (
        <MainLayout activePage={currentView} onNavigate={navigate}>
          <motion.div key={currentView} variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            {pageComponent}
          </motion.div>
        </MainLayout>
      );
    }

    if (viewsInAdminLayout.includes(currentView)) {
      let pageComponent;
      if (currentView === 'dashboardGuru') pageComponent = <DashboardGuru />;
      if (currentView === 'manajemenMateri') pageComponent = <ManajemenMateri />;
      if (currentView === 'manajemenNilai') pageComponent = <ManajemenNilai />;
      if (currentView === 'manajemenKuis') pageComponent = <ManajemenKuis />;
      if (currentView === 'evaluasiKuis') pageComponent = <EvaluasiKuis />; // <-- 3. Tambahkan kondisinya

      return (
        <AdminLayout activePage={currentView} onNavigate={navigate}>
          <motion.div key={currentView} variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            {pageComponent}
          </motion.div>
        </AdminLayout>
      );
    }

    switch (currentView) {
      case 'login':
        return <LoginPage onSwitchToRegister={() => navigate('register')} />;
      case 'register':
        return <RegisterPage onSwitchToLogin={() => navigate('login')} />;
      case 'levelSelection':
        return <LevelSelectionPage onSelectSD={() => navigate('chooseSelection')} onSelectTK={() => navigate('home')} onExit={() => navigate('login')} />;
      case 'chooseSelection':
        return <ChooseSelectionPage onExit={() => navigate('login')} onSelectClass1={() => navigate('home')} onSelectClass2={() => navigate('home')} onSelectClass3_4={() => navigate('home')} onSelectClass5={() => navigate('home')} onSelectClass6={() => navigate('home')} />;
      case 'quizForm':
        return <QuizForm quizData={selectedQuiz} onCompleteQuiz={handleCompleteQuiz} />;
      case 'worksheet':
        return <WorksheetPage onNavigate={navigate} chapterInfo={selectedChapterInfo} />;
      default:
        return <WelcomePage onExplore={() => navigate('login')} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderView()}
    </AnimatePresence>
  );
}

export default App;