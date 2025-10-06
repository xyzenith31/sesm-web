import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import UserLayout from '../layouts/UserLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import axios from 'axios';

const LevelSelectionPage = ({ onSelectSD, onSelectTK, onExit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State untuk loading

  // Fungsi untuk menyimpan pilihan ke backend
  const saveUserLevelAndNavigate = async (jenjang, kelas, nextAction) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        console.error("Token tidak ditemukan, proses dibatalkan.");
        onExit(); // Jika tidak ada token, paksa keluar
        return;
      }

      // Kirim data ke backend
      await axios.put(
        'http://localhost:8080/api/user/update-level',
        { jenjang, kelas },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Jika berhasil, jalankan aksi selanjutnya (pindah halaman)
      if (nextAction) {
        nextAction();
      }

    } catch (error) {
      console.error("Gagal menyimpan jenjang:", error);
      alert("Gagal menyimpan pilihan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSDClick = () => {
    if (onSelectSD) {
      onSelectSD(); // Hanya pindah ke halaman pilih kelas, belum menyimpan
    }
  };

  const handleTKClick = () => {
    // Untuk TK, langsung simpan jenjang 'TK' dan kelas 'TK', lalu pindah ke home
    saveUserLevelAndNavigate('TK', 'TK', onSelectTK);
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
        {/* Tampilan Mobile */}
        <div className="md:hidden">
          <div className="relative min-h-screen bg-white overflow-hidden">
            {isLoading && <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center"><p>Menyimpan...</p></div>}
            <header className="absolute top-0 left-0 right-0 h-[38%] bg-gradient-to-b from-sesm-teal to-sesm-deep rounded-b-[4rem] text-white p-6 z-10 flex flex-col justify-between">
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
                disabled={isLoading}
                className="w-full max-w-xs py-4 text-xl font-bold text-white bg-sesm-deep border-2 border-sesm-deep rounded-full shadow-lg disabled:opacity-50"
              >
                TK
              </motion.button>
              <motion.button 
                onClick={handleSDClick}
                disabled={isLoading}
                className="w-full max-w-xs py-4 text-xl font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-full shadow-lg disabled:opacity-50"
              >
                SD
              </motion.button>
            </main>
          </div>
        </div>

        {/* Tampilan Desktop */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 h-screen relative">
          {isLoading && <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center"><p>Menyimpan...</p></div>}
          <div className="text-center mb-12">
              <p className="text-2xl font-light text-gray-500 tracking-wider">Let's</p>
              <h1 className="text-5xl font-bold text-sesm-deep tracking-wider">PILIH JENJANG</h1>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-xs">
              <motion.button 
                  onClick={handleTKClick}
                  disabled={isLoading}
                  className="w-full py-4 text-xl font-bold text-white bg-sesm-deep border-2 border-sesm-deep rounded-full transition-all duration-300 hover:opacity-90 active:scale-95 shadow-lg disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              >
                  TK
              </motion.button>
              <motion.button 
                  onClick={handleSDClick}
                  disabled={isLoading}
                  className="w-full py-4 text-xl font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-full transition-all duration-300 hover:bg-sesm-deep hover:text-white active:scale-95 shadow-lg disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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