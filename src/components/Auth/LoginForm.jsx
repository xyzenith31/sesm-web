import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation'; // Impor useNavigation

const LoginForm = ({ onNavigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const { login } = useAuth();
  const { navigate } = useNavigation(); // Dapatkan fungsi navigate

  const handleSignIn = (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    setSuccessful(false);

    login(identifier, password)
      .then(response => {
        setMessage(response.data.message);
        setSuccessful(true);
        setLoading(false);
        // Arahkan ke halaman verifikasi setelah 1.5 detik
        setTimeout(() => {
            navigate('verifyCode', { identifier: identifier });
        }, 1500);
      })
      .catch((error) => {
        const resMessage =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();
        
        setMessage(resMessage);
        setLoading(false);
        setSuccessful(false);
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
      
      {message && (
         <div className={`p-3 mt-4 rounded-lg text-center font-bold ${successful ? 'bg-green-500/80' : 'bg-red-500/80'} text-white`}>
          {message}
        </div>
      )}
    </form>
  );
};

export default LoginForm;