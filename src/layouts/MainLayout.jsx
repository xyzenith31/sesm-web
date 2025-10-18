import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SideBar from '../components/navigation/SideBar';
import BottomNavBar from '../components/navigation/BottomNavBar';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const MainLayout = ({ children, activePage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SideBar activePage={activePage} onNavigate={onNavigate} />
      <main className="md:ml-64 pb-28 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage} // Gunakan activePage sebagai key unik untuk trigger animasi
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNavBar activePage={activePage} onNavigate={onNavigate} />
    </div>
  );
};

export default MainLayout;