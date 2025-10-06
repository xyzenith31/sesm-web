import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import UserLayout from '../layouts/UserLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import axios from 'axios';

const ChooseSelectionPage = ({ onExit, onSelectClassSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State untuk loading

  // Fungsi untuk menyimpan jenjang SD dan kelas yang dipilih
  const saveUserLevelAndNavigate = async (kelas) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        onExit();
        return;
      }
      
      await axios.put(
        'http://localhost:8080/api/user/update-level',
        { jenjang: 'SD', kelas: kelas }, // Jenjang sudah pasti 'SD'
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Jika berhasil, panggil navigasi ke home
      if (onSelectClassSuccess) {
        onSelectClassSuccess();
      }

    } catch (error) {
      console.error("Gagal menyimpan kelas:", error);
      alert("Gagal menyimpan pilihan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const classes = [
    { label: 'KELAS 1', handler: () => saveUserLevelAndNavigate('1') },
    { label: 'KELAS 2', handler: () => saveUserLevelAndNavigate('2') },
    { label: 'KELAS 3', handler: () => saveUserLevelAndNavigate('3') },
    { label: 'KELAS 4', handler: () => saveUserLevelAndNavigate('4') },
    { label: 'KELAS 5', handler: () => saveUserLevelAndNavigate('5') },
    { label: 'KELAS 6', handler: () => saveUserLevelAndNavigate('6') },
  ];

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
        title="Keluar dari Pemilihan Kelas?"
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
                <h1 className="text-4xl font-bold tracking-wider">PILIH KELAS</h1>
              </div>
            </header>
            
            <main className="absolute top-[35%] left-0 right-0 bottom-0 flex items-center justify-center px-8 pb-8">
              <div className="grid grid-cols-2 gap-x-5 gap-y-6 w-full max-w-xs">
                {classes.map((classItem) => (
                  <motion.button 
                    key={classItem.label}
                    disabled={isLoading}
                    className="py-3 text-lg font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-2xl shadow-md disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={classItem.handler}
                  >
                    {classItem.label}
                  </motion.button>
                ))}
              </div>
            </main>
          </div>
        </div>

        {/* Tampilan Desktop */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 h-screen relative">
          {isLoading && <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center"><p>Menyimpan...</p></div>}
          <div className="text-center mb-12">
              <p className="text-2xl font-light text-gray-500 tracking-wider">Let's</p>
              <h1 className="text-5xl font-bold text-sesm-deep tracking-wider">PILIH KELAS</h1>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              {classes.map((classItem) => (
                  <motion.button 
                      key={classItem.label}
                      disabled={isLoading}
                      className="py-4 text-xl font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-2xl transition-all duration-300 hover:bg-sesm-deep hover:text-white active:scale-95 shadow-lg disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={classItem.handler}
                  >
                      {classItem.label}
                  </motion.button>
              ))}
          </div>
        </div>
      </UserLayout>
    </>
  );
};

export default ChooseSelectionPage;