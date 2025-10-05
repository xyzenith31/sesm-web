import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiZap, FiGift, FiClock, FiCheckCircle, FiAward } from 'react-icons/fi';
import { FaCalculator, FaBook, FaFlask } from 'react-icons/fa';

// Data dummy untuk tantangan harian
const dailyChallengesData = [
  { 
    id: 1, 
    icon: FaCalculator, 
    category: 'Matematika', 
    title: 'Raja Perkalian', 
    description: 'Selesaikan 5 soal perkalian di Bank Buku.', 
    points: 50, 
    completed: false 
  },
  { 
    id: 2, 
    icon: FaBook, 
    category: 'B. Indonesia', 
    title: 'Jago Membaca', 
    description: 'Baca 1 cerita interaktif sampai tamat.', 
    points: 40, 
    completed: false 
  },
  { 
    id: 3, 
    icon: FaFlask, 
    category: 'Sains', 
    title: 'Eksperimen Seru', 
    description: 'Coba 1 percobaan di Lab Eksperimen.', 
    points: 60, 
    completed: false 
  },
];

// Komponen untuk setiap item tantangan
const ChallengeItem = ({ challenge, onComplete }) => {
  const { icon: Icon, title, description, points, completed } = challenge;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
      className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
        completed ? 'bg-green-100/70' : 'bg-white shadow-sm'
      }`}
    >
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl ${
          completed ? 'bg-green-400' : 'bg-sesm-sky'
      }`}>
        <Icon />
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-gray-800">{title}</h4>
        <p className="text-xs text-gray-500">{description}</p>
        <div className="flex items-center text-sm font-bold text-amber-500 mt-1">
          <FiAward className="mr-1" />
          <span>{points} Poin</span>
        </div>
      </div>
      <motion.button
        onClick={() => onComplete(challenge.id)}
        disabled={completed}
        className={`w-24 h-10 text-sm font-bold rounded-lg text-white transition-all duration-300 flex items-center justify-center ${
          completed ? 'bg-green-500 cursor-not-allowed' : 'bg-sesm-deep hover:bg-opacity-90'
        }`}
        whileTap={!completed ? { scale: 0.95 } : {}}
      >
        {completed ? <FiCheckCircle /> : 'Selesai'}
      </motion.button>
    </motion.div>
  );
};

// Komponen utama halaman
const DailyChallengePage = ({ onNavigate }) => {
  const [challenges, setChallenges] = useState(dailyChallengesData);
  const [timeLeft, setTimeLeft] = useState('23:59:59');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay - now;

      const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const m = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      
      setTimeLeft(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleComplete = (id) => {
    setChallenges(challenges.map(c => c.id === id ? { ...c, completed: true } : c));
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;
  const progress = (completedCount / totalCount) * 100;
  const allCompleted = completedCount === totalCount;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-gray-100">
          <FiArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep flex items-center justify-center">
          <FiZap className="mr-2 text-yellow-500" /> Tantangan Harian
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow overflow-y-auto p-6 space-y-6">
        {/* Progress and Timer Section */}
        <motion.div 
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          className="bg-white rounded-xl shadow-md p-5"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="font-bold text-gray-800">Progress Hari Ini</p>
            <p className="font-bold text-sesm-deep">{completedCount}/{totalCount}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-gradient-to-r from-green-400 to-cyan-400 h-2.5 rounded-full"
              initial={{width: 0}}
              animate={{width: `${progress}%`}}
              transition={{duration: 0.5, ease: 'easeOut'}}
            />
          </div>
          <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
            <FiClock className="mr-2"/>
            <span>Tantangan baru dalam: <span className='font-bold text-sesm-teal'>{timeLeft}</span></span>
          </div>
        </motion.div>

        {/* Main Reward Card */}
        <motion.div 
          initial={{opacity: 0, scale: 0.9}}
          animate={{opacity: 1, scale: 1}}
          transition={{delay: 0.2}}
          className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-6 rounded-2xl shadow-lg text-center flex flex-col items-center"
        >
          <FiGift size={40} className="mb-2"/>
          <h3 className="text-lg font-bold">Hadiah Spesial Hari Ini!</h3>
          <p className="text-sm opacity-90 mb-3">Selesaikan semua tantangan untuk mendapatkan 200 Poin bonus!</p>
          <AnimatePresence>
          {allCompleted && (
            <motion.div
              initial={{scale: 0.8, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              className="mt-2 bg-yellow-400 text-sesm-deep font-bold px-4 py-2 rounded-full flex items-center"
            >
                <FiCheckCircle className="mr-2"/> KLAIM HADIAH
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
        
        {/* Challenges List */}
        <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">Daftar Tantangan</h2>
            <div className="space-y-4">
                <AnimatePresence>
                    {challenges.map(challenge => (
                        <ChallengeItem key={challenge.id} challenge={challenge} onComplete={handleComplete} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
      </main>
    </div>
  );
};

export default DailyChallengePage;