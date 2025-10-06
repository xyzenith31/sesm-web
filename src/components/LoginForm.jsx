import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setError('');

    try {
      // Pastikan URL ini sudah benar
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        login: formData.login,
        password: formData.password
      });

      if (response.data.accessToken) {
        if (onLoginSuccess) {
          onLoginSuccess(response.data);
        }
      }

    } catch (err) {
      // --- PENAMBAHAN UNTUK DEBUGGING ---
      console.error("Terjadi error saat mencoba login:", err);

      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        // Ini terjadi jika request dikirim tapi tidak ada response (backend mati/CORS)
        setError('Tidak bisa terhubung ke server. Pastikan server backend sudah berjalan.');
      } else {
        // Error lainnya
        setError('Login gagal. Periksa kembali username/email dan password Anda.');
      }
    }
  };

  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  return (
    <form className="space-y-4 w-full" onSubmit={handleSignIn}>
      {error && <div className="p-3 bg-red-500/20 text-red-500 font-bold text-sm rounded-lg text-center">{error}</div>}
      <div>
        <input
          type="text"
          name="login"
          placeholder="Username or Email"
          className={inputStyles}
          value={formData.login}
          onChange={handleChange}
          required
        />
      </div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          className={inputStyles}
          value={formData.password}
          onChange={handleChange}
          required
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
          Remember me
        </label>
        <a href="#" className="font-semibold hover:underline">Forgot Password?</a>
      </div>

      <div className="pt-2">
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