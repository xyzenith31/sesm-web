import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiClock, FiAward, FiCheck, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';
import AnswerFeedback from '../components/AnswerFeedback';
import thankYouMeme from '../assets/meme/terima-kasih.jpeg';
import DataService from '../services/dataService';

// Impor Meme (tidak berubah)
const correctMemeModules = import.meta.glob('/src/assets/meme/meme-benar/*.jpeg', { eager: true });
const incorrectMemeModules = import.meta.glob('/src/assets/meme/meme-salah/*.jpeg', { eager: true });
const correctMemes = Object.values(correctMemeModules).map(module => module.default);
const incorrectMemes = Object.values(incorrectMemeModules).map(module => module.default);

const QUIZ_DURATION = 20;

// Komponen MemeOverlay dan QuizLeaderboard (tidak berubah)
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

const QuizLeaderboard = ({ score, results, onCompleteQuiz }) => {
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

                <motion.button onClick={onCompleteQuiz} className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg mt-6" whileTap={{ scale: 0.95 }}>
                    Kembali ke Daftar Kuis
                </motion.button>
            </motion.div>
        </div>
    );
};


// --- Komponen Utama QuizForm (DIPERBAIKI) ---
const QuizForm = ({ quizData: initialQuizData, onCompleteQuiz }) => {
    // --- STATE BARU: Untuk menyimpan data kuis lengkap dan status loading ---
    const [fullQuizData, setFullQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [gameState, setGameState] = useState('playing'); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
    const [activeMeme, setActiveMeme] = useState({ src: null, title: '' });
    const [results, setResults] = useState([]); 
    const [feedback, setFeedback] = useState({ show: false, isCorrect: false });

    // --- EFFECT BARU: Untuk mengambil data pertanyaan saat komponen dimuat ---
    useEffect(() => {
        if (!initialQuizData?.id) {
            setError("Data kuis tidak valid.");
            setLoading(false);
            return;
        }

        setLoading(true);
        DataService.getQuizForStudent(initialQuizData.id)
            .then(response => {
                // Gabungkan data awal (judul, dll) dengan data pertanyaan yang baru didapat
                setFullQuizData({ ...initialQuizData, questions: response.data });
            })
            .catch(err => {
                console.error("Gagal mengambil soal kuis:", err);
                setError("Tidak dapat memuat soal kuis. Silakan coba lagi.");
            })
            .finally(() => {
                setLoading(false);
            });

    }, [initialQuizData]);
    
    // Gunakan state baru 'fullQuizData' untuk mendapatkan pertanyaan
    const currentQuestion = useMemo(() => fullQuizData?.questions?.[currentQuestionIndex], [currentQuestionIndex, fullQuizData]);

    const submitAndFinishQuiz = useCallback(async (finalResults) => {
        setGameState('submitting');
        try {
            const answersPayload = finalResults.map(r => ({ questionId: r.questionId, answer: r.answer }));
            const response = await DataService.submitQuizAnswers(initialQuizData.id, answersPayload);
            setScore(response.data.score);
            setActiveMeme({ src: thankYouMeme, title: "Terima Kasih Telah Bermain!" });
            setGameState('meme');
        } catch (error) {
            console.error("Gagal submit kuis:", error);
            alert("Gagal mengirim jawaban, coba lagi.");
            setGameState('playing');
        }
    }, [initialQuizData.id]);

    const goToNextStep = useCallback(() => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex >= fullQuizData?.questions?.length) {
            submitAndFinishQuiz(results);
        } else {
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswer(null);
            setTimeLeft(QUIZ_DURATION);
            setGameState('playing');
        }
    }, [currentQuestionIndex, fullQuizData?.questions?.length, results, submitAndFinishQuiz]);

    const handleAnswerSubmit = useCallback((answer) => {
        if (gameState !== 'playing' || !currentQuestion) return;
        setGameState('feedback');

        const correctAnswer = currentQuestion.options.find(opt => opt.is_correct)?.option_text;
        const isCorrect = answer === correctAnswer;
        
        const resultToSave = { 
            questionId: currentQuestion.id,
            answer: answer || "",
            isCorrect: isCorrect,
            question: currentQuestion.question_text
        };
        
        setResults(prev => [...prev, resultToSave]);
        setFeedback({ show: true, isCorrect });

        setTimeout(() => {
            setFeedback({ show: false, isCorrect: false });
            goToNextStep();
        }, 1200);

    }, [gameState, currentQuestion, goToNextStep]);

    useEffect(() => {
        if (gameState !== 'playing' || !fullQuizData || !currentQuestion) return;
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
    }, [gameState, currentQuestionIndex, handleAnswerSubmit, fullQuizData, currentQuestion]);
    
    const getButtonClass = (option) => {
        const isSubmitted = gameState !== 'playing';
        if (!isSubmitted) return selectedAnswer === option ? 'bg-sesm-teal text-white' : 'bg-white';
        
        const correctAnswer = currentQuestion.options.find(opt => opt.is_correct)?.option_text;
        if (option === correctAnswer) return 'bg-green-500 text-white';
        if (option === selectedAnswer) return 'bg-red-500 text-white';
        return 'bg-white opacity-60';
    };

    // --- Tampilan Loading dan Error ---
    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex justify-center items-center flex-col"><FiLoader className="animate-spin text-3xl text-sesm-teal mb-4"/><p className="font-semibold text-gray-600">Memuat soal...</p></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
                <FiAlertCircle className="text-5xl text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Terjadi Kesalahan</h2>
                <p className="text-gray-600 mt-2">{error}</p>
                <button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white font-semibold rounded-lg">Kembali</button>
            </div>
        );
    }
    
    // Cek jika setelah loading selesai, soal tetap tidak ada
    if (!fullQuizData?.questions || fullQuizData.questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
                <FiAlertCircle className="text-5xl text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Kuis Belum Siap</h2>
                <p className="text-gray-600 mt-2">Maaf, kuis ini belum memiliki soal. Silakan coba kuis yang lain.</p>
                <button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white font-semibold rounded-lg">Kembali</button>
            </div>
        );
    }

    if (gameState === 'submitting') {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <FiLoader className="animate-spin text-4xl text-sesm-teal mb-4" />
                <p className="font-semibold text-gray-600">Mengirim jawaban...</p>
            </div>
        );
    }

    if (gameState === 'finished' && !activeMeme.src) {
        return <QuizLeaderboard score={score} results={results} onCompleteQuiz={onCompleteQuiz} />;
    }

    const handleMemeClose = () => {
        if (gameState === 'meme') {
            setGameState('finished');
            setActiveMeme({ src: null, title: '' });
        } else {
            goToNextStep();
        }
    }

    return (
        <>
            <AnimatePresence>
                {activeMeme.src && <MemeOverlay meme={activeMeme.src} title={activeMeme.title} onClose={handleMemeClose} />}
                {feedback.show && <AnswerFeedback isCorrect={feedback.isCorrect} />}
            </AnimatePresence>

            <div className="min-h-screen bg-gray-100 flex flex-col">
                <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
                    <button onClick={onCompleteQuiz} className="p-2 rounded-full hover:bg-gray-100"><FiArrowLeft size={24} className="text-gray-700" /></button>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mx-4"><motion.div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(timeLeft / QUIZ_DURATION) * 100}%` }} /></div>
                    <div className="flex items-center space-x-2 font-bold text-sesm-deep text-lg"><FiClock /><span>{timeLeft}</span></div>
                </header>
                <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    {currentQuestion && (
                        <div className="w-full max-w-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQuestionIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                                    <p className="text-sm font-semibold text-gray-500">Pertanyaan {currentQuestionIndex + 1} dari {fullQuizData.questions.length}</p>
                                    <h2 className="text-2xl md:text-3xl font-bold text-sesm-deep mt-2 mb-8">{currentQuestion.question_text}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentQuestion.options.map((option) => (
                                            <motion.button key={option.id} onClick={() => setSelectedAnswer(option.option_text)} className={`p-4 rounded-lg font-semibold text-lg shadow-md transition-colors ${getButtonClass(option.option_text)}`} whileHover={{ scale: gameState === 'playing' ? 1.03 : 1 }} whileTap={{ scale: gameState === 'playing' ? 0.98 : 1 }} disabled={gameState !== 'playing'}>
                                                {option.option_text}
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
                </footer>
            </div>
        </>
    );
};

export default QuizForm;