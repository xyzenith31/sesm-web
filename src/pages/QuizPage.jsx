import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAward, FiBookOpen, FiStar, FiLoader, FiAlertCircle } from 'react-icons/fi';
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
                        <span className="flex items-center"><FiAward className="mr-1 text-yellow-500"/>{quiz.points || 2500} Poin</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const QuizPage = ({ onNavigate, onSelectQuiz }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('Semua');

    useEffect(() => {
        setLoading(true);
        DataService.getAllQuizzes()
            .then(response => {
                setQuizzes(response.data);
            })
            .catch(err => {
                setError("Gagal memuat daftar kuis. Coba lagi nanti.");
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const categories = useMemo(() => ['Semua', ...new Set(quizzes.map(q => q.subject || q.recommended_level).filter(Boolean))], [quizzes]);
    const filteredQuizzes = activeFilter === 'Semua' 
        ? quizzes 
        : quizzes.filter(q => (q.subject || q.recommended_level) === activeFilter);
    const featuredQuiz = quizzes[0];

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
        }
        if (error) {
            return <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg"><FiAlertCircle className="mx-auto text-3xl mb-2"/><p>{error}</p></div>;
        }
        return (
            <>
                {featuredQuiz && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><FiStar className="mr-2 text-yellow-400"/> Kuis Unggulan</h2>
                        <QuizCard quiz={featuredQuiz} onSelect={onSelectQuiz} />
                    </div>
                )}
                <div>
                    <h2 className="text-lg font-bold text-gray-700 my-3">Daftar Kuis</h2>
                    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 ${activeFilter === cat ? 'bg-sesm-deep text-white' : 'bg-white text-gray-600'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <motion.div layout className="space-y-3">
                        {filteredQuizzes.filter(q => q.id !== featuredQuiz?.id).map(quiz => (
                            <QuizCard key={quiz.id} quiz={quiz} onSelect={onSelectQuiz} />
                        ))}
                    </motion.div>
                </div>
            </>
        );
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
                    <div className="bg-white p-4 rounded-xl shadow-sm"><h4 className="text-2xl font-bold text-sesm-teal">12</h4><p className="text-xs text-gray-500">Kuis Selesai</p></div>
                    <div className="bg-white p-4 rounded-xl shadow-sm"><h4 className="text-2xl font-bold text-green-500">95%</h4><p className="text-xs text-gray-500">Akurasi Terbaik</p></div>
                </motion.div>
                {renderContent()}
            </main>
        </div>
    );
};

export default QuizPage;