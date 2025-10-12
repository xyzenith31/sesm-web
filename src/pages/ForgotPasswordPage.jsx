// src/pages/ForgotPasswordPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import Card from '../components/Card';
import { FiArrowLeft } from 'react-icons/fi';

const ForgotPasswordPage = ({ onNavigate, onCodeSent }) => {
  const itemContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  const handleSubmit = (e) => {
    e.preventDefault();
    // Di sini nanti logika untuk mengirim kode ke backend
    console.log('Mengirim kode verifikasi...');
    onCodeSent(); // Pindah ke halaman verifikasi kode
  };

  return (
    <AuthLayout>
      <Card>
        <motion.div
          className="flex flex-col items-center"
          variants={itemContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white text-center mb-2">
            Lupa Password
          </motion.h1>
          <motion.p variants={itemVariants} className="text-white/80 text-center mb-6 text-sm max-w-xs">
            Masukkan email atau username Anda untuk menerima kode verifikasi.
          </motion.p>

          <motion.form variants={itemVariants} className="w-full space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username atau Email"
              className={inputStyles}
              required
            />
            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95"
              >
                Kirim Kode
              </button>
            </div>
          </motion.form>

          <motion.button
            variants={itemVariants}
            onClick={() => onNavigate('login')}
            className="mt-8 text-sm flex items-center gap-2 font-semibold text-white/80 transition hover:text-white"
          >
            <FiArrowLeft /> Kembali ke Login
          </motion.button>
        </motion.div>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;