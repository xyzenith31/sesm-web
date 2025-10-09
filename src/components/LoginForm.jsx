import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

// Prop 'onLoginSuccess' sudah dihapus karena tidak lagi diperlukan
const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // State ini hanya untuk pesan error

  const { login } = useAuth();

  const handleSignIn = (event) => {
    event.preventDefault();
    setMessage(''); // Selalu bersihkan pesan error di awal
    setLoading(true);

    login(identifier, password)
      .then(() => {
      })
      .catch((error) => {
        // Bagian ini hanya akan berjalan jika login GAGAL
        const resMessage =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();
        
        setMessage(resMessage); // Tampilkan pesan error dari server
        setLoading(false);      // Hentikan loading
      });
  };

  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  return (
    <form className="space-y-4 w-full" onSubmit={handleSignIn}>
      <div>
        <input
          type="text"
          placeholder="Username atau Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className={inputStyles}
          required
        />
      </div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputStyles}
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
          Remember
        </label>
        <a href="#" className="font-semibold hover:underline">Forget Password?</a>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'SIGN IN'}
        </button>
      </div>
      
      {/* Pesan ini sekarang hanya akan muncul jika ada error dari server */}
      {message && (
         <div className="p-3 mt-4 rounded-lg text-center font-bold bg-red-500/80 text-white">
          {message}
        </div>
      )}
    </form>
  );
};

export default LoginForm;