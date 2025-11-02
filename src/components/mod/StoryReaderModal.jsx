import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
// [PERBAIKAN] Impor API_BASE_URL
import { API_BASE_URL } from '../../utils/apiClient';

const StoryReaderModal = ({ storyData, onClose, onComplete }) => { 
  const [currentNodeKey, setCurrentNodeKey] = useState('start');
  const currentNode = storyData[currentNodeKey];
  // [PERBAIKAN] Hapus hardcode API_URL
  // const API_URL = 'http://localhost:8080';

  const handleChoice = (nextNodeKey) => {
    if (storyData[nextNodeKey]) {
      setCurrentNodeKey(nextNodeKey);
    } else {
      console.error(`Node tujuan "${nextNodeKey}" tidak ditemukan!`);
    }
  };

  const handleClose = () => {
    if (currentNode.ending) {
      onComplete(currentNodeKey);
    } else {
      onClose();
    }
  };

  // [PERBAIKAN] Buat URL gambar yang lengkap
  const getImageUrl = (path) => {
    if (!path || path.startsWith('blob:') || path.startsWith('http')) {
        return path;
    }
    return `${API_BASE_URL}/${path}`;
  };
  const imageUrl = getImageUrl(currentNode.image);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-gray-100 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-3 right-3 p-2 rounded-full bg-white/50 hover:bg-white/80 z-20">
          <FiX className="text-gray-700" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentNodeKey}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col h-full"
          >
            <div className="w-full h-56 md:h-64 bg-gray-200 overflow-hidden">
              {/* [PERBAIKAN] Tampilkan gambar menggunakan imageUrl */}
              {imageUrl && <img src={imageUrl} alt="Ilustrasi cerita" className="w-full h-full object-cover"/>}
            </div>

            <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
              <p className="text-gray-700 text-md md:text-lg leading-relaxed whitespace-pre-wrap">{currentNode.text}</p>
              
              <div className="mt-6 space-y-3">
                {currentNode.choices && currentNode.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleChoice(choice.leadsTo)}
                    className="w-full text-left p-4 rounded-lg font-semibold transition-all duration-300 bg-white shadow-sm border-2 border-transparent hover:border-sesm-teal hover:bg-sesm-teal/10 text-sesm-deep"
                    whileTap={{ scale: 0.98 }}
                  >
                    {choice.text}
                  </motion.button>
                ))}
                
                {currentNode.ending && (
                   <motion.button
                    onClick={handleClose}
                    className="w-full p-4 rounded-lg font-bold bg-sesm-deep text-white shadow-lg"
                    whileTap={{ scale: 0.98 }}
                  >
                    Selesai Membaca
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default StoryReaderModal;
