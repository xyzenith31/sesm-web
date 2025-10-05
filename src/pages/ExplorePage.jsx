import React from 'react';
import { motion } from 'framer-motion';
import {
  FiAward, FiMap, FiBookOpen, FiPlay, FiChevronRight
} from 'react-icons/fi';
import { FaFlask, FaPalette } from 'react-icons/fa';
// PERBAIKAN: Langsung impor gambar logo di sini
import logoImage from '../assets/logo.png';

// Data untuk kartu fitur (tidak ada perubahan)
const features = [
  {
    icon: FiAward,
    title: "Tantangan Harian",
    description: "Selesaikan misi seru setiap hari dan dapatkan poin!",
    color: "from-amber-500 to-yellow-400",
  },
  {
    icon: FiMap,
    title: "Jelajah Dunia",
    description: "Kunjungi tempat-tempat baru di seluruh dunia lewat peta interaktif.",
    color: "from-sky-500 to-cyan-400",
  },
  {
    icon: FaFlask,
    title: "Lab Eksperimen",
    description: "Coba berbagai macam percobaan sains virtual yang aman.",
    color: "from-lime-500 to-green-400",
  },
  {
    icon: FaPalette,
    title: "Zona Kreatif",
    description: "Asah imajinasimu dengan menggambar, menulis, atau membuat musik.",
    color: "from-violet-500 to-purple-400",
  },
  {
    icon: FiBookOpen,
    title: "Cerita Interaktif",
    description: "Pilih alur ceritamu sendiri dan tentukan akhir kisahnya.",
    color: "from-rose-500 to-red-400",
  },
  {
    icon: FiPlay,
    title: "Game Edukasi",
    description: "Bermain sambil belajar? Tentu bisa! Coba game seru kami.",
    color: "from-orange-500 to-amber-400",
  }
];

// Komponen Kartu Fitur (tidak ada perubahan)
const FeatureCard = ({ icon: Icon, title, description, color, index }) => {
  return (
    <motion.div
      className={`relative rounded-2xl shadow-lg overflow-hidden cursor-pointer group bg-gradient-to-br ${color}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.05, y: -10, boxShadow: "0px 25px 40px -15px rgba(0,0,0,0.2)" }}
    >
      <div className="p-6 flex flex-col h-full">
        <div className={`bg-white/30 p-3 rounded-full self-start mb-4`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
        <p className="text-white/90 mt-2 text-sm flex-grow">{description}</p>
        <div className="mt-6 flex justify-end items-center text-white font-semibold">
          Coba Sekarang <FiChevronRight className="ml-1 group-hover:ml-3 transition-all" />
        </div>
      </div>
    </motion.div>
  );
};

const ExplorePage = () => {
  return (
    <>
      {/* Tampilan Mobile & Tablet */}
      <div className="md:hidden">
        <div className="min-h-screen bg-gray-50 pb-28">
          <header className="px-6 pt-10 pb-6 bg-gradient-to-b from-sesm-teal to-sesm-deep rounded-b-[3rem] shadow-lg">
            <div className="flex items-center space-x-3 text-white">
                {/* PERBAIKAN: Gunakan <img> langsung */}
                <img src={logoImage} alt="SESM Logo" className="w-16 h-16" />
                <div>
                    <h1 className="text-2xl font-bold tracking-wide">Jelajahi</h1>
                    <p className="text-xs opacity-80">Temukan hal-hal baru yang seru!</p>
                </div>
            </div>
          </header>

          <main className="px-6 mt-6">
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} index={index} />
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Tampilan Desktop */}
      <div className="hidden md:flex flex-col items-center w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full max-w-6xl mx-auto">
          <header className="flex items-center space-x-4 mb-10">
            {/* PERBAIKAN: Gunakan <img> langsung */}
            <img src={logoImage} alt="SESM Logo" className="w-24 h-24 object-contain" />
            <div>
              <h1 className="text-5xl font-bold text-sesm-deep tracking-wider">Jelajahi Dunia Belajar</h1>
              <p className="text-lg text-gray-500 mt-1">Temukan petualangan baru di setiap sudutnya.</p>
            </div>
          </header>

          <main>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} index={index} />
                ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ExplorePage;