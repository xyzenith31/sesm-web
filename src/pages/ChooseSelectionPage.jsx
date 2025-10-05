import React from 'react';
import { motion } from 'framer-motion';
import { FiMoreHorizontal, FiX } from 'react-icons/fi';
import BottomNavBar from '../components/BottomNavBar';
import UserLayout from '../layouts/UserLayout';

// 1. Terima semua prop navigasi untuk setiap kelas
const ChooseSelectionPage = ({
  onSelectClass1,
  onSelectClass2,
  onSelectClass3_4,
  onSelectClass5,
  onSelectClass6,
}) => {
  // Buat array objek untuk memetakan label ke handler-nya
  const classes = [
    { label: 'KELAS 1', handler: onSelectClass1 },
    { label: 'KELAS 2', handler: onSelectClass2 },
    { label: 'KELAS 3', handler: onSelectClass3_4 },
    { label: 'KELAS 4', handler: onSelectClass3_4 }, // Kelas 4 menggunakan handler yang sama dengan kelas 3
    { label: 'KELAS 5', handler: onSelectClass5 },
    { label: 'KELAS 6', handler: onSelectClass6 },
  ];

  // 2. Handler ini akan memanggil fungsi spesifik yang diterima dari props
  const handleClassSelect = (handler) => {
    if (handler) {
      handler();
    }
  };

  return (
    <UserLayout>
      {/* Tampilan Mobile & Tablet */}
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
              {classes.map((classItem) => (
                <motion.button 
                  key={classItem.label}
                  className="py-3 text-lg font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-2xl shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  // 3. Panggil handleClassSelect dengan handler yang sesuai untuk setiap tombol
                  onClick={() => handleClassSelect(classItem.handler)}
                >
                  {classItem.label}
                </motion.button>
              ))}
            </div>
          </main>
          <BottomNavBar />
        </div>
      </div>

      {/* Tampilan Desktop */}
      <div className="hidden md:flex flex-col items-center justify-center p-8 h-screen">
        <div className="text-center mb-12">
            <p className="text-2xl font-light text-gray-500 tracking-wider">Let's</p>
            <h1 className="text-5xl font-bold text-sesm-deep tracking-wider">PILIH KELAS</h1>
        </div>
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            {classes.map((classItem) => (
                <motion.button 
                    key={classItem.label}
                    className="py-4 text-xl font-bold text-sesm-deep bg-white border-2 border-sesm-deep rounded-2xl transition-all duration-300 hover:bg-sesm-deep hover:text-white active:scale-95 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClassSelect(classItem.handler)}
                >
                    {classItem.label}
                </motion.button>
            ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default ChooseSelectionPage;