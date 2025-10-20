import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { FiArrowLeft, FiClock, FiAward, FiCheck, FiX, FiLoader, FiAlertCircle, FiDownload, FiLink, FiCheckCircle, FiHelpCircle, FiPause, FiPlay, FiVolume2, FiVolumeX, FiEye, FiAlertTriangle } from 'react-icons/fi';
import AnswerFeedback from '../ui/AnswerFeedback';
import thankYouMeme from '../../assets/meme/terima-kasih.jpeg';
import salahMeme from '../../assets/meme/meme-salah/9.jpeg';
import DataService from '../../services/dataService';

// Helper
const toAlpha = (num) => String.fromCharCode(65 + num);

// --- Komponen-Komponen Baru & Modifikasi ---

const AnimatedNumber = ({ value }) => {
    const ref = useRef(null);
    useEffect(() => {
        const node = ref.current;
        const controls = animate(0, value, {
            duration: 0.5,
            ease: "easeOut",
            onUpdate(latest) {
                if (node) {
                    node.textContent = Math.round(latest).toLocaleString();
                }
            }
        });
        return () => controls.stop();
    }, [value]);
    return <span ref={ref}>0</span>;
};

const PointFloater = ({ points, key }) => (
    <motion.div
        key={key}
        initial={{ y: 0, opacity: 1, scale: 1 }}
        animate={{ y: -60, opacity: 0, scale: 1.5 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 text-2xl font-bold text-green-500"
    >
        +{points}
    </motion.div>
);

const ProgressDots = ({ count, currentIndex, results, onDotClick, isReviewing }) => (
    <div className="flex justify-center items-center gap-2 flex-wrap">
        {Array.from({ length: count }).map((_, index) => {
            const result = results.find(r => r.index === index);
            let statusClass = 'bg-gray-300';
            if (index === currentIndex) {
                statusClass = 'bg-sesm-deep ring-2 ring-sesm-teal';
            } else if (result) {
                statusClass = result.isCorrect ? 'bg-green-400' : 'bg-red-400';
            }
             if (isReviewing) {
                const isCorrect = results.find(r => r.index === index)?.isCorrect;
                 statusClass = isCorrect ? 'bg-green-500' : 'bg-red-500';
                 if (index === currentIndex) {
                    statusClass += ' ring-2 ring-offset-2 ring-offset-white ring-sesm-deep';
                 }
            }

            return (
                <motion.button
                    key={index}
                    onClick={() => onDotClick(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${statusClass}`}
                    whileHover={{ scale: 1.5 }}
                />
            );
        })}
    </div>
);

const QuizReview = ({ results, questions, onCompleteQuiz }) => {
    const [reviewIndex, setReviewIndex] = useState(0);
    const currentQuestion = questions[reviewIndex];
    const result = results.find(r => r.questionId === currentQuestion.id);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col p-4 items-center">
            <h2 className="text-2xl font-bold my-4 text-sesm-deep">Tinjau Jawaban</h2>
             <div className="w-full max-w-2xl mb-4">
                <ProgressDots count={questions.length} currentIndex={reviewIndex} results={results} onDotClick={setReviewIndex} isReviewing={true} />
            </div>
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl text-center flex-grow flex flex-col shadow-lg">
                <p className="font-semibold text-gray-500">Pertanyaan {reviewIndex + 1}</p>
                <h3 className="text-xl font-bold my-4 flex-grow text-gray-800">{currentQuestion.question_text}</h3>
                <div className="space-y-3">
                    {currentQuestion.options.map(opt => {
                        const isCorrect = opt.is_correct;
                        const isUserAnswer = result && result.answer.includes(opt.option_text);
                        let stateClass = 'bg-gray-100 border-gray-200 text-gray-700';
                        if(isCorrect) stateClass = 'bg-green-500 border-green-500 text-white';
                        else if(isUserAnswer) stateClass = 'bg-red-500 border-red-500 text-white';

                        return (
                            <div key={opt.id} className={`p-3 rounded-lg text-left flex items-center justify-between border-2 ${stateClass}`}>
                                <span>{opt.option_text}</span>
                                {isCorrect && <FiCheckCircle />}
                                {!isCorrect && isUserAnswer && <FiXCircle />}
                            </div>
                        )
                    })}
                </div>
                 <div className="flex justify-between items-center mt-6">
                    <button onClick={() => setReviewIndex(i => Math.max(0, i - 1))} disabled={reviewIndex === 0} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 font-semibold">Sebelumnya</button>
                    <button onClick={() => setReviewIndex(i => Math.min(questions.length - 1, i + 1))} disabled={reviewIndex === questions.length - 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 font-semibold">Selanjutnya</button>
                </div>
            </div>
            <button onClick={onCompleteQuiz} className="mt-6 w-full max-w-md py-3 bg-sesm-deep text-white font-bold rounded-lg shadow-lg">Selesai</button>
        </div>
    )
}

const QuitConfirmationModal = ({ isOpen, onCancel, onConfirm }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
                    <FiAlertTriangle className="text-5xl text-yellow-500 mx-auto mb-4"/>
                    <h3 className="text-xl font-bold text-gray-800">Yakin ingin keluar?</h3>
                    <p className="text-gray-600 my-2">Semua progres kuis ini tidak akan disimpan.</p>
                    <div className="flex gap-4 mt-6">
                        <button onClick={onCancel} className="flex-1 py-2 bg-gray-200 font-bold rounded-lg">Batal</button>
                        <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg">Keluar</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const MemeOverlay = ({ meme, title, onClose }) => { if (!meme) return null; return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center flex-col p-4" onClick={onClose}>{title && <h2 className="text-white text-3xl font-bold mb-4 text-center">{title}</h2>}<img src={meme} alt="Meme" className="max-w-sm max-h-[60vh] rounded-lg shadow-lg" /><p className="text-white font-semibold mt-4 text-lg">Klik di mana saja untuk melanjutkan</p></motion.div>);};

const QuizLeaderboard = ({ finalPointsEarned, scorePercentage, results, onCompleteQuiz, showLeaderboard, onReview }) => {
    const correctAnswers = useMemo(() => results.filter(r => r.isCorrect).length, [results]);
    const incorrectAnswers = useMemo(() => results.length - correctAnswers, [results, correctAnswers]);

    useEffect(() => {
        if (!showLeaderboard) {
            const timer = setTimeout(onCompleteQuiz, 800);
            return () => clearTimeout(timer);
        }
    }, [showLeaderboard, onCompleteQuiz]);

    if (!showLeaderboard) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Kuis selesai, mengarahkan kembali...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
                <FiAward className="text-yellow-500 text-6xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-sesm-deep">Kuis Selesai!</h2>
                <p className="text-gray-600 mt-2">Total poin akhir yang kamu dapat:</p>
                <p className="text-5xl font-bold text-sesm-teal my-3">{finalPointsEarned}</p>
                <p className="text-gray-500 text-sm mb-4">(Skor Akurasi: {scorePercentage}%)</p>
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
                    <h3 className="font-bold text-lg text-gray-700 mb-3">Ringkasan Jawaban ({results.length} Soal)</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-t pt-2">
                        {results.map((result, index) => (
                            <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${result.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                <p className="text-sm text-gray-800 truncate flex-1 mr-2">{index + 1}. {result.question}</p>
                                {result.isCorrect ? <FiCheck className="text-green-600"/> : <FiX className="text-red-600"/>}
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="mt-6 space-y-3">
                     <motion.button onClick={onReview} className="w-full py-3 bg-sesm-teal text-white font-bold rounded-lg flex items-center justify-center gap-2" whileTap={{ scale: 0.95 }}>
                        <FiEye/> Tinjau Jawaban
                    </motion.button>
                    <motion.button onClick={onCompleteQuiz} className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg" whileTap={{ scale: 0.95 }}>
                        Kembali ke Daftar Kuis
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

const MediaViewer = ({ attachments, onImageClick }) => {
    const API_URL = 'http://localhost:8080';
    const getYouTubeEmbedUrl = (url) => { if (!url) return null; const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; const match = url.match(regExp); return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null; };
    if (!attachments || attachments.length === 0) return null;
    return (
        <div className="mb-6 space-y-4 max-w-lg mx-auto">
            {attachments.map((item, index) => {
                const key = `media-${index}-${item.url || item.content}`;
                if (item.type === 'file') {
                    const fullFileUrl = item.url ? `${API_URL}/${item.url}` : null;
                    if (!fullFileUrl) return <p key={key} className='text-red-500 text-xs'>Error: File URL missing.</p>;
                    const fileExtension = item.url.split('.').pop().toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) return <img key={key} src={fullFileUrl} alt={`Lampiran ${index+1}`} className="max-w-full mx-auto rounded-lg shadow-md cursor-pointer" onClick={() => onImageClick && onImageClick(fullFileUrl)}/>;
                    if (['mp4', 'webm'].includes(fileExtension)) return <video key={key} src={fullFileUrl} controls className="w-full rounded-lg shadow-md" />;
                    if (['mp3', 'wav', 'ogg'].includes(fileExtension)) return <audio key={key} src={fullFileUrl} controls className="w-full" />;
                    return <a key={key} href={fullFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-sesm-deep font-semibold hover:bg-gray-200"><FiDownload /><span>Lihat/Unduh Lampiran ({fileExtension.toUpperCase()})</span></a>;
                }
                if (item.type === 'link') {
                    const embedUrl = getYouTubeEmbedUrl(item.url);
                    if (embedUrl) return (<div key={key} className="aspect-video bg-black rounded-lg overflow-hidden shadow-md"><iframe src={embedUrl} title={`YouTube video ${index}`} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>);
                    return <a key={key} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-blue-600 font-semibold hover:bg-gray-200"><FiLink /><span>Buka Tautan: {item.url}</span></a>;
                }
                 if (item.type === 'text') {
                    return <div key={key} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-gray-700 text-sm rounded-r-md whitespace-pre-wrap">{item.content}</div>;
                 }
                return null;
            })}
        </div>
    );
};

const EssayInput = ({ answer, onChange, disabled }) => (<textarea value={answer} onChange={onChange} disabled={disabled} placeholder="Tulis jawaban esaimu di sini..." className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal transition"/>);

// --- KOMPONEN UTAMA ---
const QuizForm = ({ quizData: initialQuizData, onCompleteQuiz }) => {
    const [fullQuizData, setFullQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameState, setGameState] = useState('loading');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState({ mc: null, essay: '' });
    const [results, setResults] = useState([]);
    const [finalScorePercentage, setFinalScorePercentage] = useState(0);
    const [finalPointsEarned, setFinalPointsEarned] = useState(0);
    const [isRedemptionRound, setIsRedemptionRound] = useState(false);
    const [redemptionAttempts, setRedemptionAttempts] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [activeMeme, setActiveMeme] = useState({ src: null, title: '' });
    const [feedback, setFeedback] = useState({ show: false, isCorrect: false });
    const [currentPoints, setCurrentPoints] = useState(0);
    const [pointsFloater, setPointsFloater] = useState({ key: 0, points: 0 });
    const [isPaused, setIsPaused] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [usedHint, setUsedHint] = useState(false);
    const [hintOptions, setHintOptions] = useState([]);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
    
    const REDEMPTION_DURATION = 10;
    
    const correctSound = useRef(new Audio('https://www.myinstants.com/media/sounds/correct.mp3'));
    const incorrectSound = useRef(new Audio('https://www.myinstants.com/media/sounds/wrong-answer-sound-effect.mp3'));

    useEffect(() => {
        if (!initialQuizData?.id) {
            setError("Data kuis tidak ditemukan atau tidak valid.");
            setLoading(false);
            setGameState('error');
            return;
        }
        setLoading(true);
        setError(null);
        setGameState('loading');
        DataService.getQuizForStudent(initialQuizData.id)
            .then(response => {
                if (!response.data || !response.data.questions || !response.data.settings) {
                    throw new Error("Format data kuis dari server tidak lengkap.");
                }
                setFullQuizData(response.data);
                if (response.data.settings?.setting_is_timer_enabled) {
                    setTimeLeft(response.data.settings?.setting_time_per_question ?? 20);
                } else {
                    setTimeLeft(null);
                }
                setCurrentQuestionIndex(0);
                setAnswer({ mc: null, essay: '' });
                setResults([]);
                setRedemptionAttempts({});
                setIsRedemptionRound(false);
                setGameState('playing');
                setCurrentPoints(0);
                setUsedHint(false);
                setHintOptions([]);
            })
            .catch(err => {
                console.error("Fetch Quiz Error:", err);
                setError(err.message || "Tidak dapat memuat soal kuis. Coba lagi nanti.");
                setGameState('error');
            })
            .finally(() => setLoading(false));
    }, [initialQuizData]);

    const quizSettings = useMemo(() => fullQuizData?.settings || {}, [fullQuizData]);
    const QUIZ_DURATION = useMemo(() => quizSettings.setting_time_per_question || 20, [quizSettings]);
    const currentQuestion = useMemo(() => fullQuizData?.questions?.[currentQuestionIndex], [currentQuestionIndex, fullQuizData]);
    
    const submitAndFinishQuiz = useCallback(async (finalResultsArray) => {
        if (!initialQuizData?.id) {
            setError("ID Kuis tidak valid saat mengirim jawaban.");
            setGameState('error');
            return;
        }
        setGameState('submitting');
        try {
            const answersPayload = finalResultsArray.map(r => ({ questionId: r.questionId, answer: r.answer }));
            const response = await DataService.submitQuizAnswers(initialQuizData.id, answersPayload);

            setFinalPointsEarned(response.data.pointsEarned ?? 0);
            setFinalScorePercentage(response.data.score ?? 0);
            setResults(finalResultsArray);

            if (quizSettings.setting_show_memes) {
                setActiveMeme({ src: thankYouMeme, title: "Terima Kasih Telah Bermain!" });
                setGameState('meme');
            } else {
                setGameState('finished');
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || "Gagal mengirim jawaban. Coba lagi.";
            setError(errMsg);
            setGameState('error');
        }
    }, [initialQuizData, quizSettings.setting_show_memes]);

    const goToNextStep = useCallback((currentResultsArray) => {
        setIsRedemptionRound(false);
        setFeedback({ show: false, isCorrect: false });
        setActiveMeme({ src: null, title: '' });

        const nextIndex = currentQuestionIndex + 1;
        if (!fullQuizData || !fullQuizData.questions || nextIndex >= fullQuizData.questions.length) {
            submitAndFinishQuiz(currentResultsArray);
        } else {
            setCurrentQuestionIndex(nextIndex);
            setAnswer({ mc: null, essay: '' });
            if (quizSettings.setting_is_timer_enabled) {
                 setTimeLeft(quizSettings.setting_time_per_question || 20);
            } else {
                 setTimeLeft(null);
            }
            setGameState('playing');
        }
    }, [currentQuestionIndex, fullQuizData, submitAndFinishQuiz, quizSettings]);

    const handleAnswerSubmit = useCallback(() => {
        if (gameState !== 'playing' || !currentQuestion || !fullQuizData || isSubmittingAnswer) return;
        setIsSubmittingAnswer(true);

        const correctAnswerMC = currentQuestion.options?.find(opt => opt.is_correct)?.option_text;
        let isCorrectMC = false;
        let submittedAnswerString = '';

        if (currentQuestion.question_type.includes('pilihan-ganda')) {
            const userAnswerMC = answer.mc || "";
            isCorrectMC = correctAnswerMC && userAnswerMC.trim().toLowerCase() === correctAnswerMC.trim().toLowerCase();
            submittedAnswerString = answer.mc || '';
        }
        if (currentQuestion.question_type.includes('esai')) {
            submittedAnswerString = `${submittedAnswerString}${submittedAnswerString && answer.essay ? ' | ' : ''}${answer.essay}`;
        }

        if (currentQuestion.question_type.includes('pilihan-ganda') && !isCorrectMC && !isRedemptionRound && quizSettings.setting_allow_redemption && !redemptionAttempts[currentQuestion.id]) {
            setRedemptionAttempts(prev => ({...prev, [currentQuestion.id]: true}));
            setIsRedemptionRound(true);
            setGameState('playing');
            setAnswer({ mc: null, essay: answer.essay });
            setTimeLeft(REDEMPTION_DURATION);
            if (quizSettings.setting_show_memes) {
                setActiveMeme({ src: salahMeme, title: "Waduh, coba lagi!" });
            }
            setIsSubmittingAnswer(false);
            return;
        }

        let pointsForThisQuestion = 0;
        if (isCorrectMC) {
            if (soundEnabled) correctSound.current.play();
            pointsForThisQuestion = quizSettings.setting_strict_scoring ? (quizSettings.setting_points_per_correct || 100) : 50;
        } else {
            if (soundEnabled) incorrectSound.current.play();
            pointsForThisQuestion = quizSettings.setting_strict_scoring ? 0 : 25;
        }

        setCurrentPoints(prev => prev + pointsForThisQuestion);
        setPointsFloater({ key: Date.now(), points: pointsForThisQuestion });

        const newResult = {
            index: currentQuestionIndex,
            questionId: currentQuestion.id,
            answer: submittedAnswerString,
            isCorrect: isCorrectMC,
            question: currentQuestion.question_text
        };
        const updatedResultsArray = [...results, newResult];
        setResults(updatedResultsArray);

        setGameState('feedback');
        if (quizSettings.setting_show_memes) {
            setFeedback({ show: true, isCorrect: isCorrectMC });
        }

        const delay = quizSettings.setting_show_memes ? 1200 : 500;
        setTimeout(() => {
            setIsSubmittingAnswer(false);
            goToNextStep(updatedResultsArray);
        }, delay);
    }, [gameState, currentQuestion, answer, isRedemptionRound, redemptionAttempts, fullQuizData, goToNextStep, quizSettings, results, soundEnabled, isSubmittingAnswer]);

    useEffect(() => {
        if (gameState !== 'playing' || !quizSettings.setting_is_timer_enabled || timeLeft === null || isPaused) return;
        if (timeLeft <= 0) { handleAnswerSubmit(); return; }
        const intervalId = setInterval(() => { setTimeLeft(prev => (prev !== null ? prev - 1 : null)); }, 1000);
        return () => clearInterval(intervalId);
    }, [gameState, timeLeft, isRedemptionRound, quizSettings.setting_is_timer_enabled, handleAnswerSubmit, isPaused]);
    
    const handleUseHint = () => {
        if(usedHint) return;
        const currentQuestion = fullQuizData?.questions?.[currentQuestionIndex];
        const correctAnswer = currentQuestion.options.find(opt => opt.is_correct).option_text;
        const wrongOptions = currentQuestion.options.filter(opt => !opt.is_correct);
        const optionToKeep = wrongOptions[Math.floor(Math.random() * wrongOptions.length)].option_text;
        setHintOptions([correctAnswer, optionToKeep]);
        setUsedHint(true);
    };

    const formatTime = (seconds) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };
    
    const isAnswerSelected = useMemo(() => {
         if (!currentQuestion) return false;
         const mcSelected = !!answer.mc;
         const essayFilled = currentQuestion.question_type.includes('esai') ? (!!answer.essay && answer.essay.trim() !== '') : true;
         if (currentQuestion.question_type === 'pilihan-ganda') return mcSelected;
         if (currentQuestion.question_type === 'esai') return essayFilled;
         if (currentQuestion.question_type === 'pilihan-ganda-esai') return mcSelected && essayFilled;
         return false;
    }, [answer.mc, answer.essay, currentQuestion]);

    if (gameState === 'loading' || loading) return <div className="min-h-screen bg-gray-100 flex justify-center items-center flex-col"><FiLoader className="animate-spin text-3xl text-sesm-teal mb-4"/><p>Memuat soal...</p></div>;
    if (error || gameState === 'error') return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center"><FiAlertCircle className="text-5xl text-red-500 mb-4" /><h2 className="text-2xl font-bold">Terjadi Kesalahan</h2><p>{error || "Gagal memproses kuis."}</p><button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white rounded-lg">Kembali</button></div>;
    if (!fullQuizData?.questions || fullQuizData.questions.length === 0) return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center"><FiAlertCircle className="text-5xl text-yellow-500 mb-4" /><h2 className="text-2xl font-bold">Kuis Belum Siap</h2><p>Kuis ini belum memiliki soal.</p><button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white rounded-lg">Kembali</button></div>;
    if (gameState === 'submitting') return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center"><FiLoader className="animate-spin text-4xl text-sesm-teal mb-4" /><p>Mengirim jawaban...</p></div>;

    if (gameState === 'finished' && !activeMeme.src) {
        return <QuizLeaderboard finalPointsEarned={finalPointsEarned} scorePercentage={finalScorePercentage} results={results} onCompleteQuiz={onCompleteQuiz} showLeaderboard={quizSettings.setting_show_leaderboard} onReview={() => setGameState('reviewing')} />;
    }
    
    if (gameState === 'reviewing') {
        return <QuizReview results={results} questions={fullQuizData.questions} onCompleteQuiz={onCompleteQuiz} />
    }

    const handleMemeClose = () => {
        setActiveMeme({ src: null, title: '' });
        if (gameState === 'meme') {
             setGameState('finished');
        }
    };
    
    return (
        <>
            <QuitConfirmationModal isOpen={showQuitConfirm} onCancel={() => setShowQuitConfirm(false)} onConfirm={onCompleteQuiz} />
            <AnimatePresence>{activeMeme.src && <MemeOverlay meme={activeMeme.src} title={activeMeme.title} onClose={handleMemeClose} />}</AnimatePresence>
            <AnimatePresence>{feedback.show && <AnswerFeedback isCorrect={feedback.isCorrect} />}</AnimatePresence>

            <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isPaused ? 'bg-gray-200' : 'bg-gray-50'}`}>
                
                <AnimatePresence>
                    {isPaused && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 z-20 flex flex-col items-center justify-center gap-6">
                            <h2 className="text-4xl font-bold text-white">Jeda</h2>
                             <button onClick={() => setIsPaused(false)} className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 font-bold rounded-full text-lg"><FiPlay/> Lanjutkan</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="p-4 flex items-center justify-between text-gray-800 flex-shrink-0 border-b bg-white">
                    <button onClick={() => setShowQuitConfirm(true)} className="p-2 rounded-full hover:bg-gray-100"><FiArrowLeft size={24}/></button>
                    <div className="flex-grow mx-4">
                        <ProgressDots count={fullQuizData?.questions?.length || 0} currentIndex={currentQuestionIndex} results={results} onDotClick={setCurrentQuestionIndex} />
                    </div>
                    {timeLeft !== null ? (
                        <div className="flex items-center gap-3">
                             <div className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-sesm-deep'}`}>{formatTime(timeLeft)}</div>
                             <button onClick={() => setIsPaused(p => !p)} className="p-2 rounded-full hover:bg-gray-100">{isPaused ? <FiPlay/> : <FiPause/>}</button>
                        </div>
                    ) : ( <div className="w-16"></div> )}
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-4 text-center text-gray-800 relative">
                     {loading ? <FiLoader className="animate-spin text-4xl"/> : currentQuestion ? (
                        <div className="w-full max-w-2xl">
                             <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestionIndex}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{type: 'spring', stiffness: 100, damping: 20}}
                                >
                                    {isRedemptionRound && <p className="font-bold text-red-500 mb-2 animate-pulse">Kesempatan Kedua!</p>}
                                    <p className="text-sm font-semibold text-gray-500">Pertanyaan {currentQuestionIndex + 1} dari {fullQuizData.questions.length}</p>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-8">{currentQuestion.question_text}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentQuestion.options.map((opt, index) => {
                                            const isHintedOut = hintOptions.length > 0 && !hintOptions.includes(opt.option_text);
                                            return (
                                                <motion.button
                                                    key={opt.id}
                                                    onClick={() => !isSubmittingAnswer && setAnswer(a => ({...a, mc: opt.option_text}))}
                                                    disabled={isSubmittingAnswer || isHintedOut}
                                                    className={`p-4 rounded-lg font-semibold text-lg transition-all border-2 text-left disabled:opacity-30 disabled:cursor-not-allowed ${answer.mc === opt.option_text ? 'bg-sesm-sky border-sesm-deep text-sesm-deep' : 'bg-white border-gray-300 hover:border-sesm-teal'}`}
                                                    whileHover={{scale: isSubmittingAnswer ? 1 : 1.03}}
                                                    whileTap={{scale: isSubmittingAnswer ? 1 : 0.98}}
                                                >
                                                    {opt.option_text}
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    ) : <FiAlertCircle className="text-4xl"/>}
                </main>
                
                <footer className="p-4 flex items-center justify-between text-gray-700 flex-shrink-0 bg-white border-t">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSoundEnabled(s => !s)} className="p-3 rounded-full hover:bg-gray-100">
                            {soundEnabled ? <FiVolume2/> : <FiVolumeX/>}
                        </button>
                         <button onClick={handleUseHint} disabled={usedHint || isSubmittingAnswer} className="p-3 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
                            <FiHelpCircle/>
                        </button>
                    </div>

                    <div className="flex-1 flex justify-center">
                        {!isSubmittingAnswer ? (
                            <button onClick={handleAnswerSubmit} disabled={!answer.mc} className="px-10 py-4 bg-sesm-deep text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                                Jawab
                            </button>
                        ): (
                            <FiLoader className="animate-spin text-3xl text-sesm-teal"/>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4 justify-end min-w-[150px]">
                        <div className="relative flex items-center gap-2 font-bold text-xl bg-gray-100 px-4 py-2 rounded-full">
                             <FiAward className="text-yellow-500"/>
                             <AnimatedNumber value={currentPoints} />
                             <AnimatePresence>
                                {pointsFloater.points > 0 && <PointFloater key={pointsFloater.key} points={pointsFloater.points}/>}
                            </AnimatePresence>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default QuizForm;