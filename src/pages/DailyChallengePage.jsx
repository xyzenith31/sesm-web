import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 1. Impor createPortal
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiZap, FiGift, FiClock, FiCheckCircle, FiAward } from 'react-icons/fi';
import { FaCalculator, FaBook, FaFlask, FaTrophy } from 'react-icons/fa';
import ChallengeModal from '../components/ChallengeModal';

// --- Komponen Notifikasi Klaim Hadiah (Diperbarui dengan Portal) ---
const RewardNotification = ({ onClose }) => createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
      >
        <FiAward className="mx-auto text-5xl text-yellow-400 mb-4" />
        <h3 className="text-xl font-bold text-sesm-deep mb-2">Selamat!</h3>
        <p className="text-gray-600 mb-6">Anda berhasil menyelesaikan semua tantangan harian dan mendapatkan 200 poin bonus!</p>
        <motion.button
          onClick={onClose}
          className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg"
          whileTap={{ scale: 0.95 }}
        >
          Oke
        </motion.button>
      </motion.div>
    </motion.div>,
    document.body // Render di body
);


// Data dummy (tidak berubah)
const dailyChallengesData = [
    {
      id: 1,
      icon: FaCalculator,
      category: 'Matematika',
      title: 'Raja Perkalian',
      description: 'Selesaikan 1 soal perkalian di bawah ini.',
      points: 50,
      completed: false,
      quiz: {
        question: "Berapa hasil dari 8 x 7?",
        options: ["54", "56", "64", "62"],
        correctAnswer: "56",
      }
    },
    {
      id: 2,
      icon: FaBook,
      category: 'B. Indonesia',
      title: 'Jago Kosakata',
      description: 'Tebak arti dari kata berikut.',
      points: 40,
      completed: false,
      quiz: {
          question: "Apa sinonim dari kata 'Cepat'?",
          options: ["Lambat", "Lekas", "Lama", "Sering"],
          correctAnswer: "Lekas",
      }
    },
    {
      id: 3,
      icon: FaFlask,
      category: 'Sains',
      title: 'Ahli Planet',
      description: 'Jawab pertanyaan tentang tata surya.',
      points: 60,
      completed: false,
      quiz: {
          question: "Planet apa yang dikenal sebagai 'Planet Merah'?",
          options: ["Venus", "Mars", "Jupiter", "Saturnus"],
          correctAnswer: "Mars",
      }
    },
];

// Komponen Item Tantangan (tidak berubah)
const ChallengeItem = ({ challenge, onStart }) => {
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
        onClick={() => onStart(challenge.id)}
        disabled={completed}
        className={`w-24 h-10 text-sm font-bold rounded-lg text-white transition-all duration-300 flex items-center justify-center ${
          completed ? 'bg-green-500 cursor-not-allowed' : 'bg-sesm-deep hover:bg-opacity-90'
        }`}
        whileTap={!completed ? { scale: 0.95 } : {}}
      >
        {completed ? <FiCheckCircle /> : 'Kerjakan'}
      </motion.button>
    </motion.div>
  );
};


// Komponen Utama Halaman (tidak ada perubahan signifikan pada logika)
const DailyChallengePage = ({ onNavigate }) => {
  const [challenges, setChallenges] = useState(dailyChallengesData);
  const [timeLeft, setTimeLeft] = useState('23:59:59');
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [totalPoints, setTotalPoints] = useState(2500);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [showRewardNotification, setShowRewardNotification] = useState(false);

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

  const handleStartChallenge = (id) => {
    const challenge = challenges.find(c => c.id === id);
    setActiveChallenge(challenge);
  };
  
  const handleAnswerSubmit = (isCorrect) => {
    const pointsToAdd = isCorrect ? activeChallenge.points : Math.max(0, activeChallenge.points - 15);
    
    setTotalPoints(currentTotal => currentTotal + pointsToAdd);

    setChallenges(challenges.map(c => 
      c.id === activeChallenge.id 
        ? { ...c, completed: true, points: pointsToAdd } 
        : c
    ));
    
    setActiveChallenge(null);
  };

  const handleClaimReward = () => {
    if (rewardClaimed) return;
    setTotalPoints(currentTotal => currentTotal + 200);
    setRewardClaimed(true);
    setShowRewardNotification(true);
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;
  const progress = (completedCount / totalCount) * 100;
  const allCompleted = completedCount === totalCount;

  return (
    <>
      <AnimatePresence>
        {activeChallenge && (
          <ChallengeModal 
            challenge={activeChallenge}
            onClose={() => setActiveChallenge(null)}
            onAnswerSubmit={handleAnswerSubmit}
          />
        )}
        {showRewardNotification && (
            <RewardNotification onClose={() => setShowRewardNotification(false)} />
        )}
      </AnimatePresence>

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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-2xl shadow-md flex items-center justify-between"
          >
            <div className='text-left'>
              <p className='text-sm font-semibold text-gray-500'>Total Poin Kamu</p>
              <p className='text-2xl font-bold text-sesm-deep'>{totalPoints.toLocaleString()}</p>
            </div>
            <FaTrophy className='text-yellow-400 text-4xl' />
          </motion.div>

          <motion.div 
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{ delay: 0.2 }}
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

          <motion.div 
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: 0.3}}
            className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-6 rounded-2xl shadow-lg text-center flex flex-col items-center"
          >
            <FiGift size={40} className="mb-2"/>
            <h3 className="text-lg font-bold">Hadiah Spesial Hari Ini!</h3>
            <p className="text-sm opacity-90 mb-3">Selesaikan semua tantangan untuk mendapatkan 200 Poin bonus!</p>
            <AnimatePresence>
            {allCompleted && (
              <motion.button
                onClick={handleClaimReward}
                disabled={rewardClaimed}
                initial={{scale: 0.8, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                whileTap={!rewardClaimed ? { scale: 0.95 } : {}}
                className={`mt-2 font-bold px-4 py-2 rounded-full flex items-center transition-colors ${
                    rewardClaimed
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-yellow-400 text-sesm-deep'
                }`}
              >
                  <FiCheckCircle className="mr-2"/> 
                  {rewardClaimed ? 'Sudah Diklaim' : 'KLAIM HADIAH'}
              </motion.button>
            )}
            </AnimatePresence>
          </motion.div>
          
          <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3">Daftar Tantangan</h2>
              <div className="space-y-4">
                  <AnimatePresence>
                      {challenges.map(challenge => (
                          <ChallengeItem key={challenge.id} challenge={challenge} onStart={handleStartChallenge} />
                      ))}
                  </AnimatePresence>
              </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DailyChallengePage;