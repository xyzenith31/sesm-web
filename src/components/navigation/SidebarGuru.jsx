// contoh-sesm-web/components/navigation/SidebarGuru.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FiBookOpen, FiLogOut, FiHelpCircle, FiAlertTriangle, FiUsers, FiBookmark, FiBook, FiUser, FiChevronDown, FiSettings, FiClock, FiCalendar } from 'react-icons/fi';
import Logo from '../../assets/logo.png';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import CalenderModal from '../mod/CalenderModal';

// Komponen Modal Konfirmasi Logout (tidak berubah)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4"><FiAlertTriangle className="h-6 w-6 text-yellow-600" /></div>
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 mt-2">{message}</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                            <button onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Ya, Logout</button>
                            <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

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

// Komponen Profile Dropdown (tidak berubah)
const ProfileDropdown = ({ user, onNavigate, onLogoutClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const API_URL = 'http://localhost:8080';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userAvatar = user.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `${API_URL}/${user.avatar}`)
        : `https://api.dicebear.com/7.x/initials/svg?seed=${user.nama || user.username}`;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <img src={userAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                <div className="flex-grow text-left overflow-hidden">
                    <p className="font-bold text-sm text-gray-800 truncate">{user.nama || user.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <FiChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full left-0 right-0 mb-2 w-full bg-white rounded-lg shadow-xl border p-2 z-10"
                    >
                        <button onClick={() => { onNavigate('teacherProfile'); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
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

const SidebarGuru = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari akun guru?"
      />
      <CalenderModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />

      <aside className="hidden md:flex flex-col w-64 h-screen bg-white shadow-xl fixed">
        <div className="flex items-center justify-center p-6 border-b">
          <img src={Logo} alt="SESM Logo" className="w-32" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            icon={<FiBookOpen size={20} />}
            label="Manajemen Materi"
            isActive={activePage === 'manajemenMateri'}
            onClick={() => onNavigate('manajemenMateri')}
          />
          <NavLink
            icon={<FiBook size={20} />}
            label="Manajemen Cerita"
            isActive={activePage === 'manajemenCerita'}
            onClick={() => onNavigate('manajemenCerita')}
          />
          <NavLink
            icon={<FiHelpCircle size={20} />}
            label="Manajemen Kuis"
            isActive={activePage === 'manajemenKuis'}
            onClick={() => onNavigate('manajemenKuis')}
          />
          <NavLink
            icon={<FiBookmark size={20} />}
            label="Manajemen Bookmark"
            isActive={activePage === 'manajemenBookmark'}
            onClick={() => onNavigate('manajemenBookmark')}
          />
          <NavLink
            icon={<FiUsers size={20} />}
            label="Manajemen Pengguna"
            isActive={activePage === 'manajemenPengguna'}
            onClick={() => onNavigate('manajemenPengguna')}
          />
        </nav>
        
        <div className="p-4 border-t space-y-3">
            {/* --- DESAIN ULANG JAM & TANGGAL --- */}
            <div
                onClick={() => setIsCalendarOpen(true)}
                className="p-3 rounded-lg cursor-pointer bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                title="Buka Agenda"
            >
                <div className="flex items-center space-x-3">
                    <FiClock size={18} className="text-sesm-deep flex-shrink-0" />
                    <p className="font-semibold text-base text-gray-800 tracking-wider">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                    <FiCalendar size={18} className="text-sesm-deep flex-shrink-0" />
                     <p className="text-xs text-gray-500 font-medium">
                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Profile Dropdown */}
            {user && (
                <ProfileDropdown 
                    user={user} 
                    onNavigate={onNavigate} 
                    onLogoutClick={() => setIsLogoutModalOpen(true)}
                />
            )}
        </div>
      </aside>
    </>
  );
};

export default SidebarGuru;