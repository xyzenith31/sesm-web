// contoh-sesm-web/components/ui/Notification.jsx

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
          // Backdrop animation (fade in/out)
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          onClick={onClose} // Optional: tutup saat klik backdrop
        >
          <motion.div
            // Modal animation (pop-up)
            initial={{ scale: 0.7, opacity: 0, y: 50 }} // Mulai dari kecil, transparan, sedikit di bawah
            animate={{ scale: 1, opacity: 1, y: 0 }}    // Animasi ke ukuran normal, terlihat, di tengah
            exit={{ scale: 0.7, opacity: 0, y: 50 }}      // Animasi menghilang ke bawah
            transition={{ type: 'spring', damping: 15, stiffness: 200 }} // Efek pegas
            className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()} // Cegah penutupan saat klik di dalam modal
          >
            {/* ... isi modal notifikasi ... */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;