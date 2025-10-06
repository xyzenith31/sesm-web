import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiClock, FiAward, FiCheck, FiX } from 'react-icons/fi';
import AnswerFeedback from '../components/AnswerFeedback';

// --- Impor Semua Meme Secara Dinamis ---
const correctMemeModules = import.meta.glob('/src/assets/meme/meme-benar/*.jpeg', { eager: true });
const incorrectMemeModules = import.meta.glob('/src/assets/meme/meme-salah/*.jpeg', { eager: true });
// Dibuat lebih fleksibel, akan mengambil file .jpeg APAPUN di dalam folder terima-kasih
const thankYouMemeModule = import.meta.glob('/src/assets/meme/terima-kasih/*.jpeg', { eager: true });

const correctMemes = Object.values(correctMemeModules).map(module => module.default);
const incorrectMemes = Object.values(incorrectMemeModules).map(module => module.default);
const thankYouMeme = Object.values(thankYouMemeModule)[0]?.default;

// --- Data Kuis & Konfigurasi ---
const QUIZ_DURATION = 20;
const quizData = {
  questions: [
    { question: "Planet apa yang dikenal sebagai 'Planet Merah'?", options: ['Venus', 'Mars', 'Jupiter', 'Saturnus'], correctAnswer: 'Mars' },
    { question: 'Siapa penemu bola lampu?', options: ['Albert Einstein', 'Isaac Newton', 'Thomas Edison', 'Nikola Tesla'], correctAnswer: 'Thomas Edison' },
    { question: 'Apa ibukota dari negara Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctAnswer: 'Canberra' },
    { question: 'Berapa jumlah provinsi di Indonesia saat ini?', options: ['34', '35', '37', '38'], correctAnswer: '38' },
    { question: 'Manakah hewan tercepat di darat?', options: ['Singa', 'Kuda', 'Cheetah', 'Kijang'], correctAnswer: 'Cheetah' },
  ],
};

// --- Komponen-komponen ---

const MemeOverlay = ({ meme, title, onClose }) => {
    if (!meme) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center flex-col p-4" onClick={onClose}>
            {title && <h2 className="text-white text-3xl font-bold mb-4 text-center">{title}</h2>}
            <img src={meme} alt="Meme" className="max-w-sm max-h-[60vh] rounded-lg shadow-lg" />
            <p className="text-white font-semibold mt-4 text-lg">Klik di mana saja untuk melanjutkan</p>
        </motion.div>
    );
};

// --- Komponen Leaderboard/Hasil Akhir ---
const QuizLeaderboard = ({ score, results, onNavigate }) => {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const incorrectAnswers = results.length - correctAnswers;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
                <FiAward className="text-yellow-500 text-6xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-sesm-deep">Kuis Selesai!</h2>
                <p className="text-gray-600 mt-2">Skor akhir kamu:</p>
                <p className="text-5xl font-bold text-sesm-teal my-3">{score}</p>
                
                <div className="flex justify-around my-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">{correctAnswers}</p>
                        <p className="text-sm text-gray-600">Benar</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-red-500">{incorrectAnswers}</p>
                        <p className="text-sm text-gray-600">Salah</p>
                    </div>
                </div>

                <div className="text-left">
                    <h3 className="font-bold text-lg text-gray-700 mb-3">Ringkasan Jawaban</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-t pt-2">
                        {results.map((result, index) => (
                            <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${result.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                <p className="text-sm text-gray-800 truncate flex-1 mr-2">{index + 1}. {result.question}</p>
                                {result.isCorrect ? <FiCheck className="text-green-600"/> : <FiX className="text-red-600"/>}
                            </div>
                        ))}
                    </div>
                </div>

                <motion.button onClick={() => onNavigate('explore')} className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg mt-6" whileTap={{ scale: 0.95 }}>
                    Kembali ke Explore
                </motion.button>
            </motion.div>
        </div>
    );
};


// --- Komponen Utama QuizPage ---
const QuizPage = ({ onNavigate }) => {
    const [gameState, setGameState] = useState('playing'); // 'playing', 'feedback', 'meme', 'finished'
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
    
    const [correctStreak, setCorrectStreak] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [activeMeme, setActiveMeme] = useState({ src: null, title: '' });
    
    const [results, setResults] = useState([]);
    const [feedback, setFeedback] = useState({ show: false, isCorrect: false });

    const currentQuestion = useMemo(() => quizData.questions[currentQuestionIndex], [currentQuestionIndex]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAnswerSubmit(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState, currentQuestionIndex]);

    const handleAnswerSubmit = (answer) => {
        if (gameState !== 'playing') return;

        setGameState('feedback'); // Kunci jawaban, tampilkan notifikasi
        const isCorrect = answer === currentQuestion.correctAnswer;
        
        setResults(prev => [...prev, { question: currentQuestion.question, isCorrect }]);
        setFeedback({ show: true, isCorrect });

        let memeToShow = { src: null, title: '' };

        if (isCorrect) {
            setScore(prev => prev + 500 + Math.floor(timeLeft * (500 / QUIZ_DURATION)));
            const newStreak = correctStreak + 1;
            setCorrectStreak(newStreak);
            if (newStreak === 3 && correctMemes.length > 0) {
                memeToShow = { src: correctMemes[Math.floor(Math.random() * correctMemes.length)], title: 'Kamu Terlalu Benar!' };
                setCorrectStreak(0);
            }
        } else {
            setCorrectStreak(0);
            const newIncorrectCount = incorrectCount + 1;
            setIncorrectCount(newIncorrectCount);
            if (newIncorrectCount === 2 && incorrectMemes.length > 0) {
                memeToShow = { src: incorrectMemes[Math.floor(Math.random() * incorrectMemes.length)], title: 'Waduh, Kebanyakan Salah Nih!' };
                setIncorrectCount(0);
            }
        }
        
        setTimeout(() => {
            setFeedback({ show: false, isCorrect: false });
            if (memeToShow.src) {
                setActiveMeme(memeToShow);
                setGameState('meme');
            } else {
                goToNextStep();
            }
        }, 1200); // Durasi notifikasi Benar/Salah
    };

    const goToNextStep = () => {
        setActiveMeme({ src: null, title: '' });
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= quizData.questions.length) {
            setGameState('finished');
            if (thankYouMeme) {
                setActiveMeme({ src: thankYouMeme, title: "Terima Kasih Telah Bermain!" });
            }
        } else {
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswer(null);
            setTimeLeft(QUIZ_DURATION);
            setGameState('playing');
        }
    };
    
    const getButtonClass = (option) => {
        const isSubmitted = gameState !== 'playing';
        if (!isSubmitted) return selectedAnswer === option ? 'bg-sesm-teal text-white' : 'bg-white';
        if (option === currentQuestion.correctAnswer) return 'bg-green-500 text-white';
        if (option === selectedAnswer) return 'bg-red-500 text-white';
        return 'bg-white opacity-60';
    };

    if (gameState === 'finished' && !activeMeme.src) {
        return <QuizLeaderboard score={score} results={results} onNavigate={onNavigate} />;
    }

    return (
        <>
            <AnimatePresence>
                {activeMeme.src && <MemeOverlay meme={activeMeme.src} title={activeMeme.title} onClose={goToNextStep} />}
                {feedback.show && <AnswerFeedback isCorrect={feedback.isCorrect} />}
            </AnimatePresence>

            <div className="min-h-screen bg-gray-100 flex flex-col">
                <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
                    <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-gray-100"><FiArrowLeft size={24} className="text-gray-700" /></button>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mx-4">
                        <motion.div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(timeLeft / QUIZ_DURATION) * 100}%` }} />
                    </div>
                    <div className="flex items-center space-x-2 font-bold text-sesm-deep text-lg"><FiClock /><span>{timeLeft}</span></div>
                </header>

                <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    {currentQuestion && (
                        <div className="w-full max-w-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQuestionIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                                    <p className="text-sm font-semibold text-gray-500">Pertanyaan {currentQuestionIndex + 1} dari {quizData.questions.length}</p>
                                    <h2 className="text-2xl md:text-3xl font-bold text-sesm-deep mt-2 mb-8">{currentQuestion.question}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentQuestion.options.map((option) => (
                                            <motion.button
                                                key={option}
                                                onClick={() => setSelectedAnswer(option)}
                                                className={`p-4 rounded-lg font-semibold text-lg shadow-md transition-colors ${getButtonClass(option)}`}
                                                whileHover={{ scale: gameState === 'playing' ? 1.03 : 1 }}
                                                whileTap={{ scale: gameState === 'playing' ? 0.98 : 1 }}
                                                disabled={gameState !== 'playing'}
                                            >
                                                {option}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                             <AnimatePresence>
                                {selectedAnswer && gameState === 'playing' && (
                                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => handleAnswerSubmit(selectedAnswer)} className="mt-8 w-full max-w-sm py-3 bg-sesm-deep text-white font-bold rounded-lg shadow-lg">
                                        Jawab
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </main>

                <footer className="p-4 bg-white flex justify-between items-center border-t">
                    <div><p className="text-sm text-gray-500">Skor</p><p className="font-bold text-xl text-sesm-deep">{score}</p></div>
                    <div className='flex items-center space-x-2'><span className='font-bold text-amber-500'>Streak: {correctStreak} 🔥</span></div>
                </footer>
            </div>
        </>
    );
};

export default QuizPage;