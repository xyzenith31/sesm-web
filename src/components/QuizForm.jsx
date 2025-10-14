// contoh-sesm-web/components/QuizForm.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiClock, FiAward, FiCheck, FiX, FiLoader, FiAlertCircle, FiDownload, FiLink } from 'react-icons/fi';
import AnswerFeedback from '../components/AnswerFeedback';
import thankYouMeme from '../assets/meme/terima-kasih.jpeg';
import salahMeme from '../assets/meme/meme-salah/9.jpeg'; // Meme untuk jawaban salah
import DataService from '../services/dataService';

// Komponen MemeOverlay, QuizLeaderboard, MediaViewer (tidak berubah)
const MemeOverlay = ({ meme, title, onClose }) => { if (!meme) return null; return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center flex-col p-4" onClick={onClose}>{title && <h2 className="text-white text-3xl font-bold mb-4 text-center">{title}</h2>}<img src={meme} alt="Meme" className="max-w-sm max-h-[60vh] rounded-lg shadow-lg" /><p className="text-white font-semibold mt-4 text-lg">Klik di mana saja untuk melanjutkan</p></motion.div>);};
const QuizLeaderboard = ({ score, results, onCompleteQuiz, showLeaderboard }) => { const correctAnswers = results.filter(r => r.isCorrect).length; const incorrectAnswers = results.length - correctAnswers; if (!showLeaderboard) { onCompleteQuiz(); return null; } return (<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4"><motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center"><FiAward className="text-yellow-500 text-6xl mx-auto mb-4" /><h2 className="text-2xl font-bold text-sesm-deep">Kuis Selesai!</h2><p className="text-gray-600 mt-2">Skor akhir kamu:</p><p className="text-5xl font-bold text-sesm-teal my-3">{score}</p><div className="flex justify-around my-6"><div className="text-center"><p className="text-3xl font-bold text-green-500">{correctAnswers}</p><p className="text-sm text-gray-600">Benar</p></div><div className="text-center"><p className="text-3xl font-bold text-red-500">{incorrectAnswers}</p><p className="text-sm text-gray-600">Salah</p></div></div><div className="text-left"><h3 className="font-bold text-lg text-gray-700 mb-3">Ringkasan Jawaban</h3><div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-t pt-2">{results.map((result, index) => (<div key={index} className={`flex items-center justify-between p-2 rounded-lg ${result.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}><p className="text-sm text-gray-800 truncate flex-1 mr-2">{index + 1}. {result.question}</p>{result.isCorrect ? <FiCheck className="text-green-600"/> : <FiX className="text-red-600"/>}</div>))}</div></div><motion.button onClick={onCompleteQuiz} className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg mt-6" whileTap={{ scale: 0.95 }}>Kembali ke Daftar Kuis</motion.button></motion.div></div>);};
const MediaViewer = ({ attachments }) => {
    const API_URL = 'http://localhost:8080';
    const getYouTubeEmbedUrl = (url) => { const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; const match = url.match(regExp); return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null; };
    if (!attachments || attachments.length === 0) return null;
    return (
        <div className="mb-6 space-y-4 max-w-lg mx-auto">
            {attachments.map((item, index) => {
                if (item.type === 'file') {
                    const fullFileUrl = `${API_URL}/${item.url}`;
                    const fileExtension = item.url.split('.').pop().toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) return <img key={index} src={fullFileUrl} alt={`Lampiran ${index+1}`} className="max-w-full mx-auto rounded-lg shadow-md" />;
                    if (['mp4', 'webm'].includes(fileExtension)) return <video key={index} src={fullFileUrl} controls className="w-full rounded-lg shadow-md" />;
                    if (['mp3', 'wav', 'ogg'].includes(fileExtension)) return <audio key={index} src={fullFileUrl} controls className="w-full" />;
                    return <a key={index} href={fullFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-sesm-deep font-semibold hover:bg-gray-200"><FiDownload /><span>Lihat/Unduh Lampiran ({fileExtension.toUpperCase()})</span></a>;
                }
                if (item.type === 'link') {
                    const embedUrl = getYouTubeEmbedUrl(item.url);
                    if (embedUrl) return (<div key={index} className="aspect-video bg-black rounded-lg overflow-hidden shadow-md"><iframe src={embedUrl} title={`YouTube video ${index}`} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>);
                    return <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-blue-600 font-semibold hover:bg-gray-200"><FiLink /><span>Buka Tautan</span></a>;
                }
                return null;
            })}
        </div>
    );
};
const EssayInput = ({ answer, onChange, disabled }) => (<textarea value={answer} onChange={onChange} disabled={disabled} placeholder="Tulis jawaban esaimu di sini..." className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal transition"/>);

const QuizForm = ({ quizData: initialQuizData, onCompleteQuiz }) => {
    const [fullQuizData, setFullQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameState, setGameState] = useState('playing'); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState({ mc: null, essay: '' });
    const [score, setScore] = useState(0);
    
    // --- PERUBAHAN 1: Buat state & konstanta untuk Pertanyaan Tebusan ---
    const [isRedemptionRound, setIsRedemptionRound] = useState(false);
    const [redemptionAttempts, setRedemptionAttempts] = useState({});
    const REDEMPTION_DURATION = 10; // Waktu tebusan 10 detik

    const QUIZ_DURATION = useMemo(() => fullQuizData?.setting_time_per_question || 20, [fullQuizData]);
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
    const [activeMeme, setActiveMeme] = useState({ src: null, title: '' });
    const [results, setResults] = useState([]); 
    const [feedback, setFeedback] = useState({ show: false, isCorrect: false });

    useEffect(() => {
        if (!initialQuizData?.id) { setError("Data kuis tidak valid."); setLoading(false); return; }
        setLoading(true);
        DataService.getQuizForStudent(initialQuizData.id)
            .then(response => {
                // Gabungkan data awal (dengan setting) dan data soal
                const mergedData = { ...initialQuizData, questions: response.data };
                setFullQuizData(mergedData);
                // Atur waktu awal berdasarkan data yang sudah digabung
                setTimeLeft(mergedData.setting_time_per_question || 20);
            })
            .catch(err => { console.error(err); setError("Tidak dapat memuat soal kuis."); })
            .finally(() => setLoading(false));
    }, [initialQuizData]);
    
    const currentQuestion = useMemo(() => fullQuizData?.questions?.[currentQuestionIndex], [currentQuestionIndex, fullQuizData]);

    const submitAndFinishQuiz = useCallback(async (finalResults) => {
        setGameState('submitting');
        try {
            const answersPayload = finalResults.map(r => ({ questionId: r.questionId, answer: r.answer }));
            const response = await DataService.submitQuizAnswers(initialQuizData.id, answersPayload);
            setScore(response.data.score);
            if (fullQuizData?.setting_show_memes) {
                setActiveMeme({ src: thankYouMeme, title: "Terima Kasih Telah Bermain!" });
                setGameState('meme');
            } else {
                setGameState('finished');
            }
        } catch (error) { console.error(error); alert("Gagal mengirim jawaban."); setGameState('playing'); }
    }, [initialQuizData.id, fullQuizData?.setting_show_memes]);

    const goToNextStep = useCallback(() => {
        setIsRedemptionRound(false); // Selalu reset status tebusan
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex >= fullQuizData?.questions?.length) {
            submitAndFinishQuiz(results);
        } else {
            setCurrentQuestionIndex(nextIndex);
            setAnswer({ mc: null, essay: '' });
            setTimeLeft(QUIZ_DURATION);
            setGameState('playing');
        }
    }, [currentQuestionIndex, fullQuizData?.questions?.length, results, submitAndFinishQuiz, QUIZ_DURATION]);

    // --- PERUBAHAN 2: Logika Submit Jawaban Diperbarui Total ---
    const handleAnswerSubmit = useCallback(() => {
        if (gameState !== 'playing' || !currentQuestion) return;

        const correctAnswerMC = currentQuestion.options?.find(opt => opt.is_correct)?.option_text;
        let isCorrect = false;
        let submittedAnswer = '';

        if (currentQuestion.question_type.includes('pilihan-ganda')) {
            isCorrect = answer.mc === correctAnswerMC;
            submittedAnswer = answer.mc || '';
        }
        if (currentQuestion.question_type.includes('esai')) {
            isCorrect = false; 
            submittedAnswer = `${submittedAnswer}${submittedAnswer && answer.essay ? ' | ' : ''}${answer.essay}`;
        }
        
        // Cek untuk pertanyaan tebusan
        if (!isCorrect && !isRedemptionRound && fullQuizData.setting_allow_redemption && !redemptionAttempts[currentQuestion.id] && currentQuestion.question_type.includes('pilihan-ganda')) {
            setRedemptionAttempts(prev => ({...prev, [currentQuestion.id]: true}));
            setIsRedemptionRound(true);
            setGameState('playing'); // Kembali ke state bermain untuk menjawab lagi
            setAnswer({ mc: null, essay: '' });
            setTimeLeft(REDEMPTION_DURATION);
            if (fullQuizData?.setting_show_memes) {
                setActiveMeme({ src: salahMeme, title: "Waduh, coba lagi!" });
            }
            return; // Hentikan eksekusi, jangan lanjut ke `goToNextStep`
        }

        // Proses jawaban seperti biasa jika bukan tebusan atau jika tebusan sudah selesai
        setGameState('feedback');
        const resultToSave = { questionId: currentQuestion.id, answer: submittedAnswer, isCorrect, question: currentQuestion.question_text };
        setResults(prev => [...prev, resultToSave]);
        
        if (fullQuizData?.setting_show_memes) {
            setFeedback({ show: true, isCorrect });
        }
        
        setTimeout(() => { 
            setFeedback({ show: false, isCorrect: false }); 
            goToNextStep(); 
        }, 1200);
    }, [gameState, currentQuestion, answer, isRedemptionRound, redemptionAttempts, fullQuizData, goToNextStep]);
    
    useEffect(() => {
        // --- PERUBAHAN 3: Timer hanya berjalan jika diaktifkan di setting ---
        if (gameState !== 'playing' || !fullQuizData || !currentQuestion || !fullQuizData.setting_is_timer_enabled) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timer); handleAnswerSubmit(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState, currentQuestionIndex, handleAnswerSubmit, fullQuizData, currentQuestion, isRedemptionRound]);
    
    const getButtonClass = (option) => {
        if (!currentQuestion) return 'bg-white';
        const isSubmitted = gameState !== 'playing';
        const isSelected = answer.mc === option;
        if (!isSubmitted) return isSelected ? 'bg-sesm-teal text-white' : 'bg-white';
        const correctAnswer = currentQuestion.options.find(opt => opt.is_correct)?.option_text;
        if (option === correctAnswer) return 'bg-green-500 text-white';
        if (isSelected) return 'bg-red-500 text-white';
        return 'bg-white opacity-60';
    };

    if (loading) return <div className="min-h-screen bg-gray-100 flex justify-center items-center flex-col"><FiLoader className="animate-spin text-3xl text-sesm-teal mb-4"/><p>Memuat soal...</p></div>;
    if (error) return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center"><FiAlertCircle className="text-5xl text-red-500 mb-4" /><h2 className="text-2xl font-bold">Terjadi Kesalahan</h2><p>{error}</p><button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white rounded-lg">Kembali</button></div>;
    if (!fullQuizData?.questions || fullQuizData.questions.length === 0) return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center"><FiAlertCircle className="text-5xl text-yellow-500 mb-4" /><h2 className="text-2xl font-bold">Kuis Belum Siap</h2><p>Kuis ini belum memiliki soal.</p><button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white rounded-lg">Kembali</button></div>;
    if (gameState === 'submitting') return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center"><FiLoader className="animate-spin text-4xl text-sesm-teal mb-4" /><p>Mengirim jawaban...</p></div>;
    if (gameState === 'finished' && !activeMeme.src) return <QuizLeaderboard score={score} results={results} onCompleteQuiz={onCompleteQuiz} showLeaderboard={fullQuizData.setting_show_leaderboard} />;
    
    const handleMemeClose = () => {
        setActiveMeme({ src: null, title: '' });
        if (gameState === 'meme') {
            setGameState('finished');
        }
    };

    const isAnswered = answer.mc || (answer.essay && answer.essay.trim() !== '');

    return (
        <>
            <AnimatePresence>{activeMeme.src && <MemeOverlay meme={activeMeme.src} title={activeMeme.title} onClose={handleMemeClose} />}</AnimatePresence>
            <AnimatePresence>{feedback.show && <AnswerFeedback isCorrect={feedback.isCorrect} />}</AnimatePresence>
            <div className="min-h-screen bg-gray-100 flex flex-col">
                {/* --- PERUBAHAN 4: Tampilkan header timer secara kondisional --- */}
                {fullQuizData?.setting_is_timer_enabled && (
                    <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
                        <button onClick={onCompleteQuiz} className="p-2 rounded-full hover:bg-gray-100"><FiArrowLeft size={24} /></button>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mx-4">
                            <motion.div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(timeLeft / (isRedemptionRound ? REDEMPTION_DURATION : QUIZ_DURATION)) * 100}%` }} />
                        </div>
                        <div className="flex items-center space-x-2 font-bold text-sesm-deep text-lg w-16 justify-end"><FiClock /><span>{timeLeft}</span></div>
                    </header>
                )}
                <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    {currentQuestion && (
                        <div className="w-full max-w-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQuestionIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                                    {isRedemptionRound && <p className="font-bold text-red-500 mb-2">Kesempatan Kedua!</p>}
                                    <p className="text-sm font-semibold text-gray-500">Pertanyaan {currentQuestionIndex + 1} dari {fullQuizData.questions.length}</p>
                                    <MediaViewer attachments={currentQuestion.media_attachments} />
                                    <h2 className="text-2xl md:text-3xl font-bold text-sesm-deep mt-2 mb-8">{currentQuestion.question_text}</h2>
                                    
                                    <div className="space-y-4">
                                        {currentQuestion.question_type.includes('pilihan-ganda') && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentQuestion.options.map((option) => (
                                                    <motion.button key={option.id} onClick={() => setAnswer(a => ({...a, mc: option.option_text}))} className={`p-4 rounded-lg font-semibold text-lg shadow-md transition-colors ${getButtonClass(option.option_text)}`} whileHover={{ scale: gameState === 'playing' ? 1.03 : 1 }} whileTap={{ scale: gameState === 'playing' ? 0.98 : 1 }} disabled={gameState !== 'playing'}>
                                                        {option.option_text}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                        {currentQuestion.question_type.includes('esai') && (
                                            <EssayInput 
                                                answer={answer.essay}
                                                onChange={(e) => setAnswer(a => ({...a, essay: e.target.value}))}
                                                disabled={gameState !== 'playing'}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                             <AnimatePresence>
                                {isAnswered && gameState === 'playing' && (
                                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleAnswerSubmit} className="mt-8 w-full max-w-sm py-3 bg-sesm-deep text-white font-bold rounded-lg shadow-lg">
                                        Jawab
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </main>
                <footer className="p-4 bg-white flex justify-between items-center border-t"><div><p className="text-sm text-gray-500">Skor</p><p className="font-bold text-xl text-sesm-deep">{score}</p></div></footer>
            </div>
        </>
    );
};

export default QuizForm;