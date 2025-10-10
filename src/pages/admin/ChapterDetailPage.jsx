// contoh-sesm-web/src/components/ChapterDetailModal.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiRefreshCw, FiLoader } from 'react-icons/fi';
import DataService from '../services/dataService'; // Pastikan diimpor

// ... (Komponen QuestionCard tidak berubah)

const ChapterDetailModal = ({ materiKey, onClose }) => {
  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  // --- STATE BARU ---
  const [submissionStatus, setSubmissionStatus] = useState({
    score: null,
    message: '',
  });

  useEffect(() => {
    if (materiKey) {
      setLoading(true);
      // Endpoint siswa tidak mengembalikan jawaban, jadi kita pakai yg sudah ada
      DataService.getDetailMateriForAdmin(materiKey)
        .then(response => {
          setMateri(response.data);
          // Inisialisasi state jawaban
          const initialAnswers = {};
          response.data.questions.forEach(q => {
              initialAnswers[q.id] = '';
          });
          setAnswers(initialAnswers);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [materiKey]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  // --- FUNGSI PENGUMPULAN JAWABAN (DIPERBARUI TOTAL) ---
  const handleSubmit = async () => {
    const answerPayload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer: answer || ""
    }));

    try {
        const response = await DataService.submitAnswers(materiKey, answerPayload);
        setSubmissionStatus({
            score: response.data.score,
            message: response.data.message,
        });
        setIsSubmitted(true);
    } catch (error) {
        const message = error.response?.data?.message || "Gagal mengirim jawaban.";
        setSubmissionStatus({ score: null, message });
        setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    // Reset semua state ke awal
    const initialAnswers = {};
    materi.questions.forEach(q => {
        initialAnswers[q.id] = '';
    });
    setAnswers(initialAnswers);
    setIsSubmitted(false);
    setSubmissionStatus({ score: null, message: '' });
  };
  
  return createPortal(
    // ... (kode JSX modal bagian atas tidak berubah)
    <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
            <div className="flex justify-center items-center h-48"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
        ) : materi?.questions && materi.questions.length > 0 ? (
            materi.questions.map((q, index) => (
                <QuestionCard 
                    key={q.id} 
                    question={q} 
                    index={index} 
                    userAnswer={answers[q.id]} 
                    // Mengirim question ID agar mudah dilacak
                    onAnswerChange={(id, val) => handleAnswerChange(q.id, val)} 
                    isSubmitted={isSubmitted} 
                />
            ))
        ) : (
            <p className="text-center text-gray-500">Belum ada soal untuk bab ini.</p>
        )}
    </main>
    ,
    <footer className='flex-shrink-0 p-4 bg-gray-50 border-t rounded-b-2xl'>
        {isSubmitted ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <h3 className="text-xl font-bold text-sesm-deep">Latihan Selesai!</h3>
                {submissionStatus.score !== null && submissionStatus.score !== undefined ? (
                    <>
                        <p className="text-5xl font-bold my-2 text-sesm-teal">{submissionStatus.score}</p>
                        <p className="text-sm text-gray-600">Skor Akhir Anda</p>
                    </>
                ) : (
                    <p className="text-sm text-gray-600 my-4">{submissionStatus.message}</p>
                )}
                <motion.button onClick={handleReset} className="mt-4 flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-sesm-deep/10 text-sesm-deep font-bold py-3 rounded-lg" whileTap={{scale: 0.95}}>
                    <FiRefreshCw />
                    <span>Coba Lagi</span>
                </motion.button>
             </motion.div>
        ) : (
            <motion.button onClick={handleSubmit} disabled={loading} className="w-full bg-sesm-deep text-white font-bold py-3 rounded-xl shadow-lg disabled:bg-gray-400" whileTap={{ scale: 0.98 }}>
                Kumpul Jawaban
            </motion.button>
        )}
    </footer>
    // ... (sisa kode JSX tidak berubah)
  );
};

export default ChapterDetailModal;