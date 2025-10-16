// contoh-sesm-web/src/components/ChapterDetailModal.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiRefreshCw, FiLoader } from 'react-icons/fi';
import DataService from '../../services/dataService';

const QuestionCard = ({ question, index, userAnswer, onAnswerChange, isSubmitted }) => {
  const isCorrect = isSubmitted && userAnswer && question.correctAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();

  const getOptionClass = (option) => {
    if (!isSubmitted) return userAnswer === option ? 'bg-sesm-teal text-white' : 'bg-white hover:bg-gray-100';
    if (option === question.correctAnswer) return 'bg-green-500 text-white';
    if (option === userAnswer) return 'bg-red-500 text-white';
    return 'bg-white opacity-60';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-50 p-4 rounded-xl"
    >
      <div className="flex justify-between items-start">
        <p className="text-md font-semibold text-gray-800 mb-4">{index + 1}. {question.question}</p>
        {isSubmitted && isCorrect && <FiCheck className="text-green-500 text-2xl flex-shrink-0" />}
      </div>
      
      {question.type === 'multiple-choice' && (
        <div className="space-y-3">
          {question.options.map((option) => (
            <button key={option} onClick={() => onAnswerChange(index, option)} disabled={isSubmitted} className={`w-full text-left p-3 rounded-lg font-semibold transition-all duration-200 ${getOptionClass(option)}`}>
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === 'essay' && (
        <textarea value={userAnswer || ''} onChange={(e) => onAnswerChange(index, e.target.value)} disabled={isSubmitted} placeholder="Tulis jawabanmu di sini..." className={`w-full h-24 p-3 border-2 rounded-lg focus:outline-none transition-colors ${isSubmitted ? 'bg-gray-200' : 'focus:ring-2 focus:ring-sesm-teal border-gray-300'}`} />
      )}
    </motion.div>
  );
};

const ChapterDetailModal = ({ materiKey, onClose }) => {
  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (materiKey) {
      setLoading(true);
      DataService.getDetailMateriForAdmin(materiKey) // Kita pakai endpoint admin agar dapat kunci jawaban
        .then(response => {
          setMateri(response.data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [materiKey]);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const calculateScore = () => {
    if (!materi || !materi.questions) return 0;
    return materi.questions.reduce((score, question, index) => {
      if (question.type === 'multiple-choice' && answers[index] === question.correctAnswer) {
        return score + 1;
      }
      return score;
    }, 0);
  };
  
  const score = useMemo(calculateScore, [isSubmitted, answers, materi]);
  const multipleChoiceCount = useMemo(() => {
    if (!materi || !materi.questions) return 0;
    return materi.questions.filter(q => q.type === 'multiple-choice').length;
  }, [materi]);
  
  const finalScore = multipleChoiceCount > 0 ? Math.round((score / multipleChoiceCount) * 100) : 100;

  const handleSubmit = () => setIsSubmitted(true);
  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-sesm-deep">{materi?.judul || "Memuat..."}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX className="text-gray-600" /></button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
                <div className="flex justify-center items-center h-48"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
            ) : materi?.questions && materi.questions.length > 0 ? (
                materi.questions.map((q, index) => (
                    <QuestionCard key={`${materi.judul}-${index}`} question={q} index={index} userAnswer={answers[index]} onAnswerChange={handleAnswerChange} isSubmitted={isSubmitted} />
                ))
            ) : (
                <p className="text-center text-gray-500">Belum ada soal untuk bab ini.</p>
            )}
        </main>
        
        <footer className='flex-shrink-0 p-4 bg-gray-50 border-t rounded-b-2xl'>
            {isSubmitted ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <h3 className="text-xl font-bold text-sesm-deep">Latihan Selesai!</h3>
                    <p className="text-5xl font-bold my-2 text-sesm-teal">{finalScore}</p>
                    <p className="text-sm text-gray-600">Skor Pilihan Ganda Anda</p>
                    <motion.button onClick={handleReset} className="mt-4 flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-sesm-deep/10 text-sesm-deep font-bold py-3 rounded-lg" whileTap={{scale: 0.95}}>
                        <FiRefreshCw />
                        <span>Coba Lagi</span>
                    </motion.button>
                 </motion.div>
            ) : (
                <motion.button onClick={handleSubmit} disabled={loading} className="w-full bg-sesm-deep text-white font-bold py-3 rounded-xl shadow-lg disabled:bg-gray-400" whileTap={{ scale: 0.98 }}>
                    Kumpul Jawaban ({Object.keys(answers).length}/{materi?.questions?.length || 0})
                </motion.button>
            )}
        </footer>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ChapterDetailModal;