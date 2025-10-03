import React from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout'; // Kita gunakan AuthLayout lagi
import Logo from '../assets/logo.png';

const WelcomePage = ({ onExplore }) => {
  // Animasi untuk elemen-elemen di dalam card
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <AuthLayout>
      {/* Container untuk konten yang akan di-stagger */}
      <motion.div
        className="flex flex-col items-center text-center"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.2 }}}}
      >
        {/* Lingkaran Kaca di belakang Logo */}
        <motion.div 
          className="relative w-64 h-64 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center shadow-2xl mb-8"
          variants={itemVariants}
        >
          <img src={Logo} alt="SESM Logo" className="w-48 h-auto" />
        </motion.div>

        {/* Slogan */}
        <motion.div className="mb-10" variants={itemVariants}>
          <h1 className="text-2xl font-bold tracking-wider text-white">SMART EDUCATION</h1>
          <h1 className="text-2xl font-bold tracking-wider text-white">SMART MORALITY</h1>
        </motion.div>

        {/* Tombol Mulai Sekarang */}
        <motion.div variants={itemVariants} className="w-full">
          <button 
            onClick={onExplore}
            className="w-full max-w-xs py-4 text-lg font-bold text-sesm-deep bg-gray-200 rounded-full transition-all duration-300 hover:bg-gray-300 active:scale-95 shadow-lg"
          >
            Explore Now
          </button>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};

export default WelcomePage;