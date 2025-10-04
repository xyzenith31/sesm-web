import React from 'react';
import { motion } from 'framer-motion';
import { FaPen, FaPencilAlt, FaRuler, FaPaintBrush, FaEraser, FaHighlighter } from 'react-icons/fa';

// Array ikon alat tulis dengan warna yang berbeda
const stationeryIcons = [
  { icon: FaPen, color: 'text-blue-500' },
  { icon: FaPencilAlt, color: 'text-yellow-500' },
  { icon: FaRuler, color: 'text-green-500' },
  { icon: FaPaintBrush, color: 'text-purple-500' },
  { icon: FaEraser, color: 'text-pink-500' },
  { icon: FaHighlighter, color: 'text-orange-500' },
];

// Komponen untuk satu ikon yang jatuh
const FallingIcon = ({ icon: Icon, color }) => {
  const duration = Math.random() * 5 + 5; // Durasi animasi acak antara 5-10 detik
  const delay = Math.random() * 5;      // Penundaan acak hingga 5 detik
  const xStart = Math.random() * 100;     // Posisi awal horizontal acak

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${xStart}vw`,
        top: '-10vh', // Mulai dari atas layar
      }}
      animate={{
        y: '110vh', // Jatuh ke bawah layar
        rotate: Math.random() * 360, // Rotasi acak
      }}
      transition={{
        duration,
        delay,
        ease: 'linear',
        repeat: Infinity, // Ulangi animasi tanpa henti
      }}
    >
      <Icon className={`${color} text-4xl opacity-70`} />
    </motion.div>
  );
};

// Komponen utama untuk latar belakang
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white -z-10">
      {/* Background kertas bergaris */}
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)`,
          backgroundSize: '100% 2rem', // Jarak antar garis
        }}
      />

      {/* Ikon-ikon yang berjatuhan */}
      {Array.from({ length: 15 }).map((_, index) => {
        const item = stationeryIcons[index % stationeryIcons.length];
        return <FallingIcon key={index} icon={item.icon} color={item.color} />;
      })}
    </div>
  );
};

export default AnimatedBackground;