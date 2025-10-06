import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';

const AnswerFeedback = ({ isCorrect }) => {
  const feedbackData = isCorrect
    ? { text: 'Benar!', icon: FiCheck, bg: 'bg-green-500' }
    : { text: 'Salah!', icon: FiX, bg: 'bg-red-500' };

  const Icon = feedbackData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`flex items-center space-x-4 px-8 py-4 rounded-xl shadow-2xl text-white ${feedbackData.bg}`}
      >
        <Icon className="text-4xl" />
        <span className="text-3xl font-bold">{feedbackData.text}</span>
      </motion.div>
    </div>
  );
};

export default AnswerFeedback;