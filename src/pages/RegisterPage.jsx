import React from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/RegisterForm';
import Logo from '../assets/logo.png';
import Card from '../components/Card'; // <-- Impor komponen Card

const RegisterPage = ({ onSwitchToLogin }) => {
  // Animasi yang konsisten dengan halaman login
  const itemContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }, // Jeda sedikit lebih cepat untuk form yang lebih panjang
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
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
          <motion.img
            src={Logo}
            alt="SESM Logo"
            className="w-36 h-auto mb-4"
            variants={itemVariants}
          />

          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-white text-center mb-6"
          >
            Create Account
          </motion.h1>

          {/* Perbaikan utama: meneruskan onSwitchToLogin ke RegisterForm */}
          <motion.div variants={itemVariants} className="w-full">
            <RegisterForm onSwitchToLogin={onSwitchToLogin} />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-sm text-center text-white/80"
          >
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-bold underline transition hover:text-white"
            >
              Sign In
            </button>
          </motion.p>
        </motion.div>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;