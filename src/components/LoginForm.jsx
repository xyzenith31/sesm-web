import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

// Terima `onLoginSuccess` sebagai prop
const LoginForm = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Fungsi untuk menangani submit form
  const handleSignIn = (event) => {
    event.preventDefault(); // Mencegah reload halaman
    // Di aplikasi nyata, di sini ada validasi & request ke server.
    // Untuk sekarang, kita langsung panggil fungsi navigasi.
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    // Tambahkan `onSubmit` ke tag form
    <form className="space-y-5 w-full" onSubmit={handleSignIn}>
      <div>
        <input 
          type="text" 
          placeholder="Username or No. HP"
          className="w-full px-5 py-3 text-gray-700 bg-white rounded-full focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300"
        />
      </div>
      <div className="relative">
        <input 
          type={showPassword ? "text" : "password"} 
          placeholder="Password"
          className="w-full px-5 py-3 text-gray-700 bg-white rounded-full focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600"
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      
      <div className="flex items-center justify-between text-sm px-2 text-white">
        <label className="flex items-center select-none cursor-pointer">
          <input type="checkbox" className="mr-2 accent-sesm-deep"/>
          Remember
        </label>
        <a href="#" className="hover:underline">Forget Password?</a>
      </div>
      
      <div>
        {/* Tombol ini sekarang akan memicu `handleSignIn` */}
        <button 
          type="submit"
          className="w-full px-5 py-3 font-bold text-white transition-all duration-300 transform bg-sesm-deep rounded-full hover:bg-opacity-90 active:scale-95 hover:scale-105"
        >
          SIGN IN
        </button>
      </div>
    </form>
  );
};

export default LoginForm;