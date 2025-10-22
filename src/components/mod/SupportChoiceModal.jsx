// src/components/mod/SupportChoiceModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiCheckCircle } from 'react-icons/fi';
import { FaBug } from 'react-icons/fa'; // Import FaBug

const SupportChoiceModal = ({ isOpen, onClose, onEmailClick, onFeedbackClick }) => {
    if (!isOpen) return null;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm"
                    onClick={onClose} // Close when clicking backdrop
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center p-6 text-center"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="support-modal-title"
                    >
                        {/* Icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <FiCheckCircle className="h-10 w-10 text-green-600" />
                        </div>

                        {/* Title */}
                        <h3 id="support-modal-title" className="text-xl font-bold text-gray-900 mb-2">
                            Hubungi Support
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-500 mb-6">
                            Pilih jenis dukungan yang Anda perlukan:
                        </p>

                        {/* Buttons */}
                        <div className="w-full space-y-3">
                            {/* Feedback Button */}
                            <motion.button
                                onClick={onFeedbackClick}
                                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-sesm-deep text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sesm-deep sm:text-sm"
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaBug className="mr-2 -ml-1 h-5 w-5" /> Lapor Bug / Usul Fitur
                            </motion.button>

                            {/* Email Button */}
                            <motion.button
                                onClick={onEmailClick}
                                className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sesm-teal sm:text-sm"
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiMail className="mr-2 -ml-1 h-5 w-5" /> Kritik dan Saran (Email)
                            </motion.button>
                        </div>
                         {/* Optional Close Button */}
                         {/* <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full"><FiX /></button> */}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SupportChoiceModal;