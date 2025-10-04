import React from 'react';
import { motion } from 'framer-motion';
import { FiMoreHorizontal, FiX } from 'react-icons/fi';
import BottomNavBar from '../components/BottomNavBar';
import UserLayout from '../layouts/UserLayout';

// 1. Terima prop onSelectionComplete
const ChooseSelectionPage = ({ onSelectionComplete }) => {
  const classes = [
    'KELAS 1', 'KELAS 2', 'KELAS 3',
    'KELAS 4', 'KELAS 5', 'KELAS 6'
  ];

  // 2. Buat fungsi handler untuk menangani klik
  const handleClassSelect = () => {
    if (onSelectionComplete) {
      onSelectionComplete(); // Panggil fungsi navigasi
    }
  };

  return (
    <UserLayout>
      {/* ====================================================== */}
      {/* ============ TAMPILAN KHUSUS MOBILE & TABLET =========== */}
      {/* ====================================================== */}
      <div className="md:hidden">
        <div className="relative min-h-screen bg-white overflow-hidden">
          <header className="absolute top-0 left-0 right-0 h-[38%] bg-gradient-to-b from-sesm-teal to-sesm-deep rounded-b-[4rem] text-white p-6 z-10 flex flex-col justify-between">
            <div className="flex justify-between items-center mt-2">
              <button className="text-white"><FiMoreHorizontal size={28} /></button>
              <div className="w-20 h-8 bg-black/30 rounded-full"></div>
              <button className="text-white"><FiX size={28} /></button>
            </div>
            <div className="ml-2 mb-4">
              <p className="text-2xl font-light tracking-wider">Let's</p>
              <h1 className="text-4xl font-bold tracking-wider">PILIH KELAS</h1>
            </div>
          </header>
          
          <main className="absolute top-[35%] left-0 right-0 bottom-0 flex items-center justify-center px-8 pb-32">
            <div className="grid grid-cols-2 gap-x-5 gap-y-6 w-full max-w-xs">
              {classes.map((className) => (
                <motion.button 
                  key={className}
                  className="py-3 text-lg font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-2xl shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClassSelect} // 3. Tambahkan onClick di sini
                >
                  {className}
                </motion.button>
              ))}
            </div>
          </main>

          <BottomNavBar />
        </div>
      </div>

      {/* ====================================================== */}
      {/* ============= TAMPILAN KHUSUS DESKTOP ================ */}
      {/* ====================================================== */}
      <div className="hidden md:flex flex-col items-center justify-center p-8 h-screen">
        <div className="text-center mb-12">
            <p className="text-2xl font-light text-gray-500 tracking-wider">Let's</p>
            <h1 className="text-5xl font-bold text-sesm-deep tracking-wider">PILIH KELAS</h1>
        </div>
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            {classes.map((className) => (
                <motion.button 
                    key={className}
                    className="py-4 text-xl font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-2xl transition-all duration-300 hover:bg-sesm-deep hover:text-white active:scale-95 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClassSelect} // 3. Tambahkan onClick di sini juga
                >
                    {className}
                </motion.button>
            ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default ChooseSelectionPage;