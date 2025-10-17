// contoh-sesm-web/pages/WorksheetPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiFlag, FiCheckCircle, FiChevronLeft, FiChevronRight, FiMenu, FiX, FiDownload, FiLink, FiAward, FiClock, FiAlertTriangle, FiLoader, FiEye } from 'react-icons/fi';
import DataService from '../services/dataService';
import ConfirmationModal from '../components/mod/ConfirmationModal';
import PointsNotification from '../components/ui/PointsNotification';

// --- Komponen Helper (Tidak perlu diubah) ---
const ImageLightbox = ({ imageUrl, onClose }) => { /* ... kode tidak berubah ... */ };
const MediaViewer = ({ mediaUrls, onImageClick }) => { /* ... kode tidak berubah ... */ };
const EssayInput = ({ answer, onChange, isReviewing }) => (
    <textarea
        value={answer}
        onChange={onChange}
        disabled={isReviewing}
        placeholder="Tulis jawaban esaimu di sini..."
        className={`w-full h-40 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal transition-colors ${isReviewing ? 'bg-gray-200' : ''}`}
    />
);

// --- Komponen Helper yang Diperbarui ---

// Tombol Pilihan Ganda dengan Logika untuk Mode Tinjau
const OptionButton = ({ option, userAnswer, correctAnswer, onClick, isReviewing }) => {
    const isSelected = userAnswer === option;
    let buttonClass = 'bg-white hover:bg-gray-100 border-gray-300'; // Default

    if (isReviewing) {
        if (option === correctAnswer) {
            buttonClass = 'bg-green-100 border-green-500 text-green-800'; // Jawaban benar
        } else if (isSelected) {
            buttonClass = 'bg-red-100 border-red-500 text-red-800'; // Jawaban siswa yang salah
        } else {
            buttonClass = 'bg-gray-100 border-gray-200 text-gray-500'; // Opsi lain yang tidak dipilih
        }
    } else if (isSelected) {
        buttonClass = 'bg-sesm-teal text-white border-sesm-teal'; // Opsi yang sedang dipilih
    }

    return (
        <button
            onClick={onClick}
            disabled={isReviewing}
            className={`w-full text-left p-4 rounded-lg font-semibold transition-all duration-200 border-2 flex justify-between items-center ${buttonClass}`}
        >
            <span>{option}</span>
            {isReviewing && option === correctAnswer && <FiCheckCircle className="text-green-600" />}
        </button>
    );
};

// --- Komponen Utama ---

const WorksheetPage = ({ onNavigate, chapterInfo }) => {
    const { materiKey, chapterTitle, subjectName, navigationKey } = chapterInfo || {};
    
    // State Data
    const [questions, setQuestions] = useState([]);
    const [chapterSettings, setChapterSettings] = useState({});
    const [answers, setAnswers] = useState({});
    const [marked, setMarked] = useState({});

    // State Alur & UI
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [showPoints, setShowPoints] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false); // ✅ State baru untuk mode tinjau
    
    // State Timer
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (materiKey) {
            setLoading(true);
            DataService.getDetailMateriForSiswa(materiKey)
                .then(response => {
                    const { questions: fetchedQuestions, settings } = response.data;
                    
                    setChapterSettings(settings || {});

                    let finalQuestions = fetchedQuestions;
                    if (settings?.setting_randomize_questions) {
                        finalQuestions = [...fetchedQuestions].sort(() => Math.random() - 0.5);
                    }
                    
                    setQuestions(finalQuestions);

                    const initialAnswers = {};
                    finalQuestions.forEach(q => { initialAnswers[q.id] = ''; });
                    setAnswers(initialAnswers);
                    setMarked({});

                    if (settings?.setting_time_limit_minutes > 0) {
                        setTimeLeft(settings.setting_time_limit_minutes * 60);
                    }
                })
                .catch(err => { console.error(err); onNavigate('home'); })
                .finally(() => setLoading(false));
        } else {
            onNavigate('home');
        }
    }, [materiKey, onNavigate]);

    const handleSubmit = useCallback(async () => {
        const answerPayload = Object.entries(answers).map(([questionId, answer]) => ({ questionId: parseInt(questionId), answer: answer || "" }));
        try {
            const response = await DataService.submitAnswers(materiKey, answerPayload);
            setSubmissionResult(response.data);
            setIsSubmitted(true);
            setTimeLeft(null); 
            if (response.data.pointsAwarded) setShowPoints(true);
        } catch (error) {
            const message = error.response?.data?.message || "Gagal mengirim jawaban.";
            setSubmissionResult({ message });
            setIsSubmitted(true);
            setTimeLeft(null);
        }
    }, [answers, materiKey]);

    useEffect(() => {
        if (timeLeft === null || isSubmitted) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const intervalId = setInterval(() => { setTimeLeft(prevTime => prevTime - 1); }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, isSubmitted, handleSubmit]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentQuestionIndex];
    const handleAnswerChange = (questionId, answer) => setAnswers(prev => ({ ...prev, [questionId]: answer }));
    const toggleMark = (questionId) => setMarked(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    const goToQuestion = (index) => { if (index >= 0 && index < questions.length) { setCurrentQuestionIndex(index); setIsNavOpen(false); } };
    
    const handleExit = () => { isSubmitted || isReviewing ? onNavigate(navigationKey || 'home') : setIsExitModalOpen(true); };
    const confirmExit = () => { setIsExitModalOpen(false); onNavigate(navigationKey || 'home'); };

    const isQuestionCorrect = (question) => {
        if (!question || !question.correctAnswer) return false;
        const userAnswer = answers[question.id] || '';
        return userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    };
    
    const getNavButtonClass = (q, index) => {
        const isActive = index === currentQuestionIndex;
        if (isReviewing) {
            const isCorrect = isQuestionCorrect(q);
            if(isActive) return isCorrect ? 'bg-green-700 text-white ring-2 ring-white' : 'bg-red-700 text-white ring-2 ring-white';
            return isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
        }
        const isMarked = marked[q.id];
        const isAnswered = answers[q.id] && answers[q.id].trim() !== '';
        if (isActive) return 'bg-sesm-deep text-white';
        if (isMarked) return 'bg-yellow-400 text-white';
        if (isAnswered) return 'bg-green-500 text-white';
        return 'bg-gray-200 text-gray-600 hover:bg-gray-300';
    };

    const isAllAnswered = useMemo(() => {
        if (!chapterSettings.setting_require_all_answers) return true;
        return questions.every(q => answers[q.id] && answers[q.id].trim() !== '');
    }, [answers, questions, chapterSettings]);

    const correctAnswersCount = useMemo(() => {
        if (!isSubmitted) return 0;
        return questions.filter(q => isQuestionCorrect(q)).length;
    }, [isSubmitted, questions, answers]);
    
    if (loading) return <div className="min-h-screen bg-gray-100 flex justify-center items-center"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;

    if (isSubmitted && !isReviewing) {
        return (
            <>
                <AnimatePresence>
                    {showPoints && <PointsNotification points={submissionResult.pointsAwarded} message="Materi Selesai!" onDone={() => setShowPoints(false)} />}
                </AnimatePresence>
                <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
                     <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-sesm-deep">Latihan Selesai!</h2>
                        
                        {submissionResult?.score !== null && submissionResult?.score !== undefined ? (
                            <>
                                <p className="text-gray-600 mt-2">Skor akhir kamu:</p>
                                <p className="text-5xl font-bold text-sesm-teal my-3">{submissionResult.score}</p>
                                <div className="flex justify-around my-4 text-center">
                                    <div><p className="font-bold text-xl text-green-600">{correctAnswersCount}</p><p className="text-xs text-gray-500">Benar</p></div>
                                    <div><p className="font-bold text-xl text-red-600">{questions.length - correctAnswersCount}</p><p className="text-xs text-gray-500">Salah</p></div>
                                    <div><p className="font-bold text-xl text-sesm-deep">{questions.length}</p><p className="text-xs text-gray-500">Total Soal</p></div>
                                </div>
                                {submissionResult.pointsAwarded && (
                                    <p className="flex items-center justify-center font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full"><FiAward className="mr-2"/> +{submissionResult.pointsAwarded} Poin!</p>
                                )}
                            </>
                        ) : ( <p className="text-gray-600 my-4">{submissionResult?.message || "Jawaban telah dikumpulkan."}</p> )}
                        
                        <div className="mt-6 space-y-3">
                            {chapterSettings.setting_show_correct_answers && (
                                <motion.button onClick={() => setIsReviewing(true)} className="w-full py-3 bg-sesm-teal text-white font-bold rounded-lg flex items-center justify-center gap-2" whileTap={{ scale: 0.95 }}>
                                    <FiEye/> Tinjau Jawaban
                                </motion.button>
                            )}
                            <motion.button onClick={handleExit} className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg" whileTap={{ scale: 0.95 }}>
                                Kembali ke Daftar Bab
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </>
        )
    }

    return (
        <>
            <AnimatePresence>{lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}</AnimatePresence>
            <ConfirmationModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} onConfirm={confirmExit} title="Yakin Ingin Keluar?" message="Proses pengerjaan soal Anda belum selesai dan tidak akan disimpan." confirmText="Ya, Keluar" />
            
            <div className="min-h-screen bg-gray-100 flex flex-col md:grid md:grid-cols-4">
                {/* Navigasi Sidebar */}
                <aside className={`fixed md:relative top-0 bottom-0 left-0 w-64 md:w-auto bg-white shadow-lg z-50 p-4 transform md:translate-x-0 md:col-span-1 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`} >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sesm-deep">Navigasi Soal</h3>
                        <button onClick={() => setIsNavOpen(false)} className="md:hidden"><FiX/></button>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, index) => (
                            <button key={q.id} onClick={() => goToQuestion(index)} className={`relative w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all ${getNavButtonClass(q, index)}`}>
                                {index + 1}
                                {marked[q.id] && !isReviewing && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>}
                            </button>
                        ))}
                    </div>
                </aside>

                 <AnimatePresence>
                    {isNavOpen && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsNavOpen(false)} /> )}
                </AnimatePresence>

                {/* Konten Utama */}
                <div className="flex flex-col md:col-span-3">
                    <header className="bg-white p-4 flex items-center sticky top-0 z-10 shadow-sm">
                        <button onClick={() => setIsNavOpen(true)} className="p-2 rounded-full hover:bg-gray-100 md:hidden mr-2"> <FiMenu size={24} className="text-gray-700" /> </button>
                        <button onClick={handleExit} className="p-2 rounded-full hover:bg-gray-100"> <FiArrowLeft size={24} className="text-gray-700" /> </button>
                        <div className="text-center flex-grow">
                            <h1 className="text-lg font-bold text-sesm-deep truncate">{chapterTitle}</h1>
                            <p className="text-xs text-gray-500">{subjectName}</p>
                        </div>
                        {timeLeft !== null ? (
                            <div className="w-24 text-right flex items-center justify-end font-bold text-sesm-deep"><FiClock className="mr-2"/><span>{formatTime(timeLeft)}</span></div>
                        ) : ( <div className="w-24"></div> )}
                    </header>
                    
                    <div className="w-full bg-gray-200 h-2">
                        <motion.div className="bg-sesm-teal h-2" initial={{width: 0}} animate={{width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`}} />
                    </div>

                    <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                        {currentQuestion && (
                            <div className="w-full max-w-2xl">
                                <AnimatePresence mode="wait">
                                    <motion.div key={currentQuestionIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="bg-white p-6 rounded-2xl shadow-md">
                                        <div className="flex justify-between items-start mb-6">
                                            <p className="text-sm font-semibold text-gray-500">Pertanyaan {currentQuestionIndex + 1} dari {questions.length}</p>
                                            {!isReviewing && (
                                                <button onClick={() => toggleMark(currentQuestion.id)} className={`flex items-center gap-2 text-sm font-semibold p-2 rounded-lg ${marked[currentQuestion.id] ? 'bg-yellow-100 text-yellow-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                                                    <FiFlag/> <span>{marked[currentQuestion.id] ? 'Hilangkan Tanda' : 'Tandai Ragu'}</span>
                                                </button>
                                            )}
                                        </div>
                                        <MediaViewer mediaUrls={currentQuestion.media_urls} onImageClick={setLightboxImage} />
                                        <h2 className="text-xl md:text-2xl font-bold text-sesm-deep mb-8 text-left">{currentQuestion.pertanyaan}</h2>
                                        <div className="grid grid-cols-1 gap-4 text-left">
                                            {currentQuestion.tipe_soal.includes('pilihan-ganda') && currentQuestion.options.map((option) => (
                                                <OptionButton key={option} option={option} userAnswer={answers[currentQuestion.id]} correctAnswer={currentQuestion.correctAnswer} onClick={() => handleAnswerChange(currentQuestion.id, option)} isReviewing={isReviewing} />
                                            ))}
                                            {currentQuestion.tipe_soal.includes('esai') && (
                                                <EssayInput answer={answers[currentQuestion.id]} onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)} isReviewing={isReviewing}/>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        )}
                    </main>
                    <footer className="p-4 bg-white flex justify-between items-center border-t">
                        <motion.button onClick={() => goToQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 font-semibold p-3 rounded-lg hover:bg-gray-100 disabled:opacity-50" whileTap={{ scale: 0.95 }}><FiChevronLeft/> Sebelumnya</motion.button>
                        {currentQuestionIndex === questions.length - 1 && !isReviewing ? (
                            <div className="relative">
                                <motion.button onClick={handleSubmit} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed" whileTap={{ scale: 0.95 }} disabled={!isAllAnswered}>Kumpulkan Jawaban</motion.button>
                                {!isAllAnswered && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-md shadow-lg flex items-center gap-2"><FiAlertTriangle size={14}/> Harap jawab semua soal!</div>}
                            </div>
                        ) : (
                            <motion.button onClick={() => goToQuestion(currentQuestionIndex + 1)} disabled={currentQuestionIndex === questions.length - 1} className="flex items-center gap-2 font-semibold p-3 rounded-lg bg-sesm-deep text-white disabled:opacity-50" whileTap={{ scale: 0.95 }}>Selanjutnya <FiChevronRight/></motion.button>
                        )}
                    </footer>
                </div>
            </div>
        </>
    );
};

export default WorksheetPage;