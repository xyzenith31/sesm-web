import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // <-- 1. IMPORT Link
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/LoginForm';
import Logo from '../assets/logo.png';
import Card from '../components/Card';

// 2. Hapus semua props (onSwitchToRegister, onLoginSuccess) karena tidak dipakai lagi
const LoginPage = () => {
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
          <motion.div variants={itemVariants}>
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
            {/* 3. Hapus prop onLoginSuccess. LoginForm akan handle navigasi sendiri */}
            <LoginForm />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-sm text-center text-white/80"
          >
            Don't have an account?{' '}
            {/* 4. GANTI <button> DENGAN <Link> */}
            <Link
              to="/register"
              className="font-bold underline transition hover:text-white"
            >
              Create Account
            </Link>
          </motion.p>
        </motion.div>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;