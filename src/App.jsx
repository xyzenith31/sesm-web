import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import AuthService from './services/auth.service';

import WelcomePage from './pages/WelcomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LevelSelectionPage from './pages/LevelSelectionPage.jsx';
import ChooseSelectionPage from './pages/ChooseSelectionPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import BookmarkPage from './pages/BookmarkPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import MatematikaPage from './pages/MatematikaPage.jsx';

import MainLayout from './layouts/MainLayout.jsx';

const PrivateRoute = () => {
  const user = AuthService.getCurrentUser();
  return user ? <Outlet /> : <Navigate to="/login" />;
};

const PublicRoute = () => {
  const user = AuthService.getCurrentUser();
  return user ? <Navigate to="/home" /> : <Outlet />;
};

const AppLayout = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};


function App() {
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
          {/* Rute Publik (Hanya bisa diakses sebelum login) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Rute Privat (Hanya bisa diakses setelah login) */}
          <Route element={<PrivateRoute />}>
            {/* Rute yang menggunakan MainLayout (dengan bottom nav bar) */}
            <Route element={<AppLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/bookmark" element={<BookmarkPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/quiz" element={<QuizPage />} />
              {/* Tambahkan halaman lain yang pakai MainLayout di sini */}
            </Route>

            {/* Rute yang tidak menggunakan MainLayout (halaman penuh) */}
            <Route path="/level-selection" element={<LevelSelectionPage />} />
            <Route path="/choose-selection" element={<ChooseSelectionPage />} />
            <Route path="/matematika1" element={<MatematikaPage />} />
            
            {/* Tambahkan halaman privat lain yang tidak pakai MainLayout di sini */}
          </Route>
          
          {/* Fallback jika URL tidak ditemukan */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;