import React, { useState, useEffect } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import Notification from '../ui/Notification';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', nama: '', umur: '',
    password: '', konfirmasi_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // State untuk modal notifikasi
  const [notif, setNotif] = useState({
    isOpen: false,
    message: '',
    success: true,
  });

  const { register } = useAuth();
  const { navigate } = useNavigation();
  const debouncedUsername = useDebounce(formData.username, 500);
  const debouncedEmail = useDebounce(formData.email, 500);

  const allowedDomains = [
    '@gmail.com', '@yahoo.com', '@outlook.com', '@icloud.com', '@hotmail.com', 
    '@aol.com', '@protonmail.com', '@zoho.com', '@mail.com', '@gmx.com', 
    '@yandex.com', '@tutanota.com', '@me.com', '@fastmail.com', '@hushmail.com', 
    '@inbox.com', '@rocketmail.com', '@live.com', '@ovi.com', '@telkom.net', 
    '@cbn.net.id', '@indo.net.id', '@plasa.com'
  ];

  useEffect(() => {
    if (debouncedUsername) {
      const usernameRegex = /^[a-z0-9_.-]+$/;
      if (!usernameRegex.test(debouncedUsername)) setUsernameError("Username tidak boleh ada spasi atau huruf besar.");
      else setUsernameError('');
    } else setUsernameError('');
  }, [debouncedUsername]);

  useEffect(() => {
    if (debouncedEmail) {
      const emailDomain = debouncedEmail.substring(debouncedEmail.lastIndexOf('@'));
      if (debouncedEmail.includes('@') && !allowedDomains.includes(emailDomain.toLowerCase())) setEmailError("Domain email tidak didukung.");
      else setEmailError('');
    } else setEmailError('');
  }, [debouncedEmail]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'username') value = value.replace(/\s/g, '');
    setFormData({ ...formData, [name]: value });
  };

  const handleNotifClose = () => {
    setNotif({ ...notif, isOpen: false });
    if (notif.success) {
      navigate('verifyCode', { identifier: formData.email });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (usernameError || emailError) {
      setNotif({ isOpen: true, message: "Perbaiki dulu error pada formulir.", success: false });
      return;
    }

    setLoading(true);
    register(formData)
      .then(response => {
        setLoading(false);
        setNotif({ isOpen: true, message: response.data.message, success: true });
      })
      .catch(error => {
        const resMessage = (error.response?.data?.message) || error.message || error.toString();
        setLoading(false);
        setNotif({ isOpen: true, message: resMessage, success: false });
      });
  };
  
  const getInputStyle = (error) => `w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none transition-all duration-300 placeholder:text-gray-500 ${error ? 'ring-2 ring-red-400 border-red-500' : 'focus:ring-4 focus:ring-sesm-sky/50'}`;
  const ErrorMessage = ({ error }) => (<AnimatePresence>{error && (<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-1 text-xs font-semibold text-red-200 mt-1 ml-1"><FiAlertCircle /> {error}</motion.p>)}</AnimatePresence>);

  return (
    <>
      <Notification
        isOpen={notif.isOpen}
        onClose={handleNotifClose}
        title={notif.success ? "Registrasi Berhasil!" : "Terjadi Kesalahan"}
        message={notif.message}
        success={notif.success}
      />

      <form className="space-y-4 w-full" onSubmit={handleRegister}>
        <div>
          <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} className={getInputStyle(usernameError)} required />
          <ErrorMessage error={usernameError} />
        </div>
        <div>
          <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange} className={getInputStyle(emailError)} required />
          <ErrorMessage error={emailError} />
        </div>

        <input type="text" placeholder="Nama Lengkap" name="nama" value={formData.nama} onChange={handleInputChange} className={getInputStyle(false)} required />
        <input type="number" placeholder="Umur" name="umur" value={formData.umur} onChange={handleInputChange} className={getInputStyle(false)} required />
        
        <div>
          <input type="password" placeholder="Password" name="password" value={formData.password} onChange={handleInputChange} className={getInputStyle(false)} required />
        </div>
        <div>
          <input type="password" placeholder="Konfirmasi Password" name="konfirmasi_password" value={formData.konfirmasi_password} onChange={handleInputChange} className={getInputStyle(false)} required />
        </div>
        
        <div className="pt-2">
          <button type="submit" className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:bg-gray-400" disabled={loading}>
            {loading ? 'Mendaftar...' : 'REGISTER'}
          </button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;