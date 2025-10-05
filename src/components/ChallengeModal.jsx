import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- PERBAIKAN DI SINI ---
// Menambahkan FiCheckCircle dan FiAlertCircle ke dalam import
import { FiX, FiCheck, FiXCircle, FiTrendingUp, FiTrendingDown, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ChallengeModal = ({ challenge, onClose, onResult }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === challenge.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);

    setTimeout(() => {
      onResult(correct);
    }, 1500);
  };

  const getButtonClass = (option) => {
    if (!isAnswered) return selectedAnswer === option ? 'bg-sesm-sky text-white' : 'bg-gray-100';
    if (option === challenge.correctAnswer) return 'bg-green-500 text-white';
    if (option === selectedAnswer && !isCorrect) return 'bg-red-500 text-white';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()} >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-sesm-deep">{challenge.category}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"> <FiX className="text-gray-600" /> </button>
        </header>

        <main className="p-6">
          <p className="text-center font-semibold text-gray-800 text-lg mb-6">{challenge.question}</p>
          <div className="space-y-3">
            {challenge.options.map((option, index) => (
              <button key={index} onClick={() => !isAnswered && setSelectedAnswer(option)} className={`w-full p-4 rounded-lg text-left font-semibold transition-all duration-300 ${getButtonClass(option)}`} >
                {option}
              </button>
            ))}
          </div>
        </main>

        <footer className="p-4 bg-gray-50 rounded-b-2xl">
          <button onClick={handleSubmit} disabled={selectedAnswer === null || isAnswered} className="w-full py-3 font-bold text-white bg-sesm-deep rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-opacity-90" >
            Jawab
          </button>
        </footer>

        <AnimatePresence>
          {isAnswered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-4" >
              {isCorrect ? (
                <>
                  <FiCheckCircle className="text-green-500 text-7xl" />
                  <p className="text-2xl font-bold text-green-600">Jawaban Benar!</p>
                  <div className='flex items-center font-bold text-lg text-green-600'>
                      <FiTrendingUp/> +{challenge.currentPoints} Poin
                  </div>
                </>
              ) : (
                <>
                  <FiXCircle className="text-red-500 text-7xl" />
                  <p className="text-2xl font-bold text-red-600">Kurang Tepat!</p>
                  <div className='flex items-center font-bold text-lg text-orange-600'>
                      <FiAlertCircle/> Poin tantangan -10
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ChallengeModal;