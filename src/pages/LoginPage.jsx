import React from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/LoginForm';
import Logo from '../assets/logo.png';

const LoginPage = ({ onSwitchToRegister }) => {
  // Animasi untuk elemen-elemen di dalam card
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <AuthLayout>
      {/* Card konten (LOGO, judul, form, link register) */}
      <motion.div 
        className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 }}}} // Stagger children
      >
        {/* Logo - SEKARANG ADA DI DALAM CARD */}
        <motion.div variants={itemVariants} className="mb-6">
          <img src={Logo} alt="SESM Logo" className="w-40 h-auto mx-auto" />
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-3xl font-bold text-center mb-6">
          Sign In
        </motion.h1>
        
        <motion.div variants={itemVariants} className="w-full">
          <LoginForm />
        </motion.div>
        
        <motion.p variants={itemVariants} className="mt-8 text-sm text-center text-white">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="font-bold underline transition hover:text-gray-200"
          >
            Create Account
          </button>
        </motion.p>
      </motion.div>
    </AuthLayout>
  );
};

export default LoginPage;