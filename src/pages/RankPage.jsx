import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiStar, FiZap, FiLoader } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import { useData } from '../hooks/useData';

const ranks = [
  { name: 'Murid Baru', points: 0, color: '#CD7F32', icon: 'bronze' },
  { name: 'Siswa Rajin', points: 5000, color: '#C0C0C0', icon: 'silver' },
  { name: 'Bintang Kelas', points: 12000, color: '#FFD700', icon: 'gold' },
  { name: 'Juara Harapan', points: 25000, color: '#4682B4', icon: 'platinum' },
  { name: 'Cendekiawan Muda', points: 50000, color: '#9370DB', icon: 'diamond' },
  { name: 'Legenda Sekolah', points: 100000, color: '#FF4500', icon: 'master' },
];

const RankIcon = ({ rank, size = "w-24 h-24" }) => {
  const iconStyle = `drop-shadow-lg ${size}`;
  switch (rank) {
    case 'bronze': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 39c-7.732 0-14-6.268-14-14S16.268 11 24 11s14 6.268 14 14-6.268 14-14 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18 25h12M24 19v12" /></g></svg>;
    case 'silver': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 42c-9.941 0-18-8.059-18-18S14.059 6 24 6s18 8.059 18 18-8.059 18-18 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M31 17l-7 7-7-7" /><path strokeLinecap="round" d="M24 24v12" /></g></svg>;
    case 'gold': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z" /><path strokeLinecap="round" strokeLinejoin="round" d="M24 30l-5 5 5-10 5 10-5-5z" /><path d="M17 17h14" /></g></svg>;
    case 'platinum': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 18l13-13 13 13-13 13-13-13z" /><path strokeLinecap="round" strokeLinejoin="round" d="M11 18v18h26V18" /></g></svg>;
    case 'diamond': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 5L40 19 24 43 8 19 24 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 19h32" /></g></svg>;
    case 'master': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 8l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2 6-12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4h24v4H12z" /></g></svg>;
    default: return null;
  }
};

const getRankInfo = (points) => {
    const currentRankIndex = ranks.slice().reverse().findIndex(r => points >= r.points);
    const currentRank = ranks[ranks.length - 1 - currentRankIndex];
    const nextRank = ranks[ranks.length - currentRankIndex];
    return { currentRank, nextRank };
}

const RankPage = ({ onNavigate }) => {
  const [currentUserPoints, setCurrentUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  
  const { getPointsSummary, getLeaderboard } = useData();
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    setLoading(true);
    setLeaderboardLoading(true);
    
    getPointsSummary()
      .then(response => {
        setCurrentUserPoints(response.data.totalPoints);
      })
      .catch(error => console.error("Gagal memuat poin:", error))
      .finally(() => setLoading(false));

    getLeaderboard()
      .then(response => {
        setLeaderboard(response.data);
      })
      .catch(error => console.error("Gagal memuat leaderboard:", error))
      .finally(() => setLeaderboardLoading(false));

  }, [getPointsSummary, getLeaderboard]);

  const { currentRank, nextRank } = getRankInfo(currentUserPoints);
  const pointsForNextRank = nextRank ? nextRank.points - currentRank.points : 0;
  const pointsProgress = currentUserPoints - currentRank.points;
  const progressPercentage = nextRank ? (pointsProgress / pointsForNextRank) * 100 : 100;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans">
      <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-gray-100"><FiArrowLeft size={24} /></button>
        <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Peringkat Saya</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow overflow-y-auto p-6 space-y-8">
        {loading ? (
            <div className="w-full h-64 bg-gray-200 rounded-2xl animate-pulse flex justify-center items-center"><FiLoader className="text-3xl text-sesm-teal animate-spin"/></div>
        ) : (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 100 }} className="bg-white p-6 rounded-2xl shadow-md text-center">
                <div className="flex justify-center items-center mb-4" style={{ color: currentRank.color }}><RankIcon rank={currentRank.icon} /></div>
                <h2 className="text-3xl font-bold" style={{ color: currentRank.color }}>{currentRank.name}</h2>
                <p className="text-gray-500">Total Poin: <span className="font-bold text-gray-800">{currentUserPoints.toLocaleString()}</span></p>
                {nextRank && (
                    <div className="mt-6">
                        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-1"><span>{currentRank.points.toLocaleString()}</span><span>{nextRank.points.toLocaleString()}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <motion.div className="h-4 rounded-full" style={{ background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})` }} initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }}/>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{`${(nextRank.points - currentUserPoints).toLocaleString()}`} poin lagi untuk <span className="font-bold" style={{color: nextRank.color}}>{nextRank.name}</span>!</p>
                    </div>
                )}
            </motion.div>
        )}

        <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4 px-2 flex items-center"><FaTrophy className="mr-2 text-yellow-500"/> Papan Peringkat</h3>
            {leaderboardLoading ? (
                 <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="bg-gray-200 h-20 w-full rounded-xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-2">
                    {leaderboard.map((user, index) => {
                        const { currentRank: userRank } = getRankInfo(user.points);
                        const position = index + 1;
                        let positionColor = 'bg-gray-400';
                        if (position === 1) positionColor = 'bg-yellow-400';
                        if (position === 2) positionColor = 'bg-slate-300';
                        if (position === 3) positionColor = 'bg-yellow-600';
                        
                        let userAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`;
                        if (user.avatar) {
                            if (user.avatar.startsWith('http')) {
                                userAvatar = user.avatar;
                            } else {
                                userAvatar = `${API_URL}/${user.avatar}`;
                            }
                        }

                        return (
                            <motion.div key={user.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }} className="bg-white flex items-center p-3 rounded-xl shadow-sm space-x-4">
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full text-white font-bold text-lg flex items-center justify-center ${positionColor}`}>{position}</span>
                                <img src={userAvatar} alt={user.nama} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-bold truncate">{user.nama}</p>
                                    <p className="text-sm text-gray-500">{user.points.toLocaleString()} Poin</p>
                                </div>
                                <div className="flex-shrink-0" style={{ color: userRank.color }}>
                                    <RankIcon rank={userRank.icon} size="w-10 h-10" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-4 px-2">Semua Jenjang Peringkat</h3>
          <div className="space-y-3">
            {ranks.map((rank, index) => {
              const isUnlocked = currentUserPoints >= rank.points;
              return (
                <motion.div key={rank.name} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }} className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${isUnlocked ? 'bg-white shadow-sm' : 'bg-gray-200'}`}>
                  <div style={{ color: isUnlocked ? rank.color : '#9CA3AF' }}><RankIcon rank={rank.icon} size="w-12 h-12" /></div>
                  <div className="flex-grow">
                    <h4 className={`font-bold text-lg ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>{rank.name}</h4>
                    <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-500'}`}><FiZap className="inline -mt-1 mr-1" /> {rank.points.toLocaleString()} Poin</p>
                  </div>
                  {isUnlocked && <FiStar className="text-yellow-400 text-2xl flex-shrink-0" fill="currentColor"/>}
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RankPage;