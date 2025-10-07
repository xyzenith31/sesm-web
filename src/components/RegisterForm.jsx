import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthService from '../services/auth.service';

const RegisterForm = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Style input yang konsisten
  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      await AuthService.register(
        formData.username,
        formData.email,
        formData.fullName,
        formData.phone,
        formData.password
      );
      // Jika berhasil, navigasi ke halaman login
      onNavigate('login');
    } catch (err) {
      const resMessage =
        (err.response &&
          err.response.data &&
          err.response.data.message) ||
        err.message ||
        err.toString();

      setError(resMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className={inputStyles} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputStyles} required />
      <input type="text" name="fullName" placeholder="Nama Lengkap" value={formData.fullName} onChange={handleChange} className={inputStyles} required />
      <input type="tel" name="phone" placeholder="No. HP" value={formData.phone} onChange={handleChange} className={inputStyles} required />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
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

      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Konfirmasi Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={inputStyles}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500"
        >
          {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'MENDAFTAR...' : 'REGISTER'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;