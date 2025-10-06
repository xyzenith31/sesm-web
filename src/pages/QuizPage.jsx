import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAward, FiBookOpen, FiStar, FiCheckSquare, FiBarChart2 } from 'react-icons/fi';
import { FaFlask, FaGlobe, FaCalculator } from 'react-icons/fa';

// --- Data Dummy untuk Daftar Kuis ---
const quizzes = [
    { id: 'q1', title: 'Pengetahuan Umum Dasar', creator: 'Zabrina', subject: 'Umum', numberOfQuestions: 5, points: 2500, icon: FaGlobe, questions: [
        { question: "Planet apa yang dikenal sebagai 'Planet Merah'?", options: ['Venus', 'Mars', 'Jupiter', 'Saturnus'], correctAnswer: 'Mars' },
        { question: 'Siapa penemu bola lampu?', options: ['Albert Einstein', 'Isaac Newton', 'Thomas Edison', 'Nikola Tesla'], correctAnswer: 'Thomas Edison' },
        { question: 'Apa ibukota dari negara Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctAnswer: 'Canberra' },
        { question: 'Berapa jumlah provinsi di Indonesia saat ini?', options: ['34', '35', '37', '38'], correctAnswer: '38' },
        { question: 'Manakah hewan tercepat di darat?', options: ['Singa', 'Kuda', 'Cheetah', 'Kijang'], correctAnswer: 'Cheetah' },
    ]},
    { id: 'q2', title: 'Dasar-dasar Sains', creator: 'Andi', subject: 'Sains', numberOfQuestions: 4, points: 2000, icon: FaFlask, questions: [/* ...soal-soal sains... */] },
    { id: 'q3', title: 'Perkalian Cepat', creator: 'Zabrina', subject: 'Matematika', numberOfQuestions: 5, points: 2600, icon: FaCalculator, questions: [/* ...soal-soal matematika... */] },
    { id: 'q4', title: 'Ibukota Negara Dunia', creator: 'Citra', subject: 'Umum', numberOfQuestions: 6, points: 3000, icon: FaGlobe, questions: [/* ...soal-soal geografi... */] },
];

const categories = ['Semua', 'Umum', 'Sains', 'Matematika'];

const QuizCard = ({ quiz, onSelect }) => (
    <motion.div
        onClick={() => onSelect(quiz)}
        className="bg-white p-4 rounded-xl shadow-sm cursor-pointer border-2 border-transparent hover:border-sesm-teal transition-all"
        whileHover={{ y: -5 }}
        layout
    >
        <div className="flex items-start space-x-4">
            <div className="bg-sesm-teal/10 text-sesm-teal p-3 rounded-lg"><quiz.icon size={24}/></div>
            <div className='flex-grow'>
                <h3 className="font-bold text-sesm-deep">{quiz.title}</h3>
                <p className="text-xs text-gray-500">oleh {quiz.creator} • {quiz.subject}</p>
                <div className="flex items-center space-x-4 text-xs mt-2 text-gray-600">
                    <span className="flex items-center"><FiBookOpen className="mr-1"/>{quiz.numberOfQuestions} Soal</span>
                    <span className="flex items-center"><FiAward className="mr-1 text-yellow-500"/>{quiz.points} Poin</span>
                </div>
            </div>
        </div>
    </motion.div>
);

const QuizPage = ({ onNavigate, onSelectQuiz }) => {
    const [activeFilter, setActiveFilter] = useState('Semua');
    const filteredQuizzes = activeFilter === 'Semua' ? quizzes : quizzes.filter(q => q.subject === activeFilter);

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
                
                <div>
                    <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><FiStar className="mr-2 text-yellow-400"/> Kuis Unggulan</h2>
                    <QuizCard quiz={quizzes[0]} onSelect={onSelectQuiz} />
                </div>
                
                <div>
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Daftar Kuis</h2>
                    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 ${activeFilter === cat ? 'bg-sesm-deep text-white' : 'bg-white text-gray-600'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <motion.div layout className="space-y-3">
                        {filteredQuizzes.slice(1).map(quiz => ( // Tampilkan sisa kuis
                            <QuizCard key={quiz.id} quiz={quiz} onSelect={onSelectQuiz} />
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default QuizPage;