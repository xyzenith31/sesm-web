import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import Card from '../components/Card';
import { FiArrowLeft } from 'react-icons/fi';
import AuthService from '../services/authService';

const ForgotPasswordPage = ({ onNavigate, onCodeSent }) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

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
    setLoading(true);
    setMessage('');
    setSuccessful(false);

    AuthService.forgotPassword(identifier)
      .then(response => {
        setMessage(response.data.message);
        setSuccessful(true);
        setLoading(false);
        setTimeout(() => {
          // PERBAIKAN: Kirim 'identifier' ke App.jsx saat pindah halaman
          onCodeSent(identifier);
        }, 2000);
      })
      .catch(error => {
        const resMessage = (error.response?.data?.message) || error.message || error.toString();
        setMessage(resMessage);
        setSuccessful(false);
        setLoading(false);
      });
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
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'Kirim Kode'}
              </button>
            </div>
          </motion.form>

          {message && (
            <motion.div 
              variants={itemVariants} 
              className={`p-3 mt-4 rounded-lg text-center font-bold w-full ${successful ? 'bg-green-500/80' : 'bg-red-500/80'} text-white`}
            >
              {message}
            </motion.div>
          )}

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