import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-sesm-sky to-sesm-teal flex flex-col items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;