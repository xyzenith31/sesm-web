import React from 'react';
import { motion } from 'framer-motion';
import {
  FaPen, FaPencilAlt, FaRuler, FaPaintBrush, FaHighlighter,
  FaBook, FaPaperclip, FaPalette, FaCompass
} from 'react-icons/fa';
import { FiScissors } from 'react-icons/fi';

const stationeryIcons = [
  { icon: FaPen, color: 'text-blue-500' },
  { icon: FaPencilAlt, color: 'text-yellow-500' },
  { icon: FaRuler, color: 'text-green-500' },
  { icon: FaPaintBrush, color: 'text-purple-500' },
  { icon: FaHighlighter, color: 'text-orange-500' },
  { icon: FaBook, color: 'text-red-500' },
  { icon: FaPaperclip, color: 'text-gray-500' },
  { icon: FaPalette, color: 'text-pink-500' },
  { icon: FaCompass, color: 'text-indigo-500' },
  { icon: FiScissors, color: 'text-teal-500' },
];

const FallingIcon = ({ icon: Icon, color, size }) => {
  const duration = Math.random() * 8 + 8; // Durasi 8-16 detik
  const delay = Math.random() * 12;      // Delay hingga 12 detik
  const xStart = Math.random() * 100;    // Posisi awal horizontal
  
  // FIX: Menambahkan pergerakan horizontal (drift) saat ikon jatuh
  // Ini akan membuat ikon jatuh secara diagonal dan menyebar lebih merata
  const xEnd = xStart + (Math.random() * 40 - 20); // Bergeser ke kiri/kanan maks 20%

  const initialRotate = Math.random() * 360;
  const animateRotate = initialRotate + (Math.random() > 0.5 ? 180 : -180);

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        top: '-10vh', // Mulai dari atas
        left: `${xStart}%`, // Posisi awal horizontal
      }}
      initial={{
        y: '-10vh',
        x: '0%', // Posisi x relatif awal
        rotate: initialRotate,
      }}
      animate={{
        y: '110vh', // Jatuh ke bawah layar
        x: `${xEnd - xStart}%`, // Bergerak secara horizontal saat jatuh
        rotate: animateRotate,
      }}
      transition={{
        duration,
        delay,
        ease: 'linear',
        repeat: Infinity,
      }}
      // Interaksi sentuh/hover (sudah dioptimalkan)
      whileHover={{ scale: 1.3, zIndex: 50 }}
      whileTap={{ scale: 1.8, rotate: 0, opacity: 1, zIndex: 50, transition: { duration: 0.2 } }}
    >
      <Icon className={`${color} opacity-60`} style={{ fontSize: `${size}px` }} />
    </motion.div>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white -z-10">
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)`,
          backgroundSize: '100% 2rem',
        }}
      />
      {Array.from({ length: 40 }).map((_, index) => {
        const item = stationeryIcons[index % stationeryIcons.length];
        const size = Math.random() * 24 + 24;
        return <FallingIcon key={index} icon={item.icon} color={item.color} size={size} />;
      })}
    </div>
  );
};

export default AnimatedBackground;