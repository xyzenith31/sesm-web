// contoh-sesm-web/components/navigation/BottomNavBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    FiHome, FiSearch, FiBookmark, FiUser, FiLogOut, FiSettings,
    FiAlertTriangle, FiClock, FiCalendar
} from 'react-icons/fi'; // Hapus FiChevronUp jika tidak digunakan di tempat lain
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth'; // Impor useAuth
import CalenderModal from '../mod/CalenderModal'; // Impor CalenderModal

// --- Komponen Modal Konfirmasi Logout ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    // ... (Kode ConfirmationModal tetap sama)
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


// --- NavItem Biasa ---
const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 w-1/4 h-full ${isActive ? 'text-white scale-110' : 'text-sesm-sky'} hover:text-white transition-all duration-200`}>
        {/* PERBAIKAN: Beri container dengan tinggi tetap untuk ikon */}
        <div className="h-6 w-6 flex items-center justify-center">
             <Icon size={24} />
        </div>
        <span className="text-xs font-medium">{label}</span>
    </button>
);

// --- Komponen Dropdown Menu ---
const ProfileDropdownMenu = ({
    user,
    onNavigate,
    onLogoutClick,
    onCalendarClick,
    currentTime
}) => {
    // ... (Kode ProfileDropdownMenu tetap sama)
    const dropdownVariants = {
        hidden: { opacity: 0, y: 10, scaleY: 0.95 },
        visible: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.2, ease: 'easeOut' } },
        exit: { opacity: 0, y: 10, scaleY: 0.95, transition: { duration: 0.15, ease: 'easeIn' } }
    };

    return (
        <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-[calc(4rem+1.5rem)] inset-x-4 mx-auto w-[calc(100%-2rem)] max-w-sm bg-white rounded-xl shadow-lg border p-2 z-30 origin-bottom" // Posisi di atas navbar
        >
            {/* Jam & Kalender */}
            <div
                onClick={onCalendarClick}
                className="p-3 mb-2 rounded-lg cursor-pointer bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors relative overflow-hidden group"
                title="Buka Agenda"
            >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                />
                <div className="relative z-10">
                    <div className="flex items-center space-x-3">
                        <FiClock size={16} className="text-sesm-deep flex-shrink-0" />
                        <p className="font-semibold text-sm text-gray-800 tracking-wider">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-1">
                        <FiCalendar size={16} className="text-sesm-deep flex-shrink-0" />
                        <p className="text-xs text-gray-500 font-medium">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tombol Profil Saya */}
            <button onClick={() => onNavigate('profile')} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <FiUser size={16} />
                <span>Profil Saya</span>
            </button>

            {/* Tombol Pengaturan Akun */}
            <button onClick={() => onNavigate('accountSettings')} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <FiSettings size={16} />
                <span>Pengaturan Akun</span>
            </button>
            {/* Tombol Logout */}
            <button onClick={onLogoutClick} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                <FiLogOut size={16} />
                <span>Logout</span>
            </button>
        </motion.div>
    );
};


// --- Komponen Utama BottomNavBar ---
const BottomNavBar = ({ activePage, onNavigate }) => {
    const { user, logout } = useAuth(); // Ambil user dan logout
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State untuk modal kalender
    const [currentTime, setCurrentTime] = useState(new Date()); // State untuk jam
    const profileRef = useRef(null); // Ref untuk tombol profile/dropdown
    const API_URL = 'http://localhost:8080';

    // Timer untuk jam
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Menutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                const dropdownElement = document.querySelector('.fixed.bottom-\\[calc\\(4rem\\+1\\.5rem\\)\\]');
                if (!dropdownElement || !dropdownElement.contains(event.target)) {
                    setIsDropdownOpen(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleNavigation = (view) => {
        if (typeof onNavigate === 'function') {
            setIsDropdownOpen(false); // Tutup dropdown saat navigasi
            onNavigate(view);
        }
    };

    const handleLogoutConfirm = () => {
        setIsLogoutModalOpen(false);
        logout();
    };

    // Logika Avatar
    const defaultInitialAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.nama || user?.username || 'Siswa'}`;
    const userAvatar = user?.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `${API_URL}/${user.avatar}`)
        : defaultInitialAvatar;

    return (
        <>
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
                title="Konfirmasi Logout"
                message="Apakah Anda yakin ingin keluar?"
            />
            {/* Modal Kalender */}
            <CalenderModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />

            {/* Dropdown Menu (muncul di atas navbar) */}
            <AnimatePresence>
                {isDropdownOpen && user && (
                    <ProfileDropdownMenu
                        user={user}
                        onNavigate={handleNavigation}
                        onLogoutClick={() => { setIsDropdownOpen(false); setIsLogoutModalOpen(true); }}
                        onCalendarClick={() => { setIsDropdownOpen(false); setIsCalendarOpen(true); }}
                        currentTime={currentTime}
                    />
                )}
            </AnimatePresence>

            {/* Navbar Utama */}
            <div className="fixed md:hidden inset-x-0 bottom-4 mx-auto w-[calc(100%-2rem)] max-w-sm h-16 bg-gradient-to-t from-sesm-deep to-sesm-teal rounded-full shadow-lg z-20 overflow-hidden">
                <div className="flex justify-around items-center h-full">
                    <NavItem
                        icon={FiHome} // Pass component reference
                        label="Home"
                        isActive={activePage === 'home'}
                        onClick={() => handleNavigation('home')}
                    />
                    <NavItem
                        icon={FiSearch} // Pass component reference
                        label="Explore"
                        isActive={activePage === 'explore'}
                        onClick={() => handleNavigation('explore')}
                    />
                    <NavItem
                        icon={FiBookmark} // Pass component reference
                        label="Bookmark"
                        isActive={activePage === 'bookmark'}
                        onClick={() => handleNavigation('bookmark')}
                    />

                    {/* Profile Button / Dropdown Trigger */}
                    <div ref={profileRef} className="relative w-1/4 h-full flex items-center justify-center">
                        <button
                            onClick={() => {
                                if (user) setIsDropdownOpen(!isDropdownOpen);
                                else handleNavigation('login');
                            }}
                            className={`flex flex-col items-center justify-center space-y-1 w-full h-full rounded-full transition-all duration-200 ${
                                (activePage === 'profile' || activePage === 'accountSettings' || isDropdownOpen) ? 'text-white scale-110' : 'text-sesm-sky'
                            } hover:text-white`}
                        >
                            {/* PERBAIKAN: Container untuk Avatar/Ikon dengan tinggi tetap */}
                            <div className="relative h-6 w-6 flex items-center justify-center">
                                {user ? (
                                    <img
                                        src={userAvatar}
                                        alt="Profil"
                                        // PERBAIKAN: Ukuran disesuaikan agar pas di container h-6 w-6
                                        className="w-full h-full rounded-full object-cover border border-white/40 shadow-sm"
                                        onError={(e) => e.target.src = defaultInitialAvatar}
                                    />
                                ) : (
                                    <FiUser size={24} /> // Ukuran ikon tetap 24px
                                )}
                            </div>
                            <span className="text-xs font-medium pt-0.5"> {/* Sedikit padding top untuk teks */}
                                Profile
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BottomNavBar;