// contoh-sesm-web/components/Notification.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const Notification = ({ isOpen, onClose, title, message, success = true }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${success ? 'bg-green-100' : 'bg-red-100'}`}>
              {success ? (
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <FiAlertTriangle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-2">{message}</p>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
            <button
              onClick={onClose}
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:w-auto sm:text-sm ${success ? 'bg-sesm-teal hover:bg-sesm-deep' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Oke
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;