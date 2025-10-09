import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import { FaBook } from 'react-icons/fa';

// --- Komponen Ikon SVG Kustom ---
const BahasaIndonesiaIcon = () => (
    <svg viewBox="0 0 64 64" className="w-12 h-12 text-red-500">
        <rect x="10" y="10" width="44" height="44" rx="5" fill="currentColor" fillOpacity="0.1"/>
        <path d="M20 20h24v4H20zM20 30h24v4H20zM20 40h16v4H20z" fill="currentColor"/>
    </svg>
);


// --- Data Bab ---
const biChapters = [
  { id: 1, title: 'Puisi dan Prosa', progress: 65, Icon: BahasaIndonesiaIcon, iconBgColor: 'bg-red-100' },
  { id: 2, title: 'Ide Pokok dan Kalimat Utama', progress: 50, Icon: BahasaIndonesiaIcon, iconBgColor: 'bg-red-100' },
  { id: 3, title: 'Menulis Surat dan Pengumuman', progress: 30, Icon: BahasaIndonesiaIcon, iconBgColor: 'bg-red-100' },
  { id: 4, title: 'Sinonim, Antonim, dan Majas', progress: 10, Icon: BahasaIndonesiaIcon, iconBgColor: 'bg-red-100' },
];

const BahasaIndonesiaPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Tampilan Mobile */}
      <div className="md:hidden flex flex-col h-screen">
        <header className="bg-sesm-teal pt-8 pb-4 px-6 rounded-b-[2.5rem] shadow-lg text-white">
            <div className="flex items-center mb-4">
                <motion.button onClick={() => onNavigate('home')} className="p-2 -ml-2 mr-2 rounded-full" whileTap={{ scale: 0.9, backgroundColor: 'rgba(255,255,255,0.1)'}}>
                    <FiArrowLeft size={24} />
                </motion.button>
            </div>
            <div className="relative mb-4">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800/60" size={20} />
                <input type="text" placeholder="Cari materi B. Indonesia..." className="w-full bg-white text-gray-800 placeholder:text-gray-500 rounded-full py-3 pl-12 pr-4 text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/50" />
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-wide">B. INDONESIA</h1>
                    <p className="text-sm opacity-90">Kurikulum SESM</p>
                </div>
                <FaBook size={40} className="opacity-80"/>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto pt-6 pb-6 px-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Semua bab</h2>
            <div className="space-y-4">
              {biChapters.map(({ id, title, progress, Icon, iconBgColor }) => (
                <motion.button key={id} className="w-full bg-white rounded-2xl p-3 flex items-center space-x-4 shadow-sm border border-gray-200/80 text-left" whileTap={{ scale: 0.97, backgroundColor: '#f9fafb' }}>
                  <div className={`w-16 h-16 flex items-center justify-center rounded-xl ${iconBgColor} flex-shrink-0`}>
                    <Icon />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sesm-deep text-md">{title}</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-sesm-sky h-2 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
        </main>
      </div>
      {/* Tampilan Desktop */}
      <div className="hidden md:flex flex-col items-center w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full max-w-2xl mx-auto">
          <header className="bg-white p-6 rounded-2xl shadow-md mb-8">
              <div className="flex items-center mb-4">
                  <motion.button onClick={() => onNavigate('home')} className="p-2 mr-4 rounded-full hover:bg-gray-100" whileTap={{ scale: 0.9 }}>
                      <FiArrowLeft size={24} className="text-gray-600" />
                  </motion.button>
                  <div className="flex-1">
                      <h1 className="text-3xl font-bold text-sesm-deep tracking-wide">BAHASA INDONESIA</h1>
                      <p className="text-md text-gray-500">Kurikulum SESM</p>
                  </div>
                  <FaBook size={40} className="text-sesm-teal"/>
              </div>
          </header>
          <main>
              <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Semua bab</h2>
              <div className="space-y-4">
                {biChapters.map(({ id, title, progress, Icon, iconBgColor }) => (
                  <motion.button key={id} className="w-full bg-white rounded-2xl p-4 flex items-center space-x-5 shadow-sm border border-transparent hover:border-sesm-teal transition-colors text-left" whileTap={{ scale: 0.98 }}>
                    <div className={`w-20 h-20 flex items-center justify-center rounded-xl ${iconBgColor} flex-shrink-0`}>
                      <Icon />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sesm-deep text-lg">{title}</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-sesm-sky h-2.5 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BahasaIndonesiaPage;