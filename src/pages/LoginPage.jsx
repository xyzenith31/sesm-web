import React from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/Auth/LoginForm';
import Logo from '../assets/logo.png'; // Path ini sudah benar
import Card from '../components/Card';

const LoginPage = ({ onSwitchToRegister, onLoginSuccess }) => {
  // Animasi untuk item di dalam kartu
  const itemContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
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
          {/* Logo ditampilkan menggunakan tag <img> */}
          <motion.div variants={itemVariants}>
            {/* INI BAGIAN YANG DIPERBAIKI */}
            <img 
              src={Logo} 
              alt="Sesm Logo" 
              className="w-36 h-auto mb-4" 
            />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-white text-center mb-6"
          >
            Sign In
          </motion.h1>

          <motion.div variants={itemVariants} className="w-full">
            <LoginForm onLoginSuccess={onLoginSuccess} />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-sm text-center text-white/80"
          >
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-bold underline transition hover:text-white"
            >
              Create Account
            </button>
          </motion.p>
        </motion.div>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;