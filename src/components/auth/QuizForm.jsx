// contoh-sesm-web/components/auth/QuizForm.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiClock, FiAward, FiCheck, FiX, FiLoader, FiAlertCircle, FiDownload, FiLink, FiCheckCircle } from 'react-icons/fi';
import AnswerFeedback from '../ui/AnswerFeedback';
import thankYouMeme from '../../assets/meme/terima-kasih.jpeg'; // Pastikan path benar
import salahMeme from '../../assets/meme/meme-salah/9.jpeg'; // Pastikan path meme benar
import DataService from '../../services/dataService'; // Pastikan path benar

// Helper untuk mengubah indeks menjadi huruf
const toAlpha = (num) => String.fromCharCode(65 + num);

// Komponen MemeOverlay (Tidak berubah)
const MemeOverlay = ({ meme, title, onClose }) => { if (!meme) return null; return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center flex-col p-4" onClick={onClose}>{title && <h2 className="text-white text-3xl font-bold mb-4 text-center">{title}</h2>}<img src={meme} alt="Meme" className="max-w-sm max-h-[60vh] rounded-lg shadow-lg" /><p className="text-white font-semibold mt-4 text-lg">Klik di mana saja untuk melanjutkan</p></motion.div>);};

// Komponen QuizLeaderboard (Diperbarui untuk Menerima Hasil Lengkap)
const QuizLeaderboard = ({ finalPointsEarned, scorePercentage, results, onCompleteQuiz, showLeaderboard }) => {
    // Hitung ulang jumlah benar/salah dari prop 'results' yang diterima
    const correctAnswers = useMemo(() => results.filter(r => r.isCorrect).length, [results]);
    const incorrectAnswers = useMemo(() => results.length - correctAnswers, [results, correctAnswers]);

    // Jika leaderboard tidak ditampilkan, langsung kembali setelah delay singkat
    useEffect(() => {
        if (!showLeaderboard) {
            const timer = setTimeout(onCompleteQuiz, 800); // Beri waktu sedikit untuk transisi
            return () => clearTimeout(timer);
        }
    }, [showLeaderboard, onCompleteQuiz]);

    if (!showLeaderboard) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Kuis selesai, mengarahkan kembali...</p></div>; // Tampilkan pesan loading singkat
    }

    // Tampilkan Leaderboard jika showLeaderboard true
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
                        {/* Tampilkan jumlah benar/salah dari hasil kalkulasi */}
                        <p className="text-3xl font-bold text-green-500">{correctAnswers}</p>
                        <p className="text-sm text-gray-600">Benar</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-red-500">{incorrectAnswers}</p>
                        <p className="text-sm text-gray-600">Salah</p>
                    </div>
                </div>
                <div className="text-left">
                    <h3 className="font-bold text-lg text-gray-700 mb-3">Ringkasan Jawaban ({results.length} Soal)</h3> {/* Tampilkan total soal */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-t pt-2">
                        {/* Pastikan loop menggunakan 'results' dari props */}
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


// Komponen MediaViewer (Tidak berubah)
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

// Komponen EssayInput (Tidak berubah)
const EssayInput = ({ answer, onChange, disabled }) => (<textarea value={answer} onChange={onChange} disabled={disabled} placeholder="Tulis jawaban esaimu di sini..." className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal transition"/>);

// Komponen Utama QuizForm
const QuizForm = ({ quizData: initialQuizData, onCompleteQuiz }) => {
    const [fullQuizData, setFullQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameState, setGameState] = useState('loading');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState({ mc: null, essay: '' });
    const [finalScorePercentage, setFinalScorePercentage] = useState(0);
    const [finalPointsEarned, setFinalPointsEarned] = useState(0);
    const [isRedemptionRound, setIsRedemptionRound] = useState(false);
    const [redemptionAttempts, setRedemptionAttempts] = useState({});
    const REDEMPTION_DURATION = 10;
    const [timeLeft, setTimeLeft] = useState(null);
    const [activeMeme, setActiveMeme] = useState({ src: null, title: '' });
    const [results, setResults] = useState([]); // Tetap ada untuk menyimpan hasil per soal { questionId, answer, isCorrect, question }
    const [feedback, setFeedback] = useState({ show: false, isCorrect: false });

    // Fetch quiz data effect (Tidak berubah)
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
                setFinalScorePercentage(0);
                setFinalPointsEarned(0);
                setResults([]); // Reset results saat kuis baru dimuat
                setRedemptionAttempts({});
                setIsRedemptionRound(false);
                setGameState('playing');
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

    // submitAndFinishQuiz (Diperbarui untuk menyimpan hasil final ke state)
    const submitAndFinishQuiz = useCallback(async (finalResultsArray) => { // Terima array hasil final
        if (!initialQuizData?.id) {
            console.error("Cannot submit quiz: initialQuizData.id is missing.");
            setError("ID Kuis tidak valid saat mengirim jawaban.");
            setGameState('error');
            return;
        }
        console.log(`[submitAndFinishQuiz] Submitting ${finalResultsArray.length} answers...`); // Log jumlah jawaban
        setGameState('submitting');
        try {
            // Payload adalah array of { questionId, answer }
            const answersPayload = finalResultsArray.map(r => ({ questionId: r.questionId, answer: r.answer }));
            const response = await DataService.submitQuizAnswers(initialQuizData.id, answersPayload);

            // Simpan skor akhir (%) dan poin akhir dari response backend
            setFinalPointsEarned(response.data.pointsEarned ?? 0);
            setFinalScorePercentage(response.data.score ?? 0);
            // --- PENTING: Update state 'results' dengan data LENGKAP sebelum pindah state ---
            setResults(finalResultsArray);

            console.log(`[submitAndFinishQuiz] Backend response: Score=${response.data.score}, Points=${response.data.pointsEarned}`);

            // Tampilkan meme jika aktif
            if (quizSettings.setting_show_memes) {
                setActiveMeme({ src: thankYouMeme, title: "Terima Kasih Telah Bermain!" });
                setGameState('meme'); // Pindah ke state meme dulu
            } else {
                setGameState('finished'); // Langsung ke state finished
            }
        } catch (error) {
            console.error("Submit Quiz Error:", error);
            const errMsg = error.response?.data?.message || "Gagal mengirim jawaban. Coba lagi.";
            setError(errMsg);
            setGameState('error');
        }
    }, [initialQuizData, quizSettings.setting_show_memes]);

    // goToNextStep (Diperbarui untuk menerima array hasil)
    const goToNextStep = useCallback((currentResultsArray) => { // Terima array hasil
        setIsRedemptionRound(false);
        setFeedback({ show: false, isCorrect: false });
        setActiveMeme({ src: null, title: '' });

        const nextIndex = currentQuestionIndex + 1;
        // Cek apakah ini soal terakhir
        if (!fullQuizData || !fullQuizData.questions || nextIndex >= fullQuizData.questions.length) {
            // Jika ya, panggil submitAndFinishQuiz dengan array hasil LENGKAP
            console.log(`[goToNextStep] End of quiz detected. Submitting results.`);
            submitAndFinishQuiz(currentResultsArray); // Kirim array hasil terbaru
        } else {
            // Jika belum selesai, lanjut ke soal berikutnya
            console.log(`[goToNextStep] Moving to question ${nextIndex + 1}`);
            setCurrentQuestionIndex(nextIndex);
            setAnswer({ mc: null, essay: '' });
            if (quizSettings.setting_is_timer_enabled) {
                 setTimeLeft(quizSettings.setting_time_per_question || 20);
            } else {
                 setTimeLeft(null);
            }
            setGameState('playing');
        }
    }, [currentQuestionIndex, fullQuizData, submitAndFinishQuiz, quizSettings]); // Hapus 'results' dari dependency

    // handleAnswerSubmit (Diperbarui untuk meneruskan hasil terbaru ke goToNextStep)
    const handleAnswerSubmit = useCallback(() => {
        if (gameState !== 'playing' || !currentQuestion || !fullQuizData) return;
        console.log(`[handleAnswerSubmit] Processing answer for question ${currentQuestionIndex + 1}`);

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

        // Logika Redemption
        if (currentQuestion.question_type.includes('pilihan-ganda') && !isCorrectMC && !isRedemptionRound && quizSettings.setting_allow_redemption && !redemptionAttempts[currentQuestion.id]) {
            console.log(`[handleAnswerSubmit] Redemption triggered for question ${currentQuestionIndex + 1}`);
            setRedemptionAttempts(prev => ({...prev, [currentQuestion.id]: true}));
            setIsRedemptionRound(true);
            setGameState('playing');
            setAnswer({ mc: null, essay: answer.essay });
            setTimeLeft(REDEMPTION_DURATION);
            if (quizSettings.setting_show_memes) {
                setActiveMeme({ src: salahMeme, title: "Waduh, coba lagi!" });
            }
            return;
        }

        // --- BUAT HASIL BARU UNTUK SOAL INI ---
        const newResult = {
            questionId: currentQuestion.id,
            answer: submittedAnswerString,
            isCorrect: isCorrectMC, // Hanya status MC untuk leaderboard
            question: currentQuestion.question_text
        };

        // --- BUAT ARRAY HASIL TERBARU SECARA MANUAL ---
        const updatedResultsArray = [...results, newResult];
        console.log(`[handleAnswerSubmit] Current results array length: ${results.length}, Updated length: ${updatedResultsArray.length}`);

        // --- UPDATE STATE results (opsional, tapi bagus untuk konsistensi) ---
        setResults(updatedResultsArray); // Update state results juga

        // Tampilkan feedback
        setGameState('feedback');
        if (quizSettings.setting_show_memes) {
            setFeedback({ show: true, isCorrect: isCorrectMC });
        }

        // Jeda sebelum lanjut
        const delay = quizSettings.setting_show_memes ? 1200 : 500;
        console.log(`[handleAnswerSubmit] Setting timeout for ${delay}ms before moving to next step.`);
        setTimeout(() => {
            // --- PANGGIL goToNextStep DENGAN ARRAY HASIL TERBARU ---
            goToNextStep(updatedResultsArray);
        }, delay);

    }, [gameState, currentQuestion, answer, isRedemptionRound, redemptionAttempts, fullQuizData, goToNextStep, quizSettings, results]); // Tambahkan `results` kembali

    // Timer effect (Tidak berubah)
    useEffect(() => {
        if (gameState !== 'playing' || !quizSettings.setting_is_timer_enabled || timeLeft === null) return;
        if (timeLeft <= 0) { handleAnswerSubmit(); return; }
        const intervalId = setInterval(() => { setTimeLeft(prev => (prev !== null ? prev - 1 : null)); }, 1000);
        return () => clearInterval(intervalId);
    }, [gameState, timeLeft, isRedemptionRound, quizSettings.setting_is_timer_enabled, handleAnswerSubmit]);

    // getButtonClass (Tidak berubah)
    const getButtonClass = (optionText) => {
        if (!currentQuestion) return 'bg-white';
        const isSelected = answer.mc === optionText;
        if (gameState === 'playing') { return isSelected ? 'bg-sesm-teal text-white border-sesm-teal' : 'bg-white hover:bg-gray-100 border-gray-300'; }
        const correctAnswer = currentQuestion.options?.find(opt => opt.is_correct)?.option_text;
        const isOptionCorrect = correctAnswer && optionText.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        if (isOptionCorrect) { return 'bg-green-500 text-white border-green-500'; }
        else if (isSelected) { return 'bg-red-500 text-white border-red-500'; }
        else { return 'bg-white opacity-60 border-gray-300'; }
    };

    // isAnswerSelected (Tidak berubah)
    const isAnswerSelected = useMemo(() => {
         if (!currentQuestion) return false;
         const mcSelected = !!answer.mc;
         const essayFilled = currentQuestion.question_type.includes('esai') ? (!!answer.essay && answer.essay.trim() !== '') : true;
         if (currentQuestion.question_type === 'pilihan-ganda') return mcSelected;
         if (currentQuestion.question_type === 'esai') return essayFilled;
         if (currentQuestion.question_type === 'pilihan-ganda-esai') return mcSelected && essayFilled;
         return false;
    }, [answer.mc, answer.essay, currentQuestion]);

    // === Render Logic ===
    if (gameState === 'loading' || loading) return <div className="min-h-screen bg-gray-100 flex justify-center items-center flex-col"><FiLoader className="animate-spin text-3xl text-sesm-teal mb-4"/><p>Memuat soal...</p></div>;
    if (error || gameState === 'error') return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center"><FiAlertCircle className="text-5xl text-red-500 mb-4" /><h2 className="text-2xl font-bold">Terjadi Kesalahan</h2><p>{error || "Gagal memproses kuis."}</p><button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white rounded-lg">Kembali</button></div>;
    if (!fullQuizData?.questions || fullQuizData.questions.length === 0) return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center"><FiAlertCircle className="text-5xl text-yellow-500 mb-4" /><h2 className="text-2xl font-bold">Kuis Belum Siap</h2><p>Kuis ini belum memiliki soal.</p><button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white rounded-lg">Kembali</button></div>;
    if (gameState === 'submitting') return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center"><FiLoader className="animate-spin text-4xl text-sesm-teal mb-4" /><p>Mengirim jawaban...</p></div>;

    // Tampilkan Leaderboard setelah state 'finished' tercapai
    if (gameState === 'finished' && !activeMeme.src) {
        // --- PENTING: Kirim 'results' DARI STATE ke QuizLeaderboard ---
        return <QuizLeaderboard finalPointsEarned={finalPointsEarned} scorePercentage={finalScorePercentage} results={results} onCompleteQuiz={onCompleteQuiz} showLeaderboard={quizSettings.setting_show_leaderboard} />;
    }

    const handleMemeClose = () => {
        setActiveMeme({ src: null, title: '' });
        if (gameState === 'meme') {
             setGameState('finished'); // Pindah ke state finished setelah meme ditutup
        }
    };

    const handleOptionClick = (optionText) => {
        if (gameState === 'playing') {
            setAnswer(prev => ({ ...prev, mc: optionText }));
        }
    };

    return (
        <>
            <AnimatePresence>{activeMeme.src && <MemeOverlay meme={activeMeme.src} title={activeMeme.title} onClose={handleMemeClose} />}</AnimatePresence>
            <AnimatePresence>{feedback.show && <AnswerFeedback isCorrect={feedback.isCorrect} />}</AnimatePresence>

            <div className="min-h-screen bg-gray-100 flex flex-col">
                {/* Header (Tidak berubah) */}
                <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
                    <button onClick={onCompleteQuiz} className="p-2 rounded-full hover:bg-gray-100"><FiArrowLeft size={24} /></button>
                    {quizSettings.setting_is_timer_enabled && timeLeft !== null ? (
                        <>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mx-4 overflow-hidden">
                                <motion.div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(timeLeft / (isRedemptionRound ? REDEMPTION_DURATION : QUIZ_DURATION)) * 100}%`}} />
                            </div>
                            <div className={`flex items-center space-x-2 font-bold text-lg w-16 justify-end ${timeLeft <= 5 && !isRedemptionRound ? 'text-red-500 animate-pulse' : 'text-sesm-deep'}`}>
                                <FiClock /><span>{String(timeLeft).padStart(2, '0')}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow mx-4"></div>
                    )}
                    {!quizSettings.setting_is_timer_enabled && <div className="w-16"></div>}
                </header>

                <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    {currentQuestion ? (
                        <div className="w-full max-w-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQuestionIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                                    {isRedemptionRound && <p className="font-bold text-red-500 mb-2 animate-pulse">Kesempatan Kedua!</p>}
                                    <p className="text-sm font-semibold text-gray-500">Pertanyaan {currentQuestionIndex + 1} dari {fullQuizData.questions.length}</p>
                                    <MediaViewer attachments={currentQuestion.media_attachments} onImageClick={null}/>
                                    <h2 className="text-xl md:text-2xl font-bold text-sesm-deep mt-2 mb-8">{currentQuestion.question_text}</h2>
                                    <div className="space-y-4">
                                        {currentQuestion.question_type.includes('pilihan-ganda') && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(currentQuestion.options || []).map((option, index) => (
                                                    <motion.button
                                                        key={option.id || option.option_text}
                                                        onClick={() => handleOptionClick(option.option_text)}
                                                        className={`p-4 rounded-lg font-semibold text-lg shadow-md transition-all border-2 flex items-start text-left gap-3 ${getButtonClass(option.option_text)}`}
                                                        whileHover={{ scale: gameState === 'playing' ? 1.03 : 1 }}
                                                        whileTap={{ scale: gameState === 'playing' ? 0.98 : 1 }}
                                                        disabled={gameState !== 'playing'}
                                                    >
                                                        <span className="font-bold">{toAlpha(index)}.</span>
                                                        <span>{option.option_text}</span>
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
                            <motion.button
                                onClick={handleAnswerSubmit}
                                disabled={!isAnswerSelected || gameState !== 'playing'}
                                className={`mt-8 w-full max-w-sm py-3 bg-sesm-deep text-white font-bold rounded-lg shadow-lg hover:bg-opacity-90 active:scale-95 disabled:bg-gray-400 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity duration-200`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: (gameState === 'playing') ? 1 : 0.5, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                Jawab
                            </motion.button>
                        </div>
                    ) : ( <p className="text-gray-500">Memuat pertanyaan...</p> )}
                </main>
                <footer className="p-4 bg-white flex justify-center items-center border-t">
                    <p className="text-sm text-gray-400 font-medium">SESM - Smart Education Smart Morality</p>
                </footer>
            </div>
        </>
    );
};

export default QuizForm;