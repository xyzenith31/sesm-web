// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import Card from '../components/Card';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const ResetPasswordPage = ({ onPasswordReset }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    // Di sini nanti logika ganti password ke backend
    console.log('Mengganti password...');
    alert('Password berhasil diganti! Anda akan diarahkan ke halaman utama.');
    onPasswordReset(); // Pindah ke homepage
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
            Atur Password Baru
          </motion.h1>
          <motion.p variants={itemVariants} className="text-white/80 text-center mb-6 text-sm max-w-xs">
            Pastikan password baru Anda kuat dan mudah diingat.
          </motion.p>

          <motion.form variants={itemVariants} className="w-full space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Password Baru" className={inputStyles} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">{showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
            </div>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi Password Baru" className={inputStyles} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">{showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95"
              >
                Ganti Password
              </button>
            </div>
          </motion.form>
        </motion.div>
      </Card>
    </AuthLayout>
  );
};

export default ResetPasswordPage;