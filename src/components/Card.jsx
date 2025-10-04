import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children }) => {
  // Animasi untuk kartu agar muncul dengan elegan
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] // Kurva ease-out yang lebih dramatis
      } 
    }
  };

  return (
    <motion.div
      className="w-full max-w-sm bg-gradient-to-b from-sesm-teal to-sesm-deep text-white rounded-3xl shadow-2xl p-8"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

export default Card;