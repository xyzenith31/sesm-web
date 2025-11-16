import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import Notification from '../ui/Notification';

const LoginForm = ({ onNavigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [notif, setNotif] = useState({
    isOpen: false,
    message: '',
    success: true,
  });

  const { login } = useAuth();
  const { navigate } = useNavigation();

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
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputStyles}
            required
          />
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