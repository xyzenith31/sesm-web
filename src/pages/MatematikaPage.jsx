import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { FaDice, FaCubes, FaShapes, FaCalculator } from 'react-icons/fa';
import logoSesm from '../assets/logo.png';

// Data untuk setiap bab/materi
const chapters = [
  {
    icon: FaCubes,
    title: 'Bilangan Sampai 10',
    progress: 0,
  },
  {
    icon: FaShapes,
    title: 'Bentuk Bentuk Bangunan',
    progress: 0,
  },
  {
    icon: FaCalculator,
    title: 'Perjumlahan Dan Pengurangan',
    progress: 0,
  },
];

// Komponen untuk kartu setiap bab
const ChapterCard = ({ icon: Icon, title, progress }) => (
  <motion.button
    className="w-full bg-white p-4 rounded-2xl shadow-md flex items-center space-x-4 text-left"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl text-gray-500">
      <Icon />
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-sesm-deep">{title}</h3>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div 
          className="bg-sesm-sky h-2 rounded-full" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </motion.button>
);

const MatematikaPage = () => {
  return (
    <>
      {/* ====================================================== */}
      {/* ============ TAMPILAN KHUSUS MOBILE  =========== */}
      {/* ====================================================== */}
      <div className="md:hidden">
        <div className="min-h-screen bg-gray-100 pb-28">
          {/* Header dengan gradien */}
          <header className="bg-gradient-to-b from-sesm-teal to-sesm-deep text-white p-6 pb-8 rounded-b-[2.5rem] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <img src={logoSesm} alt="Logo" className="w-10 h-10" />
              {/* Placeholder untuk Dynamic Island */}
              <div className="w-24 h-6 bg-black/30 rounded-full"></div>
            </div>
            <div className="relative mb-4">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
                <input 
                    type="text" 
                    placeholder="Coba Cari Materimu di sini" 
                    className="w-full bg-white/20 text-white placeholder:text-white/70 rounded-full py-3 pl-12 pr-4 text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/50"
                />
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-wide">MATEMATIKA</h1>
                    <p className="text-sm opacity-90">Kelas 1 Kurikulum SESM</p>
                </div>
                <FaDice size={40} className="opacity-80"/>
            </div>
          </header>

          {/* Konten Utama */}
          <main className="px-6 -mt-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Semua bab</h2>
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ChapterCard {...chapter} />
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* ====================================================== */}
      {/* ============= TAMPILAN KHUSUS DESKTOP ================ */}
      {/* ====================================================== */}
      <div className="hidden md:flex flex-col items-center w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-10">
            <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-sesm-teal to-sesm-deep rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <FaDice size={50}/>
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-sesm-deep tracking-wide">MATEMATIKA</h1>
                    <p className="text-lg text-gray-500">Kelas 1 Kurikulum SESM</p>
                </div>
            </div>
            <div className="relative w-1/3">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari bab..." 
                className="w-full bg-white border border-gray-300 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-sesm-deep"
              />
            </div>
          </header>

          <main>
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Semua bab</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {chapters.map((chapter, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ChapterCard {...chapter} />
                    </motion.div>
                 ))}
             </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MatematikaPage;