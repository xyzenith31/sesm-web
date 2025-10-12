import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import Card from '../components/Card';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthService from '../services/authService';
import { useAuth } from '../hooks/useAuth'; // Impor useAuth

const ResetPasswordPage = ({ code, onPasswordReset }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  
  const { handleAuthentication } = useAuth(); // Ambil fungsi dari hook

  const itemContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Password dan Konfirmasi Password tidak cocok.");
      setSuccessful(false);
      return;
    }

    setLoading(true);
    setMessage('');
    setSuccessful(false);

    AuthService.resetPassword(code, password, confirmPassword)
      .then(response => {
        setMessage(response.data.message);
        setSuccessful(true);
        setLoading(false);
        
        // --- LOGIKA LOGIN OTOMATIS DI SINI ---
        handleAuthentication(response.data); 
        // --- BATAS LOGIKA LOGIN OTOMATIS ---

        setTimeout(() => {
          onPasswordReset(); // Pindah ke homepage
        }, 2000);
      })
      .catch(error => {
        const resMessage = (error.response?.data?.message) || error.message || error.toString();
        setMessage(resMessage);
        setSuccessful(false);
        setLoading(false);
      });
  };

  return (
    <AuthLayout>
      <Card>
        <motion.div
          className="flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={itemContainerVariants}
        >
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white text-center mb-2">
            Atur Password Baru
          </motion.h1>
          <motion.p variants={itemVariants} className="text-white/80 text-center mb-6 text-sm max-w-xs">
            Pastikan password baru Anda kuat dan mudah diingat.
          </motion.p>

          <motion.form variants={itemVariants} className="w-full space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Password Baru" className={inputStyles} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">{showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
            </div>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi Password Baru" className={inputStyles} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">{showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Ganti Password'}
              </button>
            </div>
          </motion.form>

          {message && (
            <motion.div 
              variants={itemVariants} 
              className={`p-3 mt-4 rounded-lg text-center font-bold w-full ${successful ? 'bg-green-500/80' : 'bg-red-500/80'} text-white`}
            >
              {message}
            </motion.div>
          )}
        </motion.div>
      </Card>
    </AuthLayout>
  );
};

export default ResetPasswordPage;