import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputStyles = "w-full px-5 py-3 text-gray-700 bg-white rounded-full focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300";

  return (
    <form className="space-y-4 w-full">
      <input type="text" placeholder="Username" className={inputStyles}/>
      <input type="email" placeholder="Email" className={inputStyles}/>
      <input type="text" placeholder="Nama" className={inputStyles}/>
      <input type="number" placeholder="Umur" className={inputStyles}/>
      <input type="tel" placeholder="No. HP" className={inputStyles}/>

      <div className="relative">
        <input type={showPassword ? "text" : "password"} placeholder="Password" className={inputStyles}/>
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600">
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      <div className="relative">
        <input type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi Password" className={inputStyles}/>
        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600">
          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      
      <div className="pt-2">
        <button 
          type="submit"
          className="w-full px-5 py-3 font-bold text-white transition-all duration-300 transform bg-sesm-deep rounded-full hover:bg-opacity-90 active:scale-95 hover:scale-105"
        >
          REGISTER
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;