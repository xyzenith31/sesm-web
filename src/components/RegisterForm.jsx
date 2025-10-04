import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Style input yang konsisten
  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  return (
    <form className="space-y-4 w-full">
      <input type="text" placeholder="Username" className={inputStyles}/>
      <input type="email" placeholder="Email" className={inputStyles}/>
      <input type="text" placeholder="Nama Lengkap" className={inputStyles}/>
      <input type="tel" placeholder="No. HP" className={inputStyles}/>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className={inputStyles}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500"
        >
          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      </div>

      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Konfirmasi Password"
          className={inputStyles}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500"
        >
          {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      </div>

      <div className="pt-2">
        {/* Tombol utama dengan warna putih agar kontras */}
        <button
          type="submit"
          className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95"
        >
          REGISTER
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;