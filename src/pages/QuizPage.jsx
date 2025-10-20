// contoh-sesm-web/pages/QuizPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiAward, FiBookOpen, FiStar, FiLoader, FiAlertCircle,
    FiClipboard, FiTarget, FiCheckSquare, FiUser // <-- Tambah FiUser
} from 'react-icons/fi';
import { FaFlask, FaGlobe, FaCalculator } from 'react-icons/fa';
import DataService from '../services/dataService';

// Komponen iconMap
const iconMap = {
    Umum: FaGlobe,
    Sains: FaFlask,
    Matematika: FaCalculator
    // Tambahkan ikon lain jika perlu
};

// --- ⭐ Modifikasi QuizCard (Tambahkan Creator Info & Medal) ---
const QuizCard = ({ quiz, onSelect, hasCompleted }) => { // Tambah prop hasCompleted
    const API_BASE_URL = 'http://localhost:8080';
    const subjectOrLevel = quiz.subject || quiz.recommended_level || 'Umum';
    const Icon = iconMap[subjectOrLevel] || FaGlobe;

    // --- Logic Avatar Creator ---
    const creatorNameSeed = encodeURIComponent(quiz.creator_name || 'Admin');
    const defaultAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${creatorNameSeed}&backgroundColor=cccccc&fontSize=36`;
    const creatorAvatarUrl = quiz.creator_avatar
        ? (quiz.creator_avatar.startsWith('http') ? quiz.creator_avatar : `${API_BASE_URL}/${quiz.creator_avatar}`)
        : defaultAvatarUrl;
    const handleAvatarError = (e) => { e.target.onerror = null; e.target.src = defaultAvatarUrl; };

    return (
        <motion.div
            onClick={() => onSelect(quiz)}
            // --- Tambahkan `relative` untuk positioning medal ---
            className="relative bg-white p-4 rounded-xl shadow-sm cursor-pointer border-2 border-transparent hover:border-sesm-teal transition-all"
            whileHover={{ y: -5 }}
            layout // Animasi saat filter berubah
        >
            {/* --- Medal Icon (jika sudah selesai) --- */}
            <AnimatePresence>
                {hasCompleted && (
                    <motion.div
                        key="quiz-medal-icon"
                        initial={{ scale: 0, opacity: 0, y: -5 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: -5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="absolute top-2 right-2 p-1.5 bg-yellow-400 rounded-full text-white shadow-md flex-shrink-0 z-10" // Tambah z-10
                        title="Sudah Dikerjakan"
                    >
                        <FiAward size={14} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-start space-x-4">
                {quiz.cover_image_url ? (
                    <img src={`${API_BASE_URL}/${quiz.cover_image_url}`} alt={quiz.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-200" />
                ) : (
                    <div className="w-16 h-16 rounded-lg bg-sesm-teal/10 text-sesm-teal p-3 flex items-center justify-center flex-shrink-0"><Icon size={28}/></div>
                )}
                <div className='flex-grow min-w-0'>
                    <h3 className="font-bold text-sesm-deep truncate">{quiz.title}</h3>
                    {/* --- Tampilkan Creator Info --- */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                         <img src={creatorAvatarUrl} alt={quiz.creator_name || 'Admin'} className="w-4 h-4 rounded-full object-cover bg-gray-300 flex-shrink-0" onError={handleAvatarError} />
                        <span className="truncate">Oleh {quiz.creator_name || 'Admin'} • {subjectOrLevel}</span>
                    </div>
                    {/* --- Info Soal & Poin --- */}
                    <div className="flex items-center space-x-4 text-xs mt-2 text-gray-600">
                        <span className="flex items-center"><FiBookOpen className="mr-1"/>{quiz.question_count || 0} Soal</span>
                        <span className="flex items-center"><FiAward className="mr-1 text-yellow-500"/>{quiz.points_potential || 'Variasi'} Poin</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Komponen HistoryCard DIPERBARUI ---
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
            {/* Opsi: Tambah tombol Lihat Detail jika ada halaman detail riwayat */}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 flex space-x-4">
            {/* Tampilkan Skor Persentase */}
            <div className="flex items-center space-x-2">
                <FiTarget className="text-blue-500" />
                <div>
                    {/* Gunakan item.score (skor persentase 0-100) */}
                    <p className="text-lg font-bold text-sesm-deep">{item.score ?? 0}%</p>
                    <p className="text-xs text-gray-500 -mt-1">Skor</p>
                </div>
            </div>
            {/* Tampilkan Total Poin */}
            <div className="flex items-center space-x-2">
                <FiAward className="text-yellow-500" />
                <div>
                     {/* Gunakan item.points_earned (total poin didapat) */}
                    <p className="text-lg font-bold text-sesm-deep">+{item.points_earned ?? 0}</p>
                    <p className="text-xs text-gray-500 -mt-1">Poin</p>
                </div>
            </div>
        </div>
    </motion.div>
);


// Komponen Utama QuizPage
const QuizPage = ({ onNavigate, onSelectQuiz }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [history, setHistory] = useState([]); // State untuk riwayat
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true); // Loading terpisah untuk history
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('materi');
    const [activeFilter, setActiveFilter] = useState('Semua');

    // --- Fetch Data Diperbarui ---
    useEffect(() => {
        setLoading(true);
        setHistoryLoading(true); // Mulai loading history
        setError(null);
        Promise.all([
            DataService.getAllQuizzes(),
            DataService.getQuizHistory() // Fetch riwayat kuis
        ])
        .then(([quizzesResponse, historyResponse]) => {
            setQuizzes(quizzesResponse.data);
            setHistory(historyResponse.data); // Simpan data riwayat
            console.log("Quiz History:", historyResponse.data); // Log data riwayat
        })
        .catch(err => {
            setError("Gagal memuat data kuis atau riwayat. Coba lagi nanti.");
            console.error("Fetch Quiz/History Data Error:", err);
        })
        .finally(() => {
            setLoading(false);
            setHistoryLoading(false); // Selesai loading history
        });
    }, []); // Hanya dijalankan sekali

    // Memoized Categories
    const categories = useMemo(() => {
        const uniqueCategories = new Set(quizzes.map(q => q.subject || q.recommended_level || 'Umum').filter(Boolean));
        return ['Semua', ...Array.from(uniqueCategories)];
    }, [quizzes]);

    // Memoized Filtered Quizzes
    const filteredQuizzes = useMemo(() => {
        return quizzes.filter(q =>
            activeFilter === 'Semua' ||
            (q.subject || q.recommended_level || 'Umum') === activeFilter
        );
    }, [quizzes, activeFilter]);

    // Memoized Featured Quiz
    const featuredQuiz = useMemo(() => {
         // Prioritaskan kuis terbaru sebagai unggulan
         return quizzes.length > 0 ? quizzes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] : null;
    }, [quizzes]);

    // --- Statistik DIPERBARUI: Gunakan data riwayat ---
    const quizStats = useMemo(() => {
        const completedCount = history.length;
        // Ambil skor tertinggi dari data riwayat (asumsi 'score' adalah persentase)
        const bestAccuracy = history.length > 0 ? Math.max(...history.map(h => h.score ?? 0)) : 0;
        return { completedCount, bestAccuracy };
    }, [history]);

    // --- Render Function Diperbarui ---
    const renderContent = () => {
        // Gabungkan loading state
        const isContentLoading = loading || (activeTab === 'nilai' && historyLoading);
        if (isContentLoading) {
            return <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
        }
        if (error) {
            return <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg"><FiAlertCircle className="mx-auto text-3xl mb-2"/><p>{error}</p></div>;
        }

        if (activeTab === 'materi') {
            const quizzesToShow = filteredQuizzes.filter(q => q.id !== featuredQuiz?.id);
             // --- ⭐ Cek Completion Status untuk Featured Quiz ---
            const featuredHasCompleted = featuredQuiz && history.some(h => h.quiz_id === featuredQuiz.id);

            return (
                <>
                    {featuredQuiz && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><FiStar className="mr-2 text-yellow-400"/> Kuis Unggulan</h2>
                            {/* --- ⭐ Teruskan hasCompleted ke QuizCard --- */}
                            <QuizCard
                                quiz={featuredQuiz}
                                onSelect={onSelectQuiz}
                                hasCompleted={featuredHasCompleted}
                            />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 my-3">Daftar Kuis Lainnya</h2>
                        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 -mx-6 px-6">
                             {categories.map((cat, index) => (
                                <button
                                    key={`${cat}-${index}`}
                                    onClick={() => setActiveFilter(cat)}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 whitespace-nowrap ${activeFilter === cat ? 'bg-sesm-deep text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <motion.div layout className="space-y-3">
                             <AnimatePresence>
                                {quizzesToShow.length > 0 ? (
                                    quizzesToShow.map(quiz => {
                                        // --- ⭐ Cek Completion Status untuk setiap kuis ---
                                        const hasCompleted = history.some(h => h.quiz_id === quiz.id);
                                        return (
                                            <motion.div key={quiz.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                {/* --- ⭐ Teruskan hasCompleted ke QuizCard --- */}
                                                <QuizCard
                                                    quiz={quiz}
                                                    onSelect={onSelectQuiz}
                                                    hasCompleted={hasCompleted}
                                                />
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <motion.p layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 mt-8">
                                        {quizzes.length > 0 ? "Tidak ada kuis lain di kategori ini." : "Belum ada kuis tersedia."}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </>
            );
        }

        // --- Render Riwayat DIPERBARUI ---
        if (activeTab === 'nilai') {
            if (history.length === 0) return <p className="text-center text-gray-500 mt-8">Anda belum pernah mengerjakan kuis apapun.</p>;
            // Gunakan HistoryCard yang sudah diperbarui
            return (
                <div className="space-y-4">
                     {/* Tambahkan AnimatePresence untuk animasi list riwayat */}
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

    // --- JSX Utama ---
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
                <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-gray-100">
                    <FiArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Pilih Kuis</h1>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow p-6 space-y-6 pb-28 md:pb-6">
                <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="grid grid-cols-2 gap-4 text-center">
                     <div className="bg-white p-4 rounded-xl shadow-sm border">
                        {/* --- Gunakan historyLoading untuk statistik --- */}
                        <h4 className="text-2xl font-bold text-sesm-teal">{historyLoading ? '...' : quizStats.completedCount}</h4>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><FiCheckSquare /> Kuis Selesai</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <h4 className="text-2xl font-bold text-green-500">{historyLoading ? '...' : quizStats.bestAccuracy}%</h4>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><FiTarget /> Akurasi Terbaik</p>
                    </div>
                </motion.div>
                 <div className="p-4 md:p-0">
                    <div className="flex items-center bg-gray-200/70 rounded-full p-1 max-w-sm mx-auto">
                        <button onClick={() => setActiveTab('materi')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'materi' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}><FiBookOpen className="inline mr-1 mb-0.5"/> Daftar Kuis</button>
                        <button onClick={() => setActiveTab('nilai')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'nilai' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}><FiClipboard className="inline mr-1 mb-0.5"/> Riwayat & Nilai</button>
                    </div>
                </div>
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
            </main>
        </div>
    );
};

export default QuizPage;