import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth'; // <-- Ganti impor ini

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nama: '',
    umur: '',
    password: '',
    konfirmasi_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth(); // <-- Gunakan hook untuk mendapatkan fungsi register

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    register(formData) // <-- Panggil fungsi register dari hook
      .then(response => {
        setMessage(response.data.message + " Anda akan diarahkan ke halaman login.");
        setSuccessful(true);
        setLoading(false);
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      })
      .catch(error => {
        const resMessage = (error.response?.data?.message) || error.message || error.toString();
        setMessage(resMessage);
        setSuccessful(false);
        setLoading(false);
      });
  };

  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  return (
    <form className="space-y-4 w-full" onSubmit={handleRegister}>
      {/* Input Fields */}
      <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} className={inputStyles} required />
      <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange} className={inputStyles} required />
      <input type="text" placeholder="Nama Lengkap" name="nama" value={formData.nama} onChange={handleInputChange} className={inputStyles} required />
      <input type="number" placeholder="Umur" name="umur" value={formData.umur} onChange={handleInputChange} className={inputStyles} required />
      
      {/* Password Fields */}
      <div className="relative">
        <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" value={formData.password} onChange={handleInputChange} className={inputStyles} required />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">{showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
      </div>
      <div className="relative">
        <input type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi Password" name="konfirmasi_password" value={formData.konfirmasi_password} onChange={handleInputChange} className={inputStyles} required />
        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">{showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
      </div>
      
      <div className="pt-2">
        <button type="submit" className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:bg-gray-400" disabled={loading}>
          {loading ? 'Mendaftar...' : 'REGISTER'}
        </button>
      </div>

      {message && (<div className={`p-3 rounded-lg text-center font-bold ${successful ? 'bg-green-500/80' : 'bg-red-500/80'} text-white`}>{message}</div>)}
    </form>
  );
};

export default RegisterForm;