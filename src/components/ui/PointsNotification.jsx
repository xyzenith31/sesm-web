import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FiAward } from 'react-icons/fi';

const PointsNotification = ({ points, message, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onDone]);

  return createPortal(
    <div className="fixed top-5 right-5 z-[100]">
      <motion.div
        layout
        initial={{ opacity: 0, y: -50, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-4 rounded-xl shadow-2xl flex items-center space-x-3"
      >
        <FiAward className="text-yellow-300 text-3xl flex-shrink-0" />
        <div>
            <p className="font-bold text-lg">+{points} Poin!</p>
            <p className="text-sm opacity-90">{message}</p>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default PointsNotification;