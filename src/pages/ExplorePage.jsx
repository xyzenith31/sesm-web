import React from 'react';
import { motion } from 'framer-motion';
import {
  FiAward,
  FiBookOpen,
  FiChevronRight,
  FiStar,
  FiHelpCircle,
} from 'react-icons/fi';
import { FaPalette, FaTrophy } from 'react-icons/fa';
import logoImage from '../assets/logo.png';

const features = [
  {
    id: 'dailyChallenge',
    icon: FiAward,
    title: "Tantangan Harian",
    description: "Selesaikan misi seru setiap hari dan dapatkan hadiah!",
    color: "from-amber-500 to-yellow-400",
    points: 150,
  },
  {
    id: 'creativeZone', // ID ini akan digunakan untuk navigasi
    icon: FaPalette,
    title: "Zona Kreatif",
    description: "Asah imajinasimu dengan menggambar, menulis, atau membuat musik.",
    color: "from-violet-500 to-purple-400",
    points: 110,
  },
  {
    id: 'interactiveStory',
    icon: FiBookOpen,
    title: "Cerita Interaktif",
    description: "Pilih alur ceritamu sendiri dan tentukan akhir kisahnya.",
    color: "from-rose-500 to-red-400",
    points: 100,
  },
  {
    id: 'quiz',
    icon: FiHelpCircle,
    title: "Kuis Pengetahuan",
    description: "Uji wawasanmu dengan berbagai kuis menarik.",
    color: "from-teal-500 to-cyan-400",
    points: 90,
  },
];

const FeatureCard = ({ icon: Icon, title, description, color, index, points, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`relative rounded-2xl shadow-xl overflow-hidden cursor-pointer group bg-gradient-to-br ${color}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.05, y: -10, boxShadow: "0px 25px 40px -15px rgba(0,0,0,0.3)" }}
    >
      <motion.div
        className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 font-bold text-white text-sm"
        initial={{scale: 0, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        transition={{delay: index * 0.15 + 0.5, type: 'spring'}}
      >
        <FiStar className="text-yellow-300"/>
        <span>{points}</span>
      </motion.div>

      <div className="p-6 flex flex-col h-full">
        <div className={`bg-white/30 p-3 rounded-full self-start mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
        <p className="text-white/90 mt-2 text-sm flex-grow">{description}</p>
        <div className="mt-6 flex justify-end items-center text-white font-semibold">
          Coba Sekarang <FiChevronRight className="ml-1 group-hover:ml-3 transition-all duration-300" />
        </div>
      </div>
    </motion.div>
  );
};

const ExplorePage = ({ onNavigate }) => {
  const totalPoints = 2500;

  const handleCardClick = (featureId) => {
    // Navigasi berdasarkan ID fitur
    if (featureId === 'dailyChallenge') {
      onNavigate('dailyChallenge');
    } else if (featureId === 'creativeZone') {
      onNavigate('creativeZone'); // <-- Navigasi ke halaman baru
    } else {
      alert('Fitur ini akan segera hadir!');
    }
  };

  return (
    <>
      {/* Tampilan Mobile & Tablet */}
      <div className="md:hidden">
        <div className="min-h-screen bg-gray-50 pb-28">
          <header className="px-6 pt-10 pb-8 bg-gradient-to-b from-sesm-teal to-sesm-deep rounded-b-[3rem] shadow-lg relative overflow-hidden">
            <motion.div
              className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full"
              animate={{scale: [1, 1.1, 1]}}
              transition={{duration: 3, repeat: Infinity}}
            />
            <motion.div
              className="absolute -bottom-5 -right-2 w-16 h-16 bg-white/10 rounded-full"
              animate={{scale: [1, 1.1, 1]}}
              transition={{duration: 4, repeat: Infinity, delay: 0.5}}
            />
            <div className="flex items-center space-x-3 text-white relative z-10">
                <motion.img
                  src={logoImage}
                  alt="SESM Logo"
                  className="w-16 h-16"
                  animate={{rotate: [0, 5, -5, 0]}}
                  transition={{duration: 4, repeat: Infinity, ease: "easeInOut"}}
                />
                <div>
                    <h1 className="text-2xl font-bold tracking-wide">Jelajahi</h1>
                    <p className="text-xs opacity-80">Temukan petualangan baru yang seru!</p>
                </div>
            </div>
            <motion.div
              className="mt-6 bg-white/20 backdrop-blur-sm p-3 rounded-xl flex items-center justify-between"
              initial={{opacity:0, y: 20}}
              animate={{opacity:1, y: 0}}
              transition={{delay: 0.2}}
            >
              <div className='text-white'>
                <p className='text-xs font-light'>Poin Kamu</p>
                <p className='text-xl font-bold tracking-wider'>{totalPoints.toLocaleString()}</p>
              </div>
              <FaTrophy className='text-yellow-300 text-3xl' />
            </motion.div>
          </header>

          <main className="px-6 mt-6">
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  {...feature}
                  index={index}
                  onClick={() => handleCardClick(feature.id)}
                />
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Tampilan Desktop */}
      <div className="hidden md:flex flex-col items-center w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full max-w-6xl mx-auto">
          <header className="flex items-center justify-between w-full mb-10">
            <div className='flex items-center space-x-4'>
              <motion.img
                src={logoImage}
                alt="SESM Logo"
                className="w-24 h-24 object-contain"
                whileHover={{rotate: 360}}
                transition={{duration: 1, ease: 'linear'}}
              />
              <div>
                <h1 className="text-5xl font-bold text-sesm-deep tracking-wider">Jelajahi Dunia Belajar</h1>
                <p className="text-lg text-gray-500 mt-1">Temukan petualangan baru di setiap sudutnya.</p>
              </div>
            </div>
            <motion.div
              className="bg-white p-4 rounded-2xl shadow-md flex items-center space-x-4"
              initial={{opacity:0, y: -20}}
              animate={{opacity:1, y: 0}}
              transition={{delay: 0.2, type: 'spring'}}
            >
              <FaTrophy className='text-yellow-400 text-4xl' />
              <div>
                <p className='text-sm font-semibold text-gray-500'>Total Poin</p>
                <p className='text-2xl font-bold text-sesm-deep'>{totalPoints.toLocaleString()}</p>
              </div>
            </motion.div>
          </header>

          <main>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    {...feature}
                    index={index}
                    onClick={() => handleCardClick(feature.id)}
                  />
                ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ExplorePage;