// contoh-sesm-web/components/navigation/SidebarGuru.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    FiBookOpen, FiLogOut, FiHelpCircle, FiAlertTriangle, FiUsers, FiBookmark, FiBook,
    FiUser, FiSettings, FiChevronDown, FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiGrid // FiGrid untuk ikon logo saat minimize
} from 'react-icons/fi';
import Logo from '../../assets/logo.png'; // Hanya gunakan logo utama
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

// --- Komponen Modal Konfirmasi Logout (Tetap sama) ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                                <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 mt-2">{message}</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                            <button
                                onClick={onConfirm}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                            >
                                Ya, Logout
                            </button>
                            <button
                                onClick={onClose}
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                            >
                                Batal
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Komponen NavLink Disesuaikan ---
const NavLink = ({ icon, label, isActive, onClick, isMinimized }) => (
    <motion.button
        onClick={onClick}
        className={`
          flex items-center space-x-3 h-11 rounded-md transition-colors duration-200 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sesm-teal focus-visible:ring-offset-1 group relative overflow-hidden
          ${isMinimized ? 'px-3 justify-center' : 'px-4'}
          ${isActive
            ? 'bg-sesm-teal text-white font-semibold shadow-sm' // Style Aktif (Mirip Gambar)
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium' // Style Non-Aktif
        }
        `}
        whileHover={{ backgroundColor: isActive ? '#0d9488' : '#f3f4f6' }} // Efek hover konsisten
        whileTap={{ scale: 0.98 }}
        title={isMinimized ? label : ''} // Tooltip saat minimize
    >
        {/* Ikon */}
        {React.cloneElement(icon, { size: 20, className: `flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'}` })}
        {/* Animasi Teks Label */}
        <AnimatePresence>
            {!isMinimized && (
                <motion.span
                    initial={{ opacity: 0, x: -10 }} // Animasi dari kiri
                    animate={{ opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } }}
                    exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                    className="flex-grow truncate whitespace-nowrap" // ml dihapus
                >
                    {label}
                </motion.span>
            )}
        </AnimatePresence>
    </motion.button>
);

// --- Komponen Dropdown Profil Disesuaikan ---
const ProfileDropdown = ({ user, activePage, onNavigate, onLogoutClick, isMinimized }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const API_URL = 'http://localhost:8080';

    useEffect(() => { /* ... (Hook useEffect untuk menutup dropdown, sama) ... */
        const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dropdownVariants = { /* ... (sama) ... */
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }
    };
    const itemVariants = { /* ... (sama) ... */
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 },
    };

    const getAvatarUrl = () => { /* ... (sama) ... */
        if (!user || !user.avatar) return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.nama || user?.username || 'G'}`;
        if (user.avatar.startsWith('http')) return user.avatar;
        return `${API_URL}/${user.avatar}`;
    };
    const isActive = activePage === 'teacherProfile'; // Hanya untuk styling dropdown item, bukan tombol utama

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                onClick={() => !isMinimized && setIsOpen(!isOpen)}
                className={`
                  flex items-center px-4 h-14 rounded-md transition-colors duration-200 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sesm-teal focus-visible:ring-offset-1 group relative
                  ${isMinimized ? 'justify-center' : 'space-x-3'}
                  ${isOpen && !isMinimized // Style saat dropdown terbuka (saat tidak minimize)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'
                 }
                `}
                whileHover={{ backgroundColor: isOpen && !isMinimized ? '#e5e7eb' : '#f3f4f6' }}
                whileTap={{ scale: 0.98 }}
                title={isMinimized ? (user?.nama || user?.username || 'Profil') : ''}
            >
                <img src={getAvatarUrl()} alt="Avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                <AnimatePresence>
                    {!isMinimized && (
                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } }} exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }} className="flex-grow truncate whitespace-nowrap">
                            {user?.nama || user?.username || 'Profil'}
                        </motion.span>
                    )}
                </AnimatePresence>
                {!isMinimized && (
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <FiChevronDown size={18} className={`flex-shrink-0 transition-colors ${isOpen ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'}`} />
                    </motion.div>
                )}
            </motion.button>

            {/* Konten Dropdown */}
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-10"
                    >
                        <motion.ul variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                            <motion.li variants={itemVariants}>
                                <button
                                    onClick={() => { onNavigate('teacherProfile'); setIsOpen(false); }}
                                    className={`flex items-center space-x-3 px-4 py-3 w-full text-left text-sm font-medium hover:bg-gray-100 transition-colors duration-150 ${isActive ? 'text-sesm-deep bg-sesm-sky/15' : 'text-gray-700'}`}
                                >
                                    <FiSettings size={16} className={isActive ? 'text-sesm-deep' : 'text-gray-500'} />
                                    <span>Setting Akun</span>
                                </button>
                            </motion.li>
                            <motion.li variants={itemVariants}>
                                <button
                                    onClick={() => { onLogoutClick(); setIsOpen(false); }}
                                    className="flex items-center space-x-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
                                >
                                    <FiLogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </motion.li>
                        </motion.ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Komponen Jam dan Tanggal ---
const ClockCalendar = ({ isMinimized }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000 * 60); // Update tiap menit
        return () => clearInterval(timerId);
    }, []);

    const formattedTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }); // Format sedikit berbeda

    return (
        <motion.div
            layout // Penting untuk animasi layout
            className={`px-4 pt-3 pb-2 border-t border-gray-100 ${isMinimized ? 'text-center' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
        >
            <AnimatePresence>
                {!isMinimized && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2, delay: 0.1 } }} exit={{ height: 0, opacity: 0, transition: { duration: 0.1 } }} className="overflow-hidden">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1"> {/* Warna lebih soft */}
                            <FiCalendar size={13}/>
                            <span className="text-xs font-medium ">{formattedDate}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={`flex items-center gap-1.5 ${isMinimized ? 'justify-center' : ''}`}>
                <FiClock size={14} className="text-gray-400"/> {/* Warna lebih soft */}
                <span className="text-sm font-semibold text-gray-600">{formattedTime}</span> {/* Warna lebih soft */}
            </div>
        </motion.div>
    );
};


// --- Komponen SidebarGuru Utama ---
const SidebarGuru = ({ activePage, onNavigate, isMinimized, toggleMinimize }) => {
    const { user, logout } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutConfirm = () => {
        setIsLogoutModalOpen(false);
        logout();
    };

    const sidebarVariants = {
        minimized: { width: '80px' }, // w-20
        maximized: { width: '256px' }, // w-64 (Lebar default gambar)
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
            {/* Sidebar Container */}
            <motion.aside
                variants={sidebarVariants}
                animate={isMinimized ? 'minimized' : 'maximized'}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="hidden md:flex flex-col h-screen bg-white shadow-sm fixed overflow-hidden border-r border-gray-200 z-30" // Shadow lebih soft
            >
                {/* Logo Section */}
                <div className="flex items-center justify-center h-20 border-b border-gray-100 flex-shrink-0 px-4 relative">
                    {/* Tombol Minimize/Maximize */}
                    <motion.button
                        layout
                        onClick={toggleMinimize}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-6 h-6 rounded-full bg-white border border-gray-300 shadow text-gray-500 hover:bg-gray-100 hover:text-sesm-deep flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sesm-teal"
                        title={isMinimized ? "Perbesar Sidebar" : "Perkecil Sidebar"}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1, rotate: 180 }} // Efek putar saat hover
                    >
                        {isMinimized ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
                    </motion.button>
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={isMinimized ? 'icon' : 'logo'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Gunakan ikon SESM saat minimize jika logo terlalu besar */}
                            {isMinimized ? (
                                <FiGrid size={24} className="text-sesm-deep" />
                            ) : (
                                <img src={Logo} alt="SESM Logo" className="h-10" />
                            )}
                        </motion.div>
                     </AnimatePresence>
                </div>

                {/* Navigation Section */}
                <motion.nav layout className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden"> {/* Spasi lebih kecil */}
                    <NavLink icon={<FiBookOpen />} label="Manajemen Materi" isActive={activePage === 'manajemenMateri'} onClick={() => onNavigate('manajemenMateri')} isMinimized={isMinimized} />
                    <NavLink icon={<FiBook />} label="Manajemen Cerita" isActive={activePage === 'manajemenCerita'} onClick={() => onNavigate('manajemenCerita')} isMinimized={isMinimized} />
                    <NavLink icon={<FiHelpCircle />} label="Manajemen Kuis" isActive={activePage === 'manajemenKuis'} onClick={() => onNavigate('manajemenKuis')} isMinimized={isMinimized} />
                    <NavLink icon={<FiBookmark />} label="Manajemen Bookmark" isActive={activePage === 'manajemenBookmark'} onClick={() => onNavigate('manajemenBookmark')} isMinimized={isMinimized} />
                    <NavLink icon={<FiUsers />} label="Manajemen Pengguna" isActive={activePage === 'manajemenPengguna'} onClick={() => onNavigate('manajemenPengguna')} isMinimized={isMinimized} />
                </motion.nav>

                {/* Clock & Calendar Section */}
                <ClockCalendar isMinimized={isMinimized} />

                {/* Profile/Logout Section */}
                <motion.div layout className="p-3 border-t border-gray-100">
                    <ProfileDropdown
                        user={user}
                        activePage={activePage}
                        onNavigate={onNavigate}
                        onLogoutClick={() => setIsLogoutModalOpen(true)}
                        isMinimized={isMinimized}
                    />
                </motion.div>
            </motion.aside>
        </>
    );
};

export default SidebarGuru;