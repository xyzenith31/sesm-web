import React from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/RegisterForm';
import Logo from '../assets/logo.png';

const RegisterPage = ({ onSwitchToLogin }) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <AuthLayout>
      {/* Card konten (LOGO, judul, form, link login) */}
      <motion.div 
        className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
      >
        {/* Logo - SEKARANG ADA DI DALAM CARD */}
        <motion.div variants={itemVariants} className="mb-6">
          <img src={Logo} alt="SESM Logo" className="w-40 h-auto mx-auto" />
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-3xl font-bold text-center mb-6">
          Create Account
        </motion.h1>
        
        <motion.div variants={itemVariants} className="w-full">
          <RegisterForm />
        </motion.div>
        
        <motion.p variants={itemVariants} className="mt-6 text-sm text-center text-white">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-bold underline transition hover:text-gray-200"
          >
            Sign In
          </button>
        </motion.p>
      </motion.div>
    </AuthLayout>
  );
};

export default RegisterPage;