// contoh-sesm-web/pages/QuizPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiAward, FiBookOpen, FiStar, FiLoader, FiAlertCircle, FiClipboard, FiTarget, FiCheckSquare, FiSearch } from 'react-icons/fi';
import { FaFlask, FaGlobe, FaCalculator, FaTrophy } from 'react-icons/fa';
import DataService from '../services/dataService';

// Komponen iconMap (tidak berubah)
const iconMap = {
    Umum: FaGlobe,
    Sains: FaFlask,
    Matematika: FaCalculator
};

// --- Komponen QuizCard ---
const QuizCard = ({ quiz, onSelect }) => {
    const API_BASE_URL = 'http://localhost:8080';
    const subjectOrLevel = quiz.subject || quiz.recommended_level || 'Umum';
    const Icon = iconMap[subjectOrLevel] || FaGlobe;

    const creatorNameSeed = encodeURIComponent(quiz.creator_name || 'Admin');
    const defaultAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${creatorNameSeed}&backgroundColor=cccccc&fontSize=36`;
    const creatorAvatarUrl = quiz.creator_avatar
        ? (quiz.creator_avatar.startsWith('http') ? quiz.creator_avatar : `${API_BASE_URL}/${quiz.creator_avatar}`)
        : defaultAvatarUrl;
    const handleAvatarError = (e) => { e.target.onerror = null; e.target.src = defaultAvatarUrl; };

    return (
        <motion.div
            onClick={() => onSelect(quiz)}
            className="bg-white p-4 rounded-xl shadow-sm cursor-pointer border-2 border-transparent hover:border-sesm-teal transition-all"
            whileHover={{ y: -5 }}
            layout
        >
            <div className="flex items-start space-x-4">
                {quiz.cover_image_url ? (
                    <img src={`${API_BASE_URL}/${quiz.cover_image_url}`} alt={quiz.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-200" />
                ) : (
                    <div className="w-16 h-16 rounded-lg bg-sesm-teal/10 text-sesm-teal p-3 flex items-center justify-center flex-shrink-0"><Icon size={28}/></div>
                )}
                <div className='flex-grow min-w-0'>
                    <h3 className="font-bold text-sesm-deep truncate">{quiz.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                         <img
                            src={creatorAvatarUrl}
                            alt={quiz.creator_name || 'Admin'}
                            className="w-4 h-4 rounded-full object-cover bg-gray-300 flex-shrink-0"
                            onError={handleAvatarError}
                        />
                        <span className="truncate">Oleh {quiz.creator_name || 'Admin'} • {subjectOrLevel}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs mt-2 text-gray-600">
                        <span className="flex items-center"><FiBookOpen className="mr-1"/>{quiz.question_count || 0} Soal</span>
                        <span className="flex items-center"><FiAward className="mr-1 text-yellow-500"/>{quiz.points_potential || 'Variasi'} Poin</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Komponen HistoryCard ---
const HistoryCard = ({ item }) => (
    <motion.div
        className="w-full bg-white rounded-2xl p-4 shadow-sm border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-sesm-deep text-md">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString('id-ID')}</p>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 flex space-x-4">
            <div className="flex items-center space-x-2">
                <FiTarget className="text-blue-500" />
                <div>
                    <p className="text-lg font-bold text-sesm-deep">{item.score ?? 0}%</p>
                    <p className="text-xs text-gray-500 -mt-1">Skor</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <FiAward className="text-yellow-500" />
                <div>
                    <p className="text-lg font-bold text-sesm-deep">+{item.points_earned ?? 0}</p>
                    <p className="text-xs text-gray-500 -mt-1">Poin</p>
                </div>
            </div>
        </div>
    </motion.div>
);


// --- Komponen Utama QuizPage ---
const QuizPage = ({ onNavigate, onSelectQuiz }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('materi');
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setLoading(true);
        setError(null);
        Promise.all([
            DataService.getAllQuizzes(),
            DataService.getQuizHistory()
        ])
        .then(([quizzesResponse, historyResponse]) => {
            setQuizzes(quizzesResponse.data);
            setHistory(historyResponse.data);
        })
        .catch(err => {
            setError("Gagal memuat data kuis. Coba lagi nanti.");
            console.error("Fetch Quiz Data Error:", err);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(quizzes.map(q => q.subject || q.recommended_level || 'Umum').filter(Boolean));
        return ['Semua', ...Array.from(uniqueCategories)];
    }, [quizzes]);

    const filteredQuizzes = useMemo(() => {
        return quizzes.filter(q =>
            (activeFilter === 'Semua' || (q.subject || q.recommended_level || 'Umum') === activeFilter) &&
            (q.title.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [quizzes, activeFilter, searchTerm]);

    const quizStats = useMemo(() => {
        const completedCount = history.length;
        const bestAccuracy = history.length > 0 ? Math.max(...history.map(h => h.score ?? 0)) : 0;
        return { completedCount, bestAccuracy };
    }, [history]);

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
        }
        if (error) {
            return <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg"><FiAlertCircle className="mx-auto text-3xl mb-2"/><p>{error}</p></div>;
        }

        if (activeTab === 'materi') {
            return (
                <div className="space-y-3">
                     <AnimatePresence>
                        {filteredQuizzes.length > 0 ? (
                            filteredQuizzes.map(quiz => (
                                <motion.div key={quiz.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <QuizCard quiz={quiz} onSelect={onSelectQuiz} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.p layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 mt-8">
                                {searchTerm ? "Kuis tidak ditemukan." : "Belum ada kuis tersedia."}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        if (activeTab === 'nilai') {
            if (history.length === 0) return <p className="text-center text-gray-500 mt-8">Anda belum pernah mengerjakan kuis apapun.</p>;
            return (
                <div className="space-y-4">
                     <AnimatePresence>
                        {history.map(item => (
                            <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <HistoryCard item={item} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            );
        }
    };

    return (
        // ✅ PERBAIKAN: Layout utama sekarang menggunakan flexbox dan padding untuk desktop
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans md:p-8">
            {/* Header Mobile (tidak berubah) */}
            <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm md:hidden">
                <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-gray-100">
                    <FiArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Pilih Kuis</h1>
                <div className="w-10"></div>
            </header>

            {/* ✅ PERBAIKAN: Kontainer utama untuk mobile dan desktop */}
            <main className="flex-grow flex flex-col p-4 md:p-0">
                <motion.div
                    // ✅ PERBAIKAN: Hapus max-w- agar kartu mengisi ruang
                    className="bg-white rounded-2xl shadow-xl flex flex-col flex-grow w-full mx-auto overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Header di dalam Card */}
                    <div className="p-6 border-b border-gray-200 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-gray-100 hidden md:block">
                                <FiArrowLeft size={24} className="text-gray-700" />
                            </button>
                            <div className='flex-grow'>
                                <h1 className="text-2xl md:text-3xl font-bold text-sesm-deep">Kuis Pengetahuan</h1>
                                <p className="text-sm md:text-base text-gray-500">Uji wawasan dan raih poin sebanyak-banyaknya!</p>
                            </div>
                            <div className="flex-shrink-0 p-4 bg-sesm-teal/10 rounded-xl text-sesm-teal">
                                <FaTrophy size={28} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center mt-6">
                             <div className="bg-gray-100 p-3 rounded-xl">
                                <h4 className="text-xl font-bold text-sesm-teal">{loading ? '...' : quizStats.completedCount}</h4>
                                <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><FiCheckSquare /> Kuis Selesai</p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <h4 className="text-xl font-bold text-green-500">{loading ? '...' : quizStats.bestAccuracy}%</h4>
                                <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><FiTarget /> Akurasi Terbaik</p>
                            </div>
                        </div>
                    </div>

                    {/* Kontrol & Filter */}
                    <div className="p-4 bg-gray-50 flex-shrink-0">
                        <div className="flex items-center bg-gray-200/70 rounded-full p-1 max-w-sm mx-auto mb-4">
                            <button onClick={() => setActiveTab('materi')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'materi' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}><FiBookOpen className="inline mr-1 mb-0.5"/> Daftar Kuis</button>
                            <button onClick={() => setActiveTab('nilai')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'nilai' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}><FiClipboard className="inline mr-1 mb-0.5"/> Riwayat & Nilai</button>
                        </div>
                        
                        {activeTab === 'materi' && (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="relative max-w-md mx-auto mb-3">
                                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari judul kuis..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full p-2 pl-10 border rounded-full bg-white text-sm"
                                        />
                                    </div>
                                    <div className="flex space-x-2 overflow-x-auto pb-2 justify-center">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveFilter(cat)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${activeFilter === cat ? 'bg-sesm-deep text-white shadow' : 'bg-white text-gray-600'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>

                    {/* ✅ PERBAIKAN: Area Konten Scrollable */}
                    <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                         </AnimatePresence>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default QuizPage;