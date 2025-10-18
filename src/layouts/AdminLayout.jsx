import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SidebarGuru from '../components/navigation/SidebarGuru';

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

const AdminLayout = ({ children, activePage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      <SidebarGuru activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="flex-1 p-8 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage} // Key unik untuk memicu animasi
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
                className="flex flex-col flex-grow" // Tambahkan kelas ini agar motion div mengisi ruang
              >
                {children}
              </motion.div>
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;