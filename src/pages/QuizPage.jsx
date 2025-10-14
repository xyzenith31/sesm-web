import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiAward, FiBookOpen, FiStar, FiLoader, FiAlertCircle, FiClipboard, FiTarget } from 'react-icons/fi';
import { FaFlask, FaGlobe, FaCalculator } from 'react-icons/fa';
import DataService from '../services/dataService';

const iconMap = {
    Umum: FaGlobe,
    Sains: FaFlask,
    Matematika: FaCalculator
};

const QuizCard = ({ quiz, onSelect }) => {
    const API_BASE_URL = 'http://localhost:8080';
    const subject = quiz.subject || quiz.recommended_level;
    const Icon = iconMap[subject] || FaGlobe;

    return (
        <motion.div
            onClick={() => onSelect(quiz)}
            className="bg-white p-4 rounded-xl shadow-sm cursor-pointer border-2 border-transparent hover:border-sesm-teal transition-all"
            whileHover={{ y: -5 }}
            layout
        >
            <div className="flex items-start space-x-4">
                {quiz.cover_image_url ? (
                    <img src={`${API_BASE_URL}/${quiz.cover_image_url}`} alt={quiz.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                    <div className="bg-sesm-teal/10 text-sesm-teal p-3 rounded-lg flex-shrink-0"><Icon size={24}/></div>
                )}
                <div className='flex-grow'>
                    <h3 className="font-bold text-sesm-deep">{quiz.title}</h3>
                    <p className="text-xs text-gray-500">oleh {quiz.creator_name} • {subject}</p>
                    <div className="flex items-center space-x-4 text-xs mt-2 text-gray-600">
                        <span className="flex items-center"><FiBookOpen className="mr-1"/>{quiz.question_count} Soal</span>
                        <span className="flex items-center"><FiAward className="mr-1 text-yellow-500"/>600 Poin</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- KOMPONEN BARU UNTUK KARTU RIWAYAT ---
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
                    <p className="text-lg font-bold text-sesm-deep">{item.score}</p>
                    <p className="text-xs text-gray-500 -mt-1">Nilai</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <FiAward className="text-yellow-500" />
                <div>
                    <p className="text-lg font-bold text-sesm-deep">+{item.points || 600}</p>
                    <p className="text-xs text-gray-500 -mt-1">Poin</p>
                </div>
            </div>
        </div>
    </motion.div>
);


const QuizPage = ({ onNavigate, onSelectQuiz }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('materi');
    const [activeFilter, setActiveFilter] = useState('Semua');

    useEffect(() => {
        setLoading(true);
        // Mengambil data kuis dan riwayat secara paralel
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
            console.error(err);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    const categories = useMemo(() => ['Semua', ...new Set(quizzes.map(q => q.subject || q.recommended_level).filter(Boolean))], [quizzes]);
    
    const filteredQuizzes = useMemo(() => {
        if (activeFilter === 'Semua') return quizzes;
        return quizzes.filter(q => (q.subject || q.recommended_level) === activeFilter);
    }, [quizzes, activeFilter]);
    
    const featuredQuiz = useMemo(() => quizzes.length > 0 ? quizzes[0] : null, [quizzes]);

    // --- STATISTIK BARU ---
    const quizStats = useMemo(() => {
        const completedCount = history.length;
        const bestAccuracy = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;
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
                <>
                    {featuredQuiz && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><FiStar className="mr-2 text-yellow-400"/> Kuis Unggulan</h2>
                            <QuizCard quiz={featuredQuiz} onSelect={onSelectQuiz} />
                        </div>
                    )}
                    <div className='mt-6'>
                        <h2 className="text-lg font-bold text-gray-700 my-3">Daftar Kuis</h2>
                        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                            {categories.map((cat, index) => (
                                <button key={`${cat}-${index}`} onClick={() => setActiveFilter(cat)} className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 ${activeFilter === cat ? 'bg-sesm-deep text-white' : 'bg-white text-gray-600'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <motion.div layout className="space-y-3">
                            {filteredQuizzes.length > 0 ? (
                                filteredQuizzes
                                    .filter(q => q.id !== featuredQuiz?.id)
                                    .map(quiz => <QuizCard key={quiz.id} quiz={quiz} onSelect={onSelectQuiz} />)
                            ) : (
                                <p className="text-center text-gray-500 mt-8">Tidak ada kuis di kategori ini.</p>
                            )}
                        </motion.div>
                    </div>
                </>
            );
        }

        if (activeTab === 'nilai') {
            if (history.length === 0) return <p className="text-center text-gray-500 mt-8">Anda belum pernah mengerjakan kuis apapun.</p>;
            return (
                <div className="space-y-4">
                    {history.map(item => <HistoryCard key={item.id} item={item} />)}
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
                <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-gray-100">
                    <FiArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Pilih Kuis</h1>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow p-6 space-y-6">
                <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h4 className="text-2xl font-bold text-sesm-teal">{quizStats.completedCount}</h4>
                        <p className="text-xs text-gray-500">Kuis Selesai</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h4 className="text-2xl font-bold text-green-500">{quizStats.bestAccuracy}%</h4>
                        <p className="text-xs text-gray-500">Akurasi Terbaik</p>
                    </div>
                </motion.div>

                {/* --- TAB SWITCHER --- */}
                 <div className="p-4 md:p-0">
                    <div className="flex items-center bg-gray-200/70 rounded-full p-1 max-w-sm mx-auto">
                        <button onClick={() => setActiveTab('materi')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'materi' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}><FiBookOpen className="inline mr-1 mb-0.5"/> Daftar Kuis</button>
                        <button onClick={() => setActiveTab('nilai')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'nilai' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}><FiClipboard className="inline mr-1 mb-0.5"/> Riwayat & Nilai</button>
                    </div>
                </div>

                {renderContent()}
            </main>
        </div>
    );
};

export default QuizPage;