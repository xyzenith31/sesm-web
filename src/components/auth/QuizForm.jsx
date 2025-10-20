// contoh-sesm-web/components/auth/QuizForm.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiClock, FiAward, FiCheck, FiX, FiLoader, FiAlertCircle, FiDownload, FiLink, FiCheckCircle } from 'react-icons/fi';
import AnswerFeedback from '../ui/AnswerFeedback';
import thankYouMeme from '../../assets/meme/terima-kasih.jpeg'; //
import salahMeme from '../../assets/meme/meme-salah/9.jpeg'; // Pastikan path meme benar
import DataService from '../../services/dataService'; //

// Komponen MemeOverlay (Tidak berubah)
const MemeOverlay = ({ meme, title, onClose }) => { if (!meme) return null; return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center flex-col p-4" onClick={onClose}>{title && <h2 className="text-white text-3xl font-bold mb-4 text-center">{title}</h2>}<img src={meme} alt="Meme" className="max-w-sm max-h-[60vh] rounded-lg shadow-lg" /><p className="text-white font-semibold mt-4 text-lg">Klik di mana saja untuk melanjutkan</p></motion.div>);}; //

// Komponen QuizLeaderboard (Tidak berubah)
const QuizLeaderboard = ({ totalPointsEarned, scorePercentage, results, onCompleteQuiz, showLeaderboard }) => {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const incorrectAnswers = results.length - correctAnswers;
    if (!showLeaderboard) { setTimeout(onCompleteQuiz, 500); return null; }
    return ( <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4"><motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center"><FiAward className="text-yellow-500 text-6xl mx-auto mb-4" /><h2 className="text-2xl font-bold text-sesm-deep">Kuis Selesai!</h2><p className="text-gray-600 mt-2">Total poin yang kamu dapat:</p><p className="text-5xl font-bold text-sesm-teal my-3">{totalPointsEarned}</p><p className="text-gray-500 text-sm mb-4">(Skor Akurasi: {scorePercentage}%)</p><div className="flex justify-around my-6"><div className="text-center"><p className="text-3xl font-bold text-green-500">{correctAnswers}</p><p className="text-sm text-gray-600">Benar</p></div><div className="text-center"><p className="text-3xl font-bold text-red-500">{incorrectAnswers}</p><p className="text-sm text-gray-600">Salah</p></div></div><div className="text-left"><h3 className="font-bold text-lg text-gray-700 mb-3">Ringkasan Jawaban</h3><div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-t pt-2">{results.map((result, index) => (<div key={index} className={`flex items-center justify-between p-2 rounded-lg ${result.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}><p className="text-sm text-gray-800 truncate flex-1 mr-2">{index + 1}. {result.question}</p>{result.isCorrect ? <FiCheck className="text-green-600"/> : <FiX className="text-red-600"/>}</div>))}</div></div><motion.button onClick={onCompleteQuiz} className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg mt-6" whileTap={{ scale: 0.95 }}>Kembali ke Daftar Kuis</motion.button></motion.div></div> ); //
}; //

// Komponen MediaViewer (Tidak berubah)
const MediaViewer = ({ attachments, onImageClick }) => { // Ditambahkan onImageClick
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
                    // Klik pada gambar akan memanggil onImageClick
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
                 // Tambahkan untuk tipe teks
                 if (item.type === 'text') {
                    return <div key={key} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-gray-700 text-sm rounded-r-md whitespace-pre-wrap">{item.content}</div>;
                 }
                return null;
            })}
        </div>
    );
}; //

// Komponen EssayInput (Tidak berubah)
const EssayInput = ({ answer, onChange, disabled }) => (<textarea value={answer} onChange={onChange} disabled={disabled} placeholder="Tulis jawaban esaimu di sini..." className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal transition"/>); //

// Komponen Utama QuizForm
const QuizForm = ({ quizData: initialQuizData, onCompleteQuiz }) => { //
    const [fullQuizData, setFullQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameState, setGameState] = useState('loading');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState({ mc: null, essay: '' });
    const [totalPointsEarned, setTotalPointsEarned] = useState(0); // State poin sementara
    const [finalScorePercentage, setFinalScorePercentage] = useState(0); // Skor akhir dari backend
    const [isRedemptionRound, setIsRedemptionRound] = useState(false);
    const [redemptionAttempts, setRedemptionAttempts] = useState({});
    const REDEMPTION_DURATION = 10;
    const [timeLeft, setTimeLeft] = useState(null);
    const [activeMeme, setActiveMeme] = useState({ src: null, title: '' });
    const [results, setResults] = useState([]);
    const [feedback, setFeedback] = useState({ show: false, isCorrect: false }); //

    // Fetch quiz data effect (Tidak berubah)
     useEffect(() => {
        if (!initialQuizData?.id) {
            setError("Data kuis tidak ditemukan atau tidak valid.");
            setLoading(false);
            setGameState('error');
            console.error("Initial quizData is missing or invalid:", initialQuizData);
            return;
        }
        setLoading(true);
        setError(null);
        setGameState('loading');
        DataService.getQuizForStudent(initialQuizData.id) //
            .then(response => {
                if (!response.data || !response.data.questions || !response.data.settings) {
                    throw new Error("Format data kuis dari server tidak lengkap.");
                }
                if (response.data.questions.some(q => q.question_type.includes('pilihan-ganda') && (!Array.isArray(q.options) || q.options.length === 0))) {
                     console.error("Invalid options format received from server:", response.data.questions);
                     throw new Error("Format opsi jawaban dari server tidak valid.");
                }

                setFullQuizData(response.data);
                if (response.data.settings?.setting_is_timer_enabled) {
                    setTimeLeft(response.data.settings?.setting_time_per_question ?? 20);
                } else {
                    setTimeLeft(null);
                }
                setCurrentQuestionIndex(0);
                setAnswer({ mc: null, essay: '' });
                setTotalPointsEarned(0); // Reset poin sementara saat kuis baru dimuat
                setFinalScorePercentage(0);
                setResults([]);
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
    }, [initialQuizData]); //

    const quizSettings = useMemo(() => fullQuizData?.settings || {}, [fullQuizData]); //
    const QUIZ_DURATION = useMemo(() => quizSettings.setting_time_per_question || 20, [quizSettings]); //
    const currentQuestion = useMemo(() => fullQuizData?.questions?.[currentQuestionIndex], [currentQuestionIndex, fullQuizData]); //

    // submitAndFinishQuiz (Tidak berubah)
    const submitAndFinishQuiz = useCallback(async (finalResults) => {
        if (!initialQuizData?.id) {
            console.error("Cannot submit quiz: initialQuizData.id is missing.");
            setError("ID Kuis tidak valid saat mengirim jawaban.");
            setGameState('error');
            return;
        }
        setGameState('submitting');
        try {
            const answersPayload = finalResults.map(r => ({ questionId: r.questionId, answer: r.answer }));
            const response = await DataService.submitQuizAnswers(initialQuizData.id, answersPayload); //
            // Update skor akhir dan poin akhir dari response backend
            setTotalPointsEarned(response.data.pointsEarned ?? 0);
            setFinalScorePercentage(response.data.score ?? 0);
            if (quizSettings.setting_show_memes) {
                setActiveMeme({ src: thankYouMeme, title: "Terima Kasih Telah Bermain!" }); //
                setGameState('meme');
            } else {
                setGameState('finished');
            }
        } catch (error) {
            console.error("Submit Quiz Error:", error);
            const errMsg = error.response?.data?.message || "Gagal mengirim jawaban. Coba lagi.";
            setError(errMsg);
            setGameState('error');
        }
    }, [initialQuizData, quizSettings.setting_show_memes]); //

    // goToNextStep (Tidak berubah)
    const goToNextStep = useCallback(() => {
        setIsRedemptionRound(false);
        const nextIndex = currentQuestionIndex + 1;
        if (!fullQuizData || !fullQuizData.questions || nextIndex >= fullQuizData.questions.length) {
            submitAndFinishQuiz(results);
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
    }, [currentQuestionIndex, fullQuizData, results, submitAndFinishQuiz, quizSettings]); //

    // handleAnswerSubmit (✅ PERBAIKAN DI SINI: Tambah perhitungan poin sementara)
    const handleAnswerSubmit = useCallback(() => {
        if (gameState !== 'playing' || !currentQuestion || !fullQuizData) return;

        const correctAnswerMC = currentQuestion.options?.find(opt => opt.is_correct)?.option_text; //
        let isCorrect = false;
        let submittedAnswer = '';
        let pointsToAdd = 0; // Poin sementara untuk soal ini

        // Tentukan aturan poin berdasarkan setting
        const strictScoringEnabled = !!quizSettings.setting_strict_scoring; //
        const pointsPerCorrectStrict = quizSettings.setting_points_per_correct || 100; //
        const pointsCorrectDefault = 50;
        const pointsIncorrectDefault = 25;
        const pointsCorrect = strictScoringEnabled ? pointsPerCorrectStrict : pointsCorrectDefault; //
        const pointsIncorrect = strictScoringEnabled ? 0 : pointsIncorrectDefault; //

        if (currentQuestion.question_type.includes('pilihan-ganda')) {
            const userAnswerMC = answer.mc || "";
            if (correctAnswerMC && userAnswerMC.trim().toLowerCase() === correctAnswerMC.trim().toLowerCase()) { //
                isCorrect = true;
            }
            submittedAnswer = answer.mc || ''; //
        }

        if (currentQuestion.question_type.includes('esai')) {
            submittedAnswer = `${submittedAnswer}${submittedAnswer && answer.essay ? ' | ' : ''}${answer.essay}`; //
            // Untuk esai, poin sementara yang ditambahkan adalah poin 'salah' (atau 0 jika strict)
            // karena kita belum tahu benar/salahnya
            if (!currentQuestion.question_type.includes('pilihan-ganda')) { // Jika hanya esai
               pointsToAdd = pointsIncorrect; //
            }
        }

        // --- Logika Poin Sementara ---
        if (currentQuestion.question_type.includes('pilihan-ganda')) {
            // Kesempatan Kedua (Redemption)
            if (!isCorrect && !isRedemptionRound && quizSettings.setting_allow_redemption && !redemptionAttempts[currentQuestion.id]) { //
                setRedemptionAttempts(prev => ({...prev, [currentQuestion.id]: true})); //
                setIsRedemptionRound(true); //
                setGameState('playing'); //
                setAnswer({ mc: null, essay: answer.essay }); // Reset hanya MC //
                setTimeLeft(REDEMPTION_DURATION); //
                if (quizSettings.setting_show_memes) { //
                    setActiveMeme({ src: salahMeme, title: "Waduh, coba lagi!" }); //
                }
                return; // Hentikan proses submit, tunggu jawaban kedua
            }

            // Hitung poin untuk MC (setelah redemption atau jika tidak ada redemption)
            if (isCorrect) {
                pointsToAdd = pointsCorrect; // Tambah poin benar //
            } else {
                pointsToAdd = pointsIncorrect; // Tambah poin salah (atau 0 jika strict) //
            }
        }
        // Jika soalnya MC+Esai, poin esai (pointsIncorrect) sudah ditambahkan di awal
        if (currentQuestion.question_type === 'pilihan-ganda-esai' && pointsToAdd !== pointsCorrect){
            // Jika MC salah, pastikan poin essay (pointsIncorrect) tetap ditambahkan
            pointsToAdd = pointsIncorrect; //
        }


        // Update state poin sementara
        setTotalPointsEarned(prev => prev + pointsToAdd); //

        // --- Akhir Logika Poin Sementara ---

        setGameState('feedback'); //
        const resultToSave = { questionId: currentQuestion.id, answer: submittedAnswer, isCorrect, question: currentQuestion.question_text }; //
        setResults(prev => [...prev, resultToSave]); //

        if (quizSettings.setting_show_memes) { //
            setFeedback({ show: true, isCorrect }); //
        }

        setTimeout(() => { //
            setFeedback({ show: false, isCorrect: false }); //
            goToNextStep(); //
        }, 1200); //

    }, [gameState, currentQuestion, answer, isRedemptionRound, redemptionAttempts, fullQuizData, goToNextStep, quizSettings]); //

    // Timer effect (Tidak berubah)
    useEffect(() => {
        if (gameState !== 'playing' || !quizSettings.setting_is_timer_enabled || timeLeft === null) return;
        if (timeLeft <= 0) { handleAnswerSubmit(); return; }
        const intervalId = setInterval(() => { setTimeLeft(prev => (prev !== null ? prev - 1 : null)); }, 1000);
        return () => clearInterval(intervalId);
    }, [gameState, timeLeft, isRedemptionRound, quizSettings.setting_is_timer_enabled, handleAnswerSubmit]); //

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
    }; //

    // isAnswerSelected (Tidak berubah)
    const isAnswerSelected = useMemo(() => {
         if (!currentQuestion) return false;
         const mcSelected = !!answer.mc;
         const essayFilled = currentQuestion.question_type.includes('esai') ? (!!answer.essay && answer.essay.trim() !== '') : false;
         if (currentQuestion.question_type === 'pilihan-ganda') return mcSelected;
         if (currentQuestion.question_type === 'esai') return essayFilled;
         if (currentQuestion.question_type === 'pilihan-ganda-esai') return mcSelected || essayFilled;
         return mcSelected || essayFilled;
    }, [answer.mc, answer.essay, currentQuestion]); //

    // === Render Logic === (Tidak berubah)
    if (gameState === 'loading' || loading) return <div className="min-h-screen bg-gray-100 flex justify-center items-center flex-col"><FiLoader className="animate-spin text-3xl text-sesm-teal mb-4"/><p>Memuat soal...</p></div>; //
    if (error || gameState === 'error') return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center"><FiAlertCircle className="text-5xl text-red-500 mb-4" /><h2 className="text-2xl font-bold">Terjadi Kesalahan</h2><p>{error || "Gagal memproses kuis."}</p><button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white rounded-lg">Kembali</button></div>; //
    if (!fullQuizData?.questions || fullQuizData.questions.length === 0) return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center"><FiAlertCircle className="text-5xl text-yellow-500 mb-4" /><h2 className="text-2xl font-bold">Kuis Belum Siap</h2><p>Kuis ini belum memiliki soal.</p><button onClick={onCompleteQuiz} className="mt-6 px-6 py-2 bg-sesm-deep text-white rounded-lg">Kembali</button></div>; //
    if (gameState === 'submitting') return <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center"><FiLoader className="animate-spin text-4xl text-sesm-teal mb-4" /><p>Mengirim jawaban...</p></div>; //
    // Hasil akhir sekarang menggunakan totalPointsEarned dari state (yang diupdate dari backend)
    if (gameState === 'finished' && !activeMeme.src) { return <QuizLeaderboard totalPointsEarned={totalPointsEarned} scorePercentage={finalScorePercentage} results={results} onCompleteQuiz={onCompleteQuiz} showLeaderboard={quizSettings.setting_show_leaderboard} />; } //

    const handleMemeClose = () => { setActiveMeme({ src: null, title: '' }); if (gameState === 'meme') { setGameState('finished'); } }; //

    // Handler klik opsi jawaban (Tidak berubah)
    const handleOptionClick = (optionText) => {
        if (gameState === 'playing') {
            setAnswer(prev => ({ ...prev, mc: optionText }));
        }
    }; //

    return (
        <>
            <AnimatePresence>{activeMeme.src && <MemeOverlay meme={activeMeme.src} title={activeMeme.title} onClose={handleMemeClose} />}</AnimatePresence>
            <AnimatePresence>{feedback.show && <AnswerFeedback isCorrect={feedback.isCorrect} />}</AnimatePresence> {/* */}
            <div className="min-h-screen bg-gray-100 flex flex-col">
                {/* Header (Tidak berubah) */}
                {quizSettings.setting_is_timer_enabled && ( <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm"><button onClick={onCompleteQuiz} className="p-2 rounded-full hover:bg-gray-100"><FiArrowLeft size={24} /></button><div className="w-full bg-gray-200 rounded-full h-2.5 mx-4"><motion.div className="bg-green-500 h-2.5 rounded-full" style={{ width: timeLeft !== null ? `${(timeLeft / (isRedemptionRound ? REDEMPTION_DURATION : QUIZ_DURATION)) * 100}%` : '0%'}} /></div><div className={`flex items-center space-x-2 font-bold text-lg w-16 justify-end ${timeLeft !== null && timeLeft <= 5 && !isRedemptionRound ? 'text-red-500 animate-pulse' : 'text-sesm-deep'}`}><FiClock /><span>{timeLeft ?? '00'}</span></div></header> )}
                {!quizSettings.setting_is_timer_enabled && ( <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm"><button onClick={onCompleteQuiz} className="p-2 rounded-full hover:bg-gray-100"><FiArrowLeft size={24} /></button><div className='flex-grow'></div><div className="w-16"></div></header> )}

                <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    {currentQuestion ? (
                        <div className="w-full max-w-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQuestionIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                                    {isRedemptionRound && <p className="font-bold text-red-500 mb-2 animate-pulse">Kesempatan Kedua!</p>}
                                    <p className="text-sm font-semibold text-gray-500">Pertanyaan {currentQuestionIndex + 1} dari {fullQuizData.questions.length}</p>
                                    <MediaViewer attachments={currentQuestion.media_attachments} />
                                    <h2 className="text-xl md:text-2xl font-bold text-sesm-deep mt-2 mb-8">{currentQuestion.question_text}</h2>

                                    <div className="space-y-4">
                                        {currentQuestion.question_type.includes('pilihan-ganda') && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(currentQuestion.options || []).map((option) => (
                                                    <motion.button
                                                        key={option.id || option.option_text}
                                                        onClick={() => handleOptionClick(option.option_text)}
                                                        className={`p-4 rounded-lg font-semibold text-lg shadow-md transition-all border-2 ${getButtonClass(option.option_text)}`}
                                                        whileHover={{ scale: gameState === 'playing' ? 1.03 : 1 }}
                                                        whileTap={{ scale: gameState === 'playing' ? 0.98 : 1 }}
                                                        disabled={gameState !== 'playing'}
                                                    >
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
                            {/* Tombol Jawab (Tidak berubah) */}
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
                {/* Footer (✅ PERBAIKAN DI SINI: Menampilkan totalPointsEarned dari state) */}
                <footer className="p-4 bg-white flex justify-between items-center border-t">
                    <div>
                        <p className="text-sm text-gray-500">Poin Sementara</p>
                        {/* Menampilkan state totalPointsEarned yang diupdate secara lokal */}
                        <p className="font-bold text-xl text-sesm-deep">{totalPointsEarned}</p>
                    </div>
                </footer>
            </div>
        </>
    ); //
};

export default QuizForm;