// src/layouts/AuthLayout.jsx (Saran Perubahan)
import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    // Latar belakang diubah menjadi abu-abu terang
    <div className="min-h-screen font-sans bg-gray-100 flex flex-col items-center justify-center p-4">
      {children}
    </div>
  );
};

export default AuthLayout;