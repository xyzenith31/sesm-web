// contoh-sesm-web/pages/WorksheetPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiFlag, FiCheckCircle, FiChevronLeft, FiChevronRight, FiMenu, FiX, FiDownload, FiLink, FiType, FiAward } from 'react-icons/fi';
import DataService from '../services/dataService';
import ConfirmationModal from '../components/mod/ConfirmationModal';
import PointsNotification from '../components/ui/PointsNotification'; // Impor notifikasi poin

const ImageLightbox = ({ imageUrl, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={imageUrl}
                alt="Tampilan gambar diperbesar"
                className="max-w-full max-h-full rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </motion.div>
    );
};

// --- KOMPONEN MEDIAVIEWER YANG DIPERBARUI TOTAL ---
const MediaViewer = ({ mediaUrls, onImageClick }) => {
    if (!mediaUrls || mediaUrls.length === 0) {
        return null;
    }

    const API_URL = 'http://localhost:8080';

    // Fungsi untuk mengubah URL YouTube biasa menjadi URL embed
    const getYouTubeEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    return (
        <div className="mb-6 space-y-4">
            {mediaUrls.map((item, index) => {
                // Periksa tipe lampiran
                switch (item.type) {
                    case 'file':
                        const fullUrl = `${API_URL}/${item.url}`;
                        const fileExtension = item.url.split('.').pop().toLowerCase();

                        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
                            return <img key={index} src={fullUrl} alt={`Lampiran ${index + 1}`} className="max-w-full mx-auto rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105" onClick={() => onImageClick(fullUrl)} />;
                        }
                        if (['mp4', 'webm'].includes(fileExtension)) {
                            return <video key={index} src={fullUrl} controls className="w-full rounded-lg shadow-md" />;
                        }
                        if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
                            return <audio key={index} src={fullUrl} controls className="w-full" />;
                        }
                        // Fallback untuk file lain (PDF, DOCX)
                        return <a key={index} href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-sesm-deep font-semibold hover:bg-gray-200 transition-colors"><FiDownload /><span>Lihat/Unduh Lampiran ({fileExtension.toUpperCase()})</span></a>;

                    case 'link':
                        const embedUrl = getYouTubeEmbedUrl(item.url);
                        if (embedUrl) {
                            // Jika ini link YouTube, tampilkan sebagai video embed
                            return (
                                <div key={index} className="aspect-video bg-black rounded-lg overflow-hidden shadow-md">
                                    <iframe src={embedUrl} title={`YouTube video player ${index}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                                </div>
                            );
                        }
                        // Jika link biasa, tampilkan sebagai tautan
                        return <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-blue-600 font-semibold hover:bg-gray-200 transition-colors"><FiLink /><span>Buka Tautan Eksternal</span></a>;
                    
                    case 'text':
                        // Tampilkan lampiran teks
                        return (
                           <div key={index} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg text-left">
                               <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p>
                           </div>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
};


// ... (Sisa kode komponen WorksheetPage tidak ada yang berubah)
const OptionButton = ({ option, userAnswer, onClick }) => {
    const isSelected = userAnswer === option;
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-lg font-semibold transition-all duration-200 border-2 ${
                isSelected 
                ? 'bg-sesm-teal text-white border-sesm-teal' 
                : 'bg-white hover:bg-gray-100 border-gray-300'
            }`}
        >
            {option}
        </button>
    );
};

const EssayInput = ({ answer, onChange }) => (
    <textarea
        value={answer}
        onChange={onChange}
        placeholder="Tulis jawaban esaimu di sini..."
        className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
    />
);


const WorksheetPage = ({ onNavigate, chapterInfo }) => {
    const { materiKey, chapterTitle, subjectName, navigationKey } = chapterInfo || {};
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [marked, setMarked] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [showPoints, setShowPoints] = useState(false); // State untuk notifikasi poin

    useEffect(() => {
        if (materiKey) {
            setLoading(true);
            DataService.getDetailMateriForSiswa(materiKey)
                .then(response => {
                    setQuestions(response.data);
                    const initialAnswers = {};
                    response.data.forEach(q => { initialAnswers[q.id] = ''; });
                    setAnswers(initialAnswers);
                    setMarked({});
                })
                .catch(err => { console.error(err); onNavigate('home'); })
                .finally(() => setLoading(false));
        } else {
            onNavigate('home');
        }
    }, [materiKey, onNavigate]);

    const currentQuestion = questions[currentQuestionIndex];
    const handleAnswerChange = (questionId, answer) => setAnswers(prev => ({ ...prev, [questionId]: answer }));
    const toggleMark = (questionId) => setMarked(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    const goToQuestion = (index) => { if (index >= 0 && index < questions.length) { setCurrentQuestionIndex(index); setIsNavOpen(false); } };
    
    const handleSubmit = async () => {
        const answerPayload = Object.entries(answers).map(([questionId, answer]) => ({ questionId: parseInt(questionId), answer: answer || "" }));
        try {
            const response = await DataService.submitAnswers(materiKey, answerPayload);
            setSubmissionResult(response.data);
            setIsSubmitted(true);
            if (response.data.pointsAwarded) {
                setShowPoints(true);
            }
        } catch (error) {
            const message = error.response?.data?.message || "Gagal mengirim jawaban.";
            setSubmissionResult({ message });
            setIsSubmitted(true);
        }
    };

    const handleExit = () => { isSubmitted ? onNavigate(navigationKey || 'home') : setIsExitModalOpen(true); };
    const confirmExit = () => { setIsExitModalOpen(false); onNavigate(navigationKey || 'home'); };
    
    const getNavButtonClass = (q, index) => {
        const isActive = index === currentQuestionIndex;
        const isMarked = marked[q.id];
        const isAnswered = answers[q.id] && answers[q.id].trim() !== '';
        if (isActive) return 'bg-sesm-deep text-white';
        if (isMarked) return 'bg-yellow-400 text-white';
        if (isAnswered) return 'bg-green-500 text-white';
        return 'bg-gray-200 text-gray-600 hover:bg-gray-300';
    };
    
    if (loading) return <div className="min-h-screen bg-gray-100 flex justify-center items-center">Memuat soal...</div>;

    if (isSubmitted) {
        return (
            <>
                <AnimatePresence>
                    {showPoints && <PointsNotification points={submissionResult.pointsAwarded} message="Materi Selesai!" onDone={() => setShowPoints(false)} />}
                </AnimatePresence>
                <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
                     <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-sesm-deep">Latihan Selesai!</h2>
                        {submissionResult?.score !== undefined ? (
                            <>
                                <p className="text-gray-600 mt-2">Skor akhir kamu:</p>
                                <p className="text-5xl font-bold text-sesm-teal my-3">{submissionResult.score}</p>
                                {submissionResult.pointsAwarded && (
                                    <p className="flex items-center justify-center font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full"><FiAward className="mr-2"/> +{submissionResult.pointsAwarded} Poin!</p>
                                )}
                            </>
                        ) : ( <p className="text-gray-600 my-4">{submissionResult?.message || "Jawaban telah dikumpulkan."}</p> )}
                        <motion.button onClick={handleExit} className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg mt-6" whileTap={{ scale: 0.95 }}>
                            Kembali ke Daftar Bab
                        </motion.button>
                    </motion.div>
                </div>
            </>
        )
    }

    return (
        <>
            <AnimatePresence>
                {lightboxImage && (
                    <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
                )}
            </AnimatePresence>
            <ConfirmationModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} onConfirm={confirmExit} title="Yakin Ingin Keluar?" message="Proses pengerjaan soal Anda belum selesai dan tidak akan disimpan." confirmText="Ya, Keluar" />
            <AnimatePresence>
                {isNavOpen && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 md:hidden" onClick={() => setIsNavOpen(false)} /> )}
            </AnimatePresence>
            <motion.div className="fixed top-0 bottom-0 left-0 w-64 bg-white shadow-lg z-50 p-4 transform md:translate-x-0" initial={{ x: '-100%' }} animate={{ x: isNavOpen ? '0%' : '-100%' }} exit={{ x: '-100%' }} transition={{ type: 'tween', ease: 'easeInOut' }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sesm-deep">Navigasi Soal</h3>
                    <button onClick={() => setIsNavOpen(false)} className="md:hidden"><FiX/></button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, index) => (
                        <button key={q.id} onClick={() => goToQuestion(index)} className={`relative w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all ${getNavButtonClass(q, index)}`}>
                            {index + 1}
                            {marked[q.id] && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>}
                        </button>
                    ))}
                </div>
            </motion.div>
            <div className="min-h-screen bg-gray-100 flex flex-col md:pl-64">
                <header className="bg-white p-4 flex items-center sticky top-0 z-10 shadow-sm">
                    <button onClick={() => setIsNavOpen(true)} className="p-2 rounded-full hover:bg-gray-100 md:hidden mr-2"> <FiMenu size={24} className="text-gray-700" /> </button>
                     <button onClick={handleExit} className="p-2 rounded-full hover:bg-gray-100"> <FiArrowLeft size={24} className="text-gray-700" /> </button>
                    <div className="text-center flex-grow">
                        <h1 className="text-lg font-bold text-sesm-deep truncate">{chapterTitle}</h1>
                        <p className="text-xs text-gray-500">{subjectName}</p>
                    </div>
                    <div className="w-10"></div>
                </header>
                <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    {currentQuestion && (
                        <div className="w-full max-w-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQuestionIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="bg-white p-6 rounded-2xl shadow-md">
                                    <div className="flex justify-between items-start mb-6">
                                        <p className="text-sm font-semibold text-gray-500">Pertanyaan {currentQuestionIndex + 1} dari {questions.length}</p>
                                        <button onClick={() => toggleMark(currentQuestion.id)} className={`flex items-center gap-2 text-sm font-semibold p-2 rounded-lg ${marked[currentQuestion.id] ? 'bg-yellow-100 text-yellow-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                                            <FiFlag/> <span>{marked[currentQuestion.id] ? 'Hilangkan Tanda' : 'Tandai Ragu'}</span>
                                        </button>
                                    </div>
                                    <MediaViewer mediaUrls={currentQuestion.media_urls} onImageClick={setLightboxImage} />
                                    <h2 className="text-xl md:text-2xl font-bold text-sesm-deep mb-8 text-left">{currentQuestion.pertanyaan}</h2>
                                    <div className="grid grid-cols-1 gap-4 text-left">
                                        {currentQuestion.tipe_soal.includes('pilihan-ganda') && currentQuestion.options.map((option) => (
                                            <OptionButton key={option} option={option} userAnswer={answers[currentQuestion.id]} onClick={() => handleAnswerChange(currentQuestion.id, option)} />
                                        ))}
                                        {currentQuestion.tipe_soal.includes('esai') && (
                                            <EssayInput answer={answers[currentQuestion.id]} onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)} />
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </main>
                <footer className="p-4 bg-white flex justify-between items-center border-t">
                    <motion.button onClick={() => goToQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 font-semibold p-3 rounded-lg hover:bg-gray-100 disabled:opacity-50" whileTap={{ scale: 0.95 }}>
                        <FiChevronLeft/> Sebelumnya
                    </motion.button>
                    {currentQuestionIndex === questions.length - 1 ? (
                        <motion.button onClick={handleSubmit} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg" whileTap={{ scale: 0.95 }}>
                            Kumpulkan Jawaban
                        </motion.button>
                    ) : (
                        <motion.button onClick={() => goToQuestion(currentQuestionIndex + 1)} disabled={currentQuestionIndex === questions.length - 1} className="flex items-center gap-2 font-semibold p-3 rounded-lg bg-sesm-deep text-white disabled:opacity-50" whileTap={{ scale: 0.95 }}>
                            Selanjutnya <FiChevronRight/>
                        </motion.button>
                    )}
                </footer>
            </div>
        </>
    );
};

export default WorksheetPage;