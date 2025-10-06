import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import UserLayout from '../layouts/UserLayout';
import ConfirmationModal from '../components/ConfirmationModal';

const LevelSelectionPage = ({ onSelectSD, onSelectTK, onExit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSDClick = () => {
    if (onSelectSD) {
      onSelectSD();
    }
  };

  const handleTKClick = () => {
    if (onSelectTK) {
        onSelectTK();
    }
  };

  const handleExitClick = () => {
    setIsModalOpen(true);
  };

  const confirmExit = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmExit}
        title="Keluar dari Pemilihan Jenjang?"
        message="Anda akan kembali ke halaman login. Apakah Anda yakin?"
        confirmText="Ya, Keluar"
      />
      <UserLayout>
        {/* ====================================================== */}
        {/* ============ TAMPILAN KHUSUS MOBILE & TABLET =========== */}
        {/* ====================================================== */}
        <div className="md:hidden">
          <div className="relative min-h-screen bg-white overflow-hidden">
            <header className="absolute top-0 left-0 right-0 h-[38%] bg-gradient-to-b from-sesm-teal to-sesm-deep rounded-b-[4rem] text-white p-6 z-10 flex flex-col justify-between">
              {/* Tombol titik tiga dan div placeholder dihilangkan, hanya menyisakan tombol X */}
              <div className="flex justify-end items-center mt-2">
                <button onClick={handleExitClick} className="text-white"><FiX size={28} /></button>
              </div>
              <div className="ml-2 mb-4">
                <p className="text-2xl font-light tracking-wider">Let's</p>
                <h1 className="text-4xl font-bold tracking-wider">PILIH JENJANG</h1>
              </div>
            </header>
            
            <main className="absolute top-[38%] left-0 right-0 bottom-0 flex flex-col items-center justify-center space-y-6 px-8">
              <motion.button 
                onClick={handleTKClick}
                className="w-full max-w-xs py-4 text-xl font-bold text-white bg-sesm-deep border-2 border-sesm-deep rounded-full shadow-lg"
              >
                TK
              </motion.button>
              <motion.button 
                className="w-full max-w-xs py-4 text-xl font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-full shadow-lg"
                onClick={handleSDClick}
              >
                SD
              </motion.button>
            </main>
            {/* BottomNavBar telah dihilangkan dari sini */}
          </div>
        </div>

        {/* ====================================================== */}
        {/* ============= TAMPILAN KHUSUS DESKTOP ================ */}
        {/* ====================================================== */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 h-screen">
          <div className="text-center mb-12">
              <p className="text-2xl font-light text-gray-500 tracking-wider">Let's</p>
              <h1 className="text-5xl font-bold text-sesm-deep tracking-wider">PILIH JENJANG</h1>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-xs">
              <motion.button 
                  onClick={handleTKClick}
                  className="w-full py-4 text-xl font-bold text-white bg-sesm-deep border-2 border-sesm-deep rounded-full transition-all duration-300 hover:opacity-90 active:scale-95 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              >
                  TK
              </motion.button>
              <motion.button 
                  className="w-full py-4 text-xl font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-full transition-all duration-300 hover:bg-sesm-deep hover:text-white active:scale-95 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSDClick}
              >
                  SD
              </motion.button>
          </div>
        </div>
      </UserLayout>
    </>
  );
};

export default LevelSelectionPage;