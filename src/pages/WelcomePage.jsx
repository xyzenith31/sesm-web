import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import WelcomeLayout from '../layouts/WelcomeLayout';
import Logo from '../assets/logo.png';

const WelcomePage = () => {
  return (
    <WelcomeLayout>
      <div className="flex flex-col min-h-screen">
        {/* === Area Konten Atas (Gradien) === */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-grow flex flex-col items-center justify-center text-white text-center px-4 pt-16"
        >
          {/* Logo dengan Efek Kaca (Glassmorphism) */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Lingkaran blur di belakang */}
            <div className="absolute w-full h-full bg-white/10 rounded-full backdrop-blur-md shadow-lg"></div>
            {/* Gambar logo di atas */}
            <img src={Logo} alt="SESM Logo" className="w-48 h-auto z-10" />
          </div>

          {/* Slogan */}
          <div className="mt-8">
            <h1 className="font-lora text-3xl font-bold tracking-wide leading-tight">SMART EDUCATION</h1>
            <h1 className="font-lora text-3xl font-bold tracking-wide">SMART MORALITY</h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
          className="bg-white w-full rounded-t-[2.5rem] shadow-2xl p-8 flex flex-col items-center"
        >
          <Link to="/login" className="w-full max-w-xs">
            <button
              className="w-full py-4 text-lg font-bold text-sesm-button-text bg-sesm-button-bg rounded-full transition-all duration-300 hover:bg-gray-300 active:scale-95 shadow-lg"
            >
              Explore Now
            </button>
          </Link>
        </motion.div>
      </div>
    </WelcomeLayout>
  );
};

export default WelcomePage;