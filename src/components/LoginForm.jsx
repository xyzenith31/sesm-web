import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'framer-motion';

const LoginForm = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (event) => {
    event.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  // Input field kembali menggunakan background putih agar kontras dengan kartu
  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  return (
    <form className="space-y-4 w-full" onSubmit={handleSignIn}>
      <div>
        <input
          type="text"
          placeholder="Username or No. HP"
          className={inputStyles}
        />
      </div>
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

      <div className="flex items-center justify-between text-sm px-1 text-white/90">
        <label className="flex items-center select-none cursor-pointer">
          <input type="checkbox" className="mr-2 h-4 w-4 rounded border-white/50 bg-transparent text-sesm-sky focus:ring-sesm-sky/50" />
          Remember
        </label>
        <a href="#" className="font-semibold hover:underline">Forget Password?</a>
      </div>

      <div className="pt-2">
        {/* Tombol diubah menjadi putih untuk kontras maksimal */}
        <button
          type="submit"
          className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95"
        >
          SIGN IN
        </button>
      </div>
    </form>
  );
};

export default LoginForm;