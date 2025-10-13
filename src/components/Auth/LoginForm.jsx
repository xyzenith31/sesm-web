// contoh-sesm-web/components/Auth/LoginForm.jsx

import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import Notification from '../Notification'; // <-- 1. Impor komponen notifikasi

const LoginForm = ({ onNavigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State untuk modal notifikasi
  const [notif, setNotif] = useState({
    isOpen: false,
    message: '',
    success: true,
  });

  const { login } = useAuth();
  const { navigate } = useNavigation();

  // Fungsi untuk menutup notifikasi dan navigasi jika sukses
  const handleNotifClose = () => {
    setNotif({ ...notif, isOpen: false });
    if (notif.success) {
      navigate('verifyCode', { identifier: identifier });
    }
  };

  const handleSignIn = (event) => {
    event.preventDefault();
    setLoading(true);

    login(identifier, password)
      .then(response => {
        setLoading(false);
        setNotif({
          isOpen: true,
          message: response.data.message,
          success: true,
        });
      })
      .catch((error) => {
        const resMessage =
          (error.response?.data?.message) ||
          error.message ||
          error.toString();
        
        setLoading(false);
        setNotif({
          isOpen: true,
          message: resMessage,
          success: false,
        });
      });
  };

  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  return (
    <>
      {/* --- 2. Render komponen Notifikasi --- */}
      <Notification
        isOpen={notif.isOpen}
        onClose={handleNotifClose}
        title={notif.success ? "Berhasil!" : "Gagal"}
        message={notif.message}
        success={notif.success}
      />

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
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600 hover:text-sesm-deep focus:outline-none"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        <div className="flex items-center justify-end text-sm px-1 text-white/90">
          <button
            type="button"
            onClick={() => onNavigate('forgotPassword')}
            className="font-semibold hover:underline"
          >
            Forget Password?
          </button>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Mengirim Kode...' : 'SIGN IN'}
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;