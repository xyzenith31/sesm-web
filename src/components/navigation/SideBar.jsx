// contoh-sesm-web/components/navigation/SideBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FiHome, FiSearch, FiBookmark, FiUser, FiLogOut, FiChevronDown, FiSettings, FiClock, FiCalendar } from 'react-icons/fi';
import Logo from '../../assets/logo.png';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import CalenderModal from '../mod/CalenderModal'; // Impor modal kalender
import ConfirmationModal from '../mod/ConfirmationModal'; // Impor modal konfirmasi

// -- Komponen-komponen Internal --

// Tombol navigasi utama
const NavLink = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors duration-200 w-full text-left
      ${isActive
        ? 'bg-sesm-deep text-white shadow-lg'
        : 'text-gray-600 hover:bg-sesm-sky/20 hover:text-sesm-deep'
      }
    `}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

// Dropdown untuk profil pengguna di bagian bawah
const ProfileDropdown = ({ user, onNavigate, onLogoutClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const API_URL = 'http://localhost:8080';

    // Efek untuk menutup dropdown saat klik di luar area
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Menentukan avatar pengguna
    const userAvatar = user.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `${API_URL}/${user.avatar}`)
        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.nama || user.username}`;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Tombol utama untuk membuka dropdown */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <img src={userAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                <div className="flex-grow text-left overflow-hidden">
                    <p className="font-bold text-sm text-gray-800 truncate">{user.nama || user.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.jenjang || 'Siswa'}</p>
                </div>
                <FiChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* Konten dropdown yang muncul/hilang */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full left-0 right-0 mb-2 w-full bg-white rounded-lg shadow-xl border p-2 z-10"
                    >
                        <button onClick={() => { onNavigate('accountSettings'); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                            <FiSettings size={16} />
                            <span>Pengaturan Akun</span>
                        </button>
                        <button onClick={onLogoutClick} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                            <FiLogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// -- Komponen Utama Sidebar --

const SideBar = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Efek untuk update jam setiap detik
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    logout();
    onNavigate('login'); // Arahkan ke halaman login setelah logout
  };

  // Jika tidak ada user, jangan render sidebar
  if (!user) {
      return null;
  }

  return (
    <>
      {/* Modal yang akan muncul */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari akun Anda?"
      />
      <CalenderModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />

      {/* Tampilan Sidebar untuk Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white shadow-xl fixed">
        <div className="flex items-center justify-center p-6 border-b">
          <img src={Logo} alt="SESM Logo" className="w-32" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            icon={<FiHome size={20} />}
            label="Home"
            isActive={activePage === 'home'}
            onClick={() => onNavigate('home')}
          />
          <NavLink
            icon={<FiSearch size={20} />}
            label="Explore"
            isActive={activePage === 'explore'}
            onClick={() => onNavigate('explore')}
          />
          <NavLink
            icon={<FiBookmark size={20} />}
            label="Bookmark"
            isActive={activePage === 'bookmark'}
            onClick={() => onNavigate('bookmark')}
          />
          <NavLink
            icon={<FiUser size={20} />}
            label="Profile"
            isActive={activePage === 'profile'}
            onClick={() => onNavigate('profile')}
          />
        </nav>
        <div className="p-4 border-t space-y-3">
            {/* Fitur Jam & Kalender */}
            <div
                onClick={() => setIsCalendarOpen(true)}
                className="p-3 rounded-lg cursor-pointer bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                title="Buka Agenda"
            >
                <div className="flex items-center space-x-3">
                    <FiClock size={18} className="text-sesm-deep flex-shrink-0" />
                    <p className="font-semibold text-base text-gray-800 tracking-wider">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                    <FiCalendar size={18} className="text-sesm-deep flex-shrink-0" />
                     <p className="text-xs text-gray-500 font-medium">
                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            {/* Dropdown Profil Pengguna */}
            <ProfileDropdown
                user={user}
                onNavigate={onNavigate}
                onLogoutClick={() => setIsLogoutModalOpen(true)}
            />
        </div>
      </aside>
    </>
  );
};

export default SideBar;