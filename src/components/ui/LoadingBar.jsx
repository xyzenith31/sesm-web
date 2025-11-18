import React from 'react';
import { motion } from 'framer-motion';

const LoadingBar = () => (
  <motion.div
    initial={{ width: '0%' }}
    animate={{ width: '100%' }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 z-[9999]"
  />
);

export default LoadingBar;