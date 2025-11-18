import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiZap, FiGift, FiClock, FiCheckCircle, FiAward, FiLoader, FiCheck,
    FiAlertTriangle
} from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import ChallengeModal from '../components/mod/ChallengeModal';
import PointsNotification from '../components/ui/PointsNotification.jsx';
import ChallengeService from '../services/challengeService';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';

const RewardNotification = ({ onClose }) => createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
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
    document.body
);

const ChallengeItem = ({ challenge, onStart }) => {
  const { icon: Icon, title, description, points, completed, category } = challenge;

  return (
    <motion.div
      layout 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 overflow-hidden ${
        completed ? 'bg-gradient-to-r from-green-50 via-white to-green-50 border border-green-200' : 'bg-white shadow-sm border border-gray-200'
      }`}
    >
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl shadow-inner ${
          completed ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-sesm-sky to-sesm-teal'
      }`}>
        {Icon ? <Icon /> : <FiZap />}
      </div>

      <div className="flex-grow min-w-0"> 
        <h4 className={`font-bold truncate ${completed ? 'text-gray-600' : 'text-gray-800'}`}>{title}</h4>
        <p className={`text-xs truncate ${completed ? 'text-gray-500' : 'text-gray-500'}`}>{description}</p>
        {completed && points > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center text-sm font-bold text-yellow-600 mt-1"
          >
            <FiAward className="mr-1 flex-shrink-0" />
            <span>+{points} Poin</span>
          </motion.div>
        )}
        {!completed && category && (
             <span className="text-xs font-semibold text-gray-400 mt-1">{category}</span>
         )}
      </div>

      <motion.button
        onClick={() => !completed && onStart(challenge.id)}
        disabled={completed}
        className={`w-16 h-10 text-sm font-bold rounded-lg text-white transition-all duration-300 flex items-center justify-center relative z-10 ${
          completed ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-md cursor-default' : 'bg-gradient-to-br from-sesm-teal to-sesm-deep hover:from-sesm-deep hover:to-sesm-teal shadow-lg'
        }`}
        whileHover={!completed ? { scale: 1.05 } : {}}
        whileTap={!completed ? { scale: 0.95 } : {}}
      >
        {completed ? <FiCheck size={24} /> : 'Mulai'}
      </motion.button>
    </motion.div>
  );
};

const DailyChallengePage = ({ onNavigate }) => {
  const [challenges, setChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [timeLeft, setTimeLeft] = useState('...');
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [showPointsNotification, setShowPointsNotification] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(true);
  
  const [bonusClaimed, setBonusClaimed] = useState(false);

  const { refreshUser } = useAuth();
  const { getPointsSummary } = useData();

  useEffect(() => {
      setLoadingPoints(true);
      getPointsSummary()
          .then(response => {
              setTotalPoints(response.data.totalPoints || 0);
          })
          .catch(error => {
              console.error("Gagal memuat total poin:", error);
              setTotalPoints(0);
          })
          .finally(() => setLoadingPoints(false));
  }, [getPointsSummary]);

  useEffect(() => {
    setLoadingChallenges(true);
    ChallengeService.getTodaysChallenges()
      .then(response => {
        setChallenges(response.data || []);
      })
      .catch(err => {
        console.error("Gagal memuat tantangan harian:", err);
        alert("Gagal memuat tantangan harian. Coba lagi nanti.");
        setChallenges([]);
      })
      .finally(() => {
        setLoadingChallenges(false);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay - now;
      if (diff < 0) { 
           setTimeLeft("00:00:00");
           clearInterval(timer);
           return;
      }
      const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const m = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartChallenge = (id) => {
    const challenge = challenges.find(c => c.id === id);
    if (challenge && challenge.quiz && !challenge.completed) {
       setActiveChallenge(challenge);
    } else if (challenge && challenge.type === 'manual_check' && !challenge.completed) {
       alert("Kerjakan tantangan ini lalu tunggu guru memeriksanya ya!");
    }
  };

  const handleAnswerSubmit = async (isCorrect) => {
    if (!activeChallenge) return;

    const currentChallengeId = activeChallenge.id;
    setActiveChallenge(null); 

    if (isCorrect) {
      try {
        const response = await ChallengeService.completeDailyChallenge(currentChallengeId);
        const awarded = response.data.pointsAwarded;

        setChallenges(prevChallenges =>
          prevChallenges.map(c =>
            c.id === currentChallengeId
              ? { ...c, completed: true, points: awarded } 
              : c
          )
        );

        if (awarded > 0) {
          setPointsAwarded(awarded);
          setShowPointsNotification(true);
          setTotalPoints(current => current + awarded);
          if (typeof refreshUser === 'function') {
             refreshUser();
          }
        }
      } catch (error) {
        console.error("Gagal mencatat penyelesaian tantangan:", error);
        alert(error.response?.data?.message || "Gagal menyimpan progres tantangan. Coba lagi.");
      }
    }
  };

  const handleClaimReward = async () => {
     try {
         setBonusClaimed(true);
         setShowRewardNotification(true);
         setTotalPoints(prev => prev + 200);
         
     } catch (error) {
         console.error("Error claiming reward:", error);
         alert("Gagal mengklaim hadiah.");
         setBonusClaimed(false); 
     }
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

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
        {showPointsNotification && (
            <PointsNotification
                points={pointsAwarded}
                message="Tantangan Selesai!"
                onDone={() => setShowPointsNotification(false)}
            />
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
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-2xl shadow-md flex items-center justify-between"
          >
            <div className='text-left'>
              <p className='text-sm font-semibold text-gray-500'>Total Poin Kamu</p>
              <p className='text-2xl font-bold text-sesm-deep'>
                {loadingPoints ? <FiLoader className="animate-spin inline-block"/> : totalPoints.toLocaleString()}
              </p>
            </div>
            <FaTrophy className='text-yellow-400 text-4xl' />
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-5"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-gray-800">Progress Hari Ini</p>
              <p className="font-bold text-sesm-deep">{completedCount}/{totalCount}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-cyan-400 h-2.5 rounded-full"
                initial={{width: 0}}
                animate={{width: `${progress}%`}}
                transition={{duration: 0.8, ease: 'easeOut'}}
              />
            </div>
            <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
              <FiClock className="mr-2"/>
              <span>Tantangan baru dalam: <span className='font-bold text-sesm-teal'>{timeLeft}</span></span>
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} transition={{delay: 0.3}}
            className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-6 rounded-2xl shadow-lg text-center flex flex-col items-center"
          >
            <FiGift size={40} className="mb-2"/>
            <h3 className="text-lg font-bold">Hadiah Spesial Hari Ini!</h3>
            <p className="text-sm opacity-90 mb-3">Selesaikan semua tantangan ({totalCount}) untuk mendapatkan 200 Poin bonus!</p>
            
            <AnimatePresence mode="wait">
            {allCompleted && ( 
              <motion.button
                key={bonusClaimed ? "claimed" : "claim"}
                onClick={!bonusClaimed ? handleClaimReward : undefined}
                disabled={bonusClaimed}
                initial={{scale: 0.8, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                exit={{scale: 0.8, opacity: 0}}
                whileTap={!bonusClaimed ? { scale: 0.95 } : {}}
                className={`mt-2 font-bold px-6 py-2 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    bonusClaimed 
                    ? 'bg-green-500 text-white cursor-default ring-2 ring-white' 
                    : 'bg-yellow-400 text-sesm-deep hover:bg-yellow-300'
                }`}
              >
                {bonusClaimed ? (
                    <>
                        <FiCheckCircle size={20} className="mr-2" />
                        <span>Terklaim</span>
                    </>
                ) : (
                    <span>KLAIM HADIAH (+200 Poin)</span>
                )}
              </motion.button>
            )}
            </AnimatePresence>
          </motion.div>

          <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3">Daftar Tantangan</h2>
              {loadingChallenges ? (
                <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-2xl text-sesm-teal"/></div>
              ) : challenges.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Tidak ada tantangan hari ini.</p>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                      {challenges.map(challenge => (
                          <ChallengeItem
                              key={challenge.id}
                              challenge={challenge}
                              onStart={handleStartChallenge}
                          />
                      ))}
                  </AnimatePresence>
                </div>
              )}
          </div>
        </main>
      </div>
    </>
  );
};

export default DailyChallengePage;