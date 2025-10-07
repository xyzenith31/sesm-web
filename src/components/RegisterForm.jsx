import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. GANTI PROPS DENGAN useNavigate
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthService from '../services/auth.service'; // 2. PAKAI AuthService BIAR KONSISTEN

// 3. Hapus props 'onLoginSuccess'
const LoginForm = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Tambahkan state loading
  const navigate = useNavigate(); // 4. Panggil hook navigasi

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    // 5. Gunakan AuthService untuk login
    AuthService.login(formData.login, formData.password).then(
      () => {
        // Jika berhasil, AuthService sudah menyimpan data user
        // Langsung pindah ke homepage
        navigate('/home');
      },
      (err) => {
        // Logika untuk menampilkan error
        const resMessage =
          (err.response &&
            err.response.data &&
            err.response.data.message) ||
          err.message ||
          'Tidak bisa terhubung ke server. Pastikan server sudah jalan.';
        
        setError(resMessage);
        setLoading(false);
      }
    );
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
          className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:opacity-70"
          disabled={loading} // Tambahkan disabled saat loading
        >
          {loading ? 'LOADING...' : 'SIGN IN'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;