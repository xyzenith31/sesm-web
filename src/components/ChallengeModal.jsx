import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const ChallengeModal = ({ challenge, onClose, onAnswerSubmit }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { question, options, correctAnswer } = challenge.quiz;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedAnswer === correctAnswer;
    setTimeout(() => {
      onAnswerSubmit(isCorrect);
      onClose();
    }, 1500);
  };

  const getButtonClass = (option) => {
    if (!isSubmitted) return 'bg-white hover:bg-gray-100';
    if (option === correctAnswer) return 'bg-green-500 text-white';
    if (option === selectedAnswer) return 'bg-red-500 text-white';
    return 'bg-white';
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      {/* Konten Modal */}
      <motion.div
        // INI BAGIAN YANG DIPERBAIKI: Mengontrol posisi sepenuhnya dengan Framer Motion
        initial={{ x: "-50%", y: "-45%", opacity: 0, scale: 0.95 }}
        animate={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
        exit={{ x: "-50%", y: "-45%", opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-1/2 left-1/2 z-50 bg-gray-100 rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-sesm-deep">{challenge.category}</h3>
            <p className="text-sm text-gray-600">{question}</p>
          </div>
          <div className="space-y-3">
            {options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => !isSubmitted && setSelectedAnswer(option)}
                className={`w-full text-left p-4 rounded-lg font-semibold transition-all duration-300 border-2 ${
                  selectedAnswer === option && !isSubmitted
                    ? 'border-sesm-teal bg-sesm-teal/10'
                    : 'border-transparent'
                } ${getButtonClass(option)}`}
                whileTap={!isSubmitted ? { scale: 0.98 } : {}}
              >
                {option}
              </motion.button>
            ))}
          </div>
          <div className="mt-6">
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitted || selectedAnswer === null}
              className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg disabled:bg-gray-400"
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitted ? 'Memeriksa...' : 'Jawab'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
};

export default ChallengeModal;