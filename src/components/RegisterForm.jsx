import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

// Komponen RegisterForm yang sudah dihubungkan ke backend
const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nama: '', // Backend kita pakai 'nama', bukan 'nama lengkap'
    umur: '',
    password: '',
    konfirmasi_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Style input yang konsisten
  const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi frontend sederhana
    if (formData.password !== formData.konfirmasi_password) {
      setError('Password dan konfirmasi password tidak cocok!');
      return;
    }

    try {
      // Panggil API register di backend
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        username: formData.username,
        email: formData.email,
        nama: formData.nama,
        umur: formData.umur,
        password: formData.password,
        konfirmasi_password: formData.konfirmasi_password,
      });

      // Jika berhasil
      setSuccess(response.data.message + ' Silakan login.');
      // Otomatis pindah ke halaman login setelah 2 detik
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);

    } catch (err) {
      // Jika ada error dari backend
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registrasi gagal. Coba lagi nanti.');
      }
    }
  };

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit}>
      {error && <div className="p-3 bg-red-500/20 text-red-500 font-bold text-sm rounded-lg text-center">{error}</div>}
      {success && <div className="p-3 bg-green-500/20 text-green-500 font-bold text-sm rounded-lg text-center">{success}</div>}

      <input type="text" name="username" placeholder="Username" className={inputStyles} value={formData.username} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" className={inputStyles} value={formData.email} onChange={handleChange} required />
      <input type="text" name="nama" placeholder="Nama Lengkap" className={inputStyles} value={formData.nama} onChange={handleChange} required />
      <input type="number" name="umur" placeholder="Umur" className={inputStyles} value={formData.umur} onChange={handleChange} required />

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

      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="konfirmasi_password"
          placeholder="Konfirmasi Password"
          className={inputStyles}
          value={formData.konfirmasi_password}
          onChange={handleChange}
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

      <div className="pt-2">
        <button
          type="submit"
          className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95"
        >
          REGISTER
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;