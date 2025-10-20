// contoh-sesm-web/pages/QuizPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiAward, FiBookOpen, FiStar, FiLoader, FiAlertCircle, FiClipboard,
    FiTarget, FiCheckSquare, FiSearch, FiClock, FiGrid, FiList, FiFilter, FiX, FiChevronDown
} from 'react-icons/fi';
import { FaFlask, FaGlobe, FaCalculator, FaTrophy, FaCrown, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import DataService from '../services/dataService';
import { useData } from '../hooks/useData'; // Impor useData hook

// --- Helper Components ---
const iconMap = { Umum: FaGlobe, Sains: FaFlask, Matematika: FaCalculator };

const StatCard = ({ icon: Icon, value, label, color, delay }) => (
    <motion.div
        className="bg-white p-4 rounded-xl shadow-md flex-1 border flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 + 0.2 }}
    >
        <Icon className={`text-3xl ${color}`} />
        <div>
            <p className="text-2xl font-bold text-sesm-deep">{value}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
        </div>
    </motion.div>
);

const QuizCard = ({ quiz, onSelect, layoutType = 'grid' }) => {
    const API_BASE_URL = 'http://localhost:8080';
    const subjectOrLevel = quiz.subject || quiz.recommended_level || 'Umum';
    const Icon = iconMap[subjectOrLevel] || FaGlobe;

    const creatorNameSeed = encodeURIComponent(quiz.creator_name || 'Admin');
    const defaultAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${creatorNameSeed}&backgroundColor=cccccc&fontSize=36`;
    const creatorAvatarUrl = quiz.creator_avatar ? (quiz.creator_avatar.startsWith('http') ? quiz.creator_avatar : `${API_BASE_URL}/${quiz.creator_avatar}`) : defaultAvatarUrl;
    const handleAvatarError = (e) => { e.target.onerror = null; e.target.src = defaultAvatarUrl; };

    if (layoutType === 'list') {
        return (
             <motion.div layout onClick={() => onSelect(quiz)} className="bg-white p-4 rounded-xl shadow-sm cursor-pointer border hover:border-sesm-teal transition-all flex items-center gap-4" whileHover={{ y: -3 }}>
                <div className="w-12 h-12 rounded-lg bg-sesm-teal/10 text-sesm-teal flex items-center justify-center flex-shrink-0"><Icon size={24}/></div>
                <div className='flex-grow min-w-0'>
                    <h3 className="font-bold text-sesm-deep truncate">{quiz.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>Oleh {quiz.creator_name || 'Admin'}</span>
                        <span className='flex items-center gap-1'><FiBookOpen size={12}/> {quiz.question_count || 0} Soal</span>
                    </div>
                </div>
                {quiz.last_score !== null && quiz.last_score !== undefined && (
                    <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-sesm-teal">{quiz.last_score}%</p>
                        <p className="text-xs text-gray-500 -mt-1">Skor Terakhir</p>
                    </div>
                )}
            </motion.div>
        )
    }

    return (
        <motion.div layout onClick={() => onSelect(quiz)} className="bg-white rounded-2xl shadow-lg cursor-pointer border hover:border-sesm-teal transition-all flex flex-col group overflow-hidden" whileHover={{ y: -5 }}>
            <div className="h-40 overflow-hidden relative">
                {quiz.cover_image_url ? (
                    <img src={`${API_BASE_URL}/${quiz.cover_image_url}`} alt={quiz.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full bg-sesm-teal/10 text-sesm-teal flex items-center justify-center"><Icon size={48}/></div>
                )}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-sesm-deep">
                    <FiAward className="text-yellow-500"/> {quiz.points_potential || 'N/A'} Poin
                </div>
                 {quiz.last_score !== null && quiz.last_score !== undefined && (
                    <motion.div initial={{y: '100%'}} animate={{y:0}} className="absolute bottom-0 left-0 right-0 bg-sesm-teal/80 backdrop-blur-sm text-white px-3 py-1 text-center text-sm font-semibold">
                        Skor Terakhir: {quiz.last_score}%
                    </motion.div>
                )}
            </div>
            <div className='p-4 flex-grow flex flex-col'>
                <h3 className="font-bold text-sesm-deep text-lg">{quiz.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                    <img src={creatorAvatarUrl} alt={quiz.creator_name || 'Admin'} className="w-5 h-5 rounded-full object-cover" onError={handleAvatarError} />
                    <span>Oleh {quiz.creator_name || 'Admin'} • {subjectOrLevel}</span>
                </div>
                <div className="flex-grow"></div>
                <div className="flex items-center space-x-4 text-sm mt-3 pt-3 border-t text-gray-600">
                    <span className="flex items-center gap-1.5"><FiBookOpen/>{quiz.question_count || 0} Soal</span>
                    <span className="flex items-center gap-1.5"><FiClock/>{Math.ceil((quiz.question_count * (quiz.setting_time_per_question || 20)) / 60)} min</span>
                </div>
            </div>
        </motion.div>
    );
};

const LeaderboardItem = ({ user, rank }) => {
    const trophyColors = ['text-yellow-400', 'text-slate-400', 'text-amber-600'];
    return (
        <div className="flex items-center gap-3">
            <FaCrown className={trophyColors[rank - 1]} size={20} />
            <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080/${user.avatar}`} alt={user.nama} className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-grow">
                <p className="font-bold text-sm text-gray-800">{user.nama}</p>
                <p className="text-xs text-gray-500">{user.points.toLocaleString()} Poin</p>
            </div>
        </div>
    );
};

const StartQuizModal = ({ quiz, onClose, onStart }) => (
    <AnimatePresence>
    {quiz && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
                <FaTrophy className="text-5xl text-yellow-400 mx-auto mb-4"/>
                <h2 className="text-2xl font-bold text-sesm-deep">{quiz.title}</h2>
                <p className="text-gray-600 my-2">{quiz.description}</p>
                <div className="grid grid-cols-3 gap-4 my-6 text-left bg-gray-100 p-4 rounded-lg">
                    <div><p className="text-xs text-gray-500">Soal</p><p className="font-bold">{quiz.question_count}</p></div>
                    <div><p className="text-xs text-gray-500">Poin</p><p className="font-bold">{quiz.points_potential}</p></div>
                    <div><p className="text-xs text-gray-500">Waktu</p><p className="font-bold">~{Math.ceil((quiz.question_count * (quiz.setting_time_per_question || 20)) / 60)} min</p></div>
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-200 font-bold rounded-lg">Batal</button>
                    <button onClick={() => onStart(quiz)} className="flex-1 py-3 bg-sesm-deep text-white font-bold rounded-lg">Mulai Kuis!</button>
                </div>
            </motion.div>
        </motion.div>
    )}
    </AnimatePresence>
)

const SkeletonCard = ({ layoutType = 'grid' }) => {
    if (layoutType === 'list') {
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0"></div>
                <div className='flex-grow min-w-0'>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        )
    }
    return (
        <div className="bg-white rounded-2xl shadow-lg flex flex-col animate-pulse">
            <div className="h-40 bg-gray-200"></div>
            <div className='p-4'>
                <div className="h-5 bg-gray-200 rounded w-4/5 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between border-t pt-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    )
}

const HistoryCard = ({ item }) => (
    <motion.div
        className="w-full bg-white rounded-2xl p-4 shadow-sm border flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div>
            <h4 className="font-bold text-sesm-deep text-md">{item.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
        </div>
        
        <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
                <FiTarget className="text-blue-500 text-xl" />
                <div>
                    <p className="font-bold text-lg text-sesm-deep">{item.score ?? 0}%</p>
                    <p className="text-xs text-gray-500 -mt-1">Skor</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <FiAward className="text-yellow-500 text-xl" />
                <div>
                    <p className="font-bold text-lg text-green-500">+{item.points_earned ?? 0}</p>
                    <p className="text-xs text-gray-500 -mt-1">Poin</p>
                </div>
            </div>
        </div>
    </motion.div>
);


// --- Komponen Utama ---
const QuizPage = ({ onNavigate, onSelectQuiz }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [history, setHistory] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('materi');
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState('terbaru');
    const [statusFilter, setStatusFilter] = useState('semua');
    const [layout, setLayout] = useState('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [quizToStart, setQuizToStart] = useState(null);
    const { getLeaderboard } = useData();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            DataService.getAllQuizzes(),
            DataService.getQuizHistory(),
            getLeaderboard()
        ])
        .then(([quizzesRes, historyRes, leaderboardRes]) => {
            const historyMap = new Map(historyRes.data.map(h => [h.quiz_id, h.score]));
            const quizzesWithScores = quizzesRes.data.map(q => ({
                ...q,
                last_score: historyMap.get(q.id) ?? null
            }));
            setQuizzes(quizzesWithScores);
            setHistory(historyRes.data);
            setLeaderboard(leaderboardRes.data.slice(0, 3));
        })
        .catch(err => setError("Gagal memuat data."))
        .finally(() => setLoading(false));
    }, [getLeaderboard]);

    const filteredAndSortedQuizzes = useMemo(() => {
        let processed = quizzes
            .filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(q => {
                if(statusFilter === 'selesai') return q.last_score !== null;
                if(statusFilter === 'belum') return q.last_score === null;
                return true;
            });
        
        if(sort === 'populer') processed.sort((a, b) => (b.submission_count || 0) - (a.submission_count || 0));
        else if(sort === 'poin') processed.sort((a, b) => (b.points_potential || 0) - (a.points_potential || 0));
        else processed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return processed;
    }, [quizzes, searchTerm, sort, statusFilter]);

    const stats = useMemo(() => ({
        completed: history.length,
        avgScore: history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length) : 0,
        totalPoints: history.reduce((sum, h) => sum + h.points_earned, 0)
    }), [history]);

    const featuredQuiz = useMemo(() => {
        if (quizzes.length === 0) return null;
        return quizzes[Math.floor(Math.random() * quizzes.length)];
    }, [quizzes]);
    
    return (
        <>
            <StartQuizModal quiz={quizToStart} onClose={() => setQuizToStart(null)} onStart={onSelectQuiz} />
            <div className="min-h-screen bg-gray-100 flex flex-col md:p-8">
                <main className="flex-grow flex flex-col p-4 md:p-0">
                    <motion.div className="bg-white rounded-2xl shadow-xl flex flex-col flex-grow w-full mx-auto overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="p-6 border-b border-gray-200">
                             <div className="flex items-center gap-4 mb-6">
                                <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-gray-100 hidden md:block"><FiArrowLeft size={24} /></button>
                                <div className='flex-grow'>
                                    <h1 className="text-3xl font-bold text-sesm-deep">Arena Kuis</h1>
                                    <p className="text-base text-gray-500">Uji wawasan, raih poin, dan jadilah yang terbaik!</p>
                                </div>
                                <div className="p-4 bg-sesm-teal/10 rounded-xl text-sesm-teal"><FaTrophy size={28} /></div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Featured Quiz */}
                                <div className="lg:col-span-2">
                                    {loading ? <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div> : featuredQuiz && (
                                        <motion.div className="bg-gradient-to-br from-sesm-teal to-sesm-deep rounded-2xl p-6 text-white h-full flex flex-col justify-between shadow-lg" initial={{opacity: 0}} animate={{opacity: 1}}>
                                            <div>
                                                <p className="font-bold text-sm bg-white/20 px-2 py-1 rounded-full inline-block">KUIS UNGGULAN</p>
                                                <h2 className="text-3xl font-bold mt-2">{featuredQuiz.title}</h2>
                                                <p className="opacity-80 mt-1 line-clamp-2">{featuredQuiz.description}</p>
                                            </div>
                                            <button onClick={() => setQuizToStart(featuredQuiz)} className="mt-4 px-6 py-3 bg-white text-sesm-deep font-bold rounded-lg self-start">Mulai Sekarang</button>
                                        </motion.div>
                                    )}
                                </div>
                                {/* Leaderboard */}
                                <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border">
                                    <h3 className="font-bold text-lg flex items-center gap-2"><FaCrown className="text-yellow-500"/> Peringkat Teratas</h3>
                                    {loading ? Array.from({length:3}).map((_,i) => <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>)
                                     : leaderboard.map((user, i) => <LeaderboardItem key={user.id} user={user} rank={i + 1} />)}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 flex-shrink-0 border-b">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center bg-gray-200/70 rounded-full p-1 w-full md:w-auto">
                                    <button onClick={() => setActiveTab('materi')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors flex items-center justify-center gap-2 ${activeTab === 'materi' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}>
                                        <FiBookOpen />
                                        <span>Daftar Kuis</span>
                                    </button>
                                    <button onClick={() => setActiveTab('nilai')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors flex items-center justify-center gap-2 ${activeTab === 'nilai' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}>
                                        <FiClipboard />
                                        <span className="whitespace-nowrap">Riwayat & Nilai</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <div className="relative flex-grow">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" placeholder="Cari kuis..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-9 border rounded-full bg-white"/>
                                    </div>
                                    <button onClick={() => setIsFilterOpen(o => !o)} className="p-2.5 rounded-full bg-white border"><FiFilter/></button>
                                    <button onClick={() => setLayout('grid')} className={`p-2.5 rounded-full ${layout === 'grid' ? 'bg-sesm-deep text-white' : 'bg-white border'}`}><FiGrid/></button>
                                    <button onClick={() => setLayout('list')} className={`p-2.5 rounded-full ${layout === 'list' ? 'bg-sesm-deep text-white' : 'bg-white border'}`}><FiList/></button>
                                </div>
                            </div>
                             <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} className="overflow-hidden mt-4">
                                        <div className="bg-white p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-around">
                                             <div>
                                                <p className="font-bold text-sm mb-2">Urutkan</p>
                                                <div className="flex gap-2"><button onClick={()=>setSort('terbaru')} className={`px-3 py-1 text-xs rounded-full ${sort==='terbaru' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Terbaru</button><button onClick={()=>setSort('populer')} className={`px-3 py-1 text-xs rounded-full ${sort==='populer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Populer</button><button onClick={()=>setSort('poin')} className={`px-3 py-1 text-xs rounded-full ${sort==='poin' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Poin</button></div>
                                            </div>
                                             <div>
                                                <p className="font-bold text-sm mb-2">Status</p>
                                                <div className="flex gap-2"><button onClick={()=>setStatusFilter('semua')} className={`px-3 py-1 text-xs rounded-full ${statusFilter==='semua' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Semua</button><button onClick={()=>setStatusFilter('selesai')} className={`px-3 py-1 text-xs rounded-full ${statusFilter==='selesai' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Selesai</button><button onClick={()=>setStatusFilter('belum')} className={`px-3 py-1 text-xs rounded-full ${statusFilter==='belum' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Belum</button></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab + layout} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    {loading ? (
                                        <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                            {Array.from({length: 6}).map((_, i) => <SkeletonCard key={i} layoutType={layout} />)}
                                        </div>
                                    ) : error ? (
                                        <p>{error}</p>
                                    ) : activeTab === 'materi' ? (
                                        filteredAndSortedQuizzes.length > 0 ? (
                                            <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                                {filteredAndSortedQuizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} onSelect={() => setQuizToStart(quiz)} layoutType={layout}/>)}
                                            </div>
                                        ) : <p className="text-center text-gray-500 mt-8">Kuis tidak ditemukan.</p>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <StatCard value={stats.completed} label="Kuis Selesai" color="text-green-500" icon={FiCheckSquare} delay={0} />
                                                <StatCard value={`${stats.avgScore}%`} label="Rata-rata Skor" color="text-blue-500" icon={FiTarget} delay={1} />
                                                <StatCard value={stats.totalPoints.toLocaleString()} label="Total Poin" color="text-yellow-500" icon={FiAward} delay={2} />
                                            </div>
                                            <div className="space-y-4">
                                                {history.map(item => (
                                                    <HistoryCard key={item.id} item={item} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default QuizPage;