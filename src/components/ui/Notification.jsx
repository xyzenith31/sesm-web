import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const Notification = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  success = true,
  isConfirmation = false,
  confirmText = "Lanjutkan",
  cancelText = "Batal"
}) => {
  if (!isOpen) return null;

  const Icon = success ? FiCheckCircle : FiAlertTriangle;
  const iconColor = success ? 'text-green-600' : 'text-red-600';
  const bgColor = success ? 'bg-green-100' : 'bg-red-100';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${bgColor}`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-2">{message}</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
              {isConfirmation ? (
                <>
                  <button
                    onClick={onConfirm}
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${success ? 'bg-sesm-teal hover:bg-sesm-deep' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {confirmText}
                  </button>
                  <button
                    onClick={onClose}
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    {cancelText}
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:w-auto sm:text-sm ${success ? 'bg-sesm-teal hover:bg-sesm-deep' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Oke
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;