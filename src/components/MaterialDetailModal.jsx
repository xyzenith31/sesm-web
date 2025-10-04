import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiHelpCircle, FiCheck, FiXCircle } from 'react-icons/fi';

const MaterialDetailModal = ({ material, onClose }) => {
  const [answers, setAnswers] = useState([]);
  const [pristineStates, setPristineStates] = useState([]);

  useEffect(() => {
    if (material.tasks && material.tasks.length > 0) {
      setAnswers(Array(material.tasks.length).fill(''));
      setPristineStates(Array(material.tasks.length).fill(true));
    }
  }, [material]);

  const handleAnswerChange = (e, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = e.target.value;
    setAnswers(newAnswers);

    if (pristineStates[index]) {
      const newPristineStates = [...pristineStates];
      newPristineStates[index] = false;
      setPristineStates(newPristineStates);
    }
  };
  
  const getAnswerIcon = (index) => {
    if (pristineStates[index]) return <FiHelpCircle className="text-gray-400" />;
    if (answers[index] && answers[index].trim() !== '') return <FiCheck className="text-green-500" />;
    return <FiXCircle className="text-red-500" />;
  };

  return (
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
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-sesm-deep">{material.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <FiX className="text-gray-600" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
           {material.type === 'video' ? (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                className="w-full h-full"
                src={material.url.replace("watch?v=", "embed/").split('&')[0]} // Membersihkan & mengubah URL
                title="Material Viewer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <img src={material.imageUrl} alt={material.title} className="max-w-full max-h-full object-contain rounded-lg"/>
            </div>
          )}
          
          <div className="space-y-6 mt-6">
            <div>
                <h3 className="font-bold text-gray-800 mb-2">Deskripsi</h3>
                <p className="text-sm text-gray-600">{material.description}</p>
            </div>
            
            {material.tasks && material.tasks.length > 0 && (
              <div>
                  <h3 className="font-bold text-gray-800 mb-3">Tugas</h3>
                  <div className="space-y-4">
                      {material.tasks.map((task, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-semibold text-gray-700 mb-2">{task}</p>
                              <div className="relative">
                                  <textarea
                                      value={answers[index] || ''}
                                      onChange={(e) => handleAnswerChange(e, index)}
                                      placeholder="Tulis jawabanmu di sini..."
                                      className="w-full h-20 p-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                                  />
                                  <div className="absolute top-2.5 right-2.5 text-2xl">
                                      {getAnswerIcon(index)}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
            )}
          </div>
        </main>
      </motion.div>
    </motion.div>
  );
};

export default MaterialDetailModal;