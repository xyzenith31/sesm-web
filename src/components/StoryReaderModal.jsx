import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

// Props 'onComplete' ditambahkan untuk menangani event selesai
const StoryReaderModal = ({ storyData, onClose, onComplete }) => { 
  const [currentNodeKey, setCurrentNodeKey] = useState('start');
  const currentNode = storyData[currentNodeKey];

  const handleChoice = (nextNodeKey) => {
    setCurrentNodeKey(nextNodeKey);
  };

  const handleClose = () => {
    // Jika cerita sudah tamat, panggil onComplete
    if (currentNode.ending) {
      onComplete(currentNodeKey);
    } else {
    // Jika belum tamat tapi ditutup, panggil onClose biasa
      onClose();
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleClose} // Tombol backdrop sekarang juga memanggil handleClose
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
            <div className="w-full h-56 md:h-64 bg-white overflow-hidden">
              <img src={currentNode.image} alt="Ilustrasi cerita" className="w-full h-full object-cover"/>
            </div>

            <div className="flex-1 flex flex-col justify-between p-6">
              <p className="text-gray-700 text-md md:text-lg leading-relaxed">{currentNode.text}</p>
              
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
                    onClick={handleClose} // Tombol ini juga memanggil handleClose
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