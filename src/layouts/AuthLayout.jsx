import React from 'react';
import AnimatedBackground from '../components/Auth/AnimatedBackground'; // 1. Impor background animasi

const AuthLayout = ({ children }) => {
  return (
    // 2. Hapus 'bg-gray-100' dan tambahkan 'relative overflow-hidden'
    <div className="relative min-h-screen font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground /> {/* 3. Panggil komponen background di sini */}
      
      {/* 4. Bungkus children dengan div agar selalu di atas background */}
      <div className="z-10 w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;