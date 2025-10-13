import React, { useState } from 'react';
import { FiBookOpen, FiLogOut, FiHelpCircle, FiAlertTriangle } from 'react-icons/fi';
import Logo from '../../assets/logo.png';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen Modal Konfirmasi Logout
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
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

const NavLink = ({ icon, label, isActive, onClick, isLogout = false }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors duration-200 w-full text-left
      ${isActive
        ? 'bg-sesm-deep text-white shadow-lg'
        : isLogout
        ? 'text-red-600 hover:bg-red-50'
        : 'text-gray-600 hover:bg-sesm-sky/20 hover:text-sesm-deep'
      }
    `}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

const SidebarGuru = ({ activePage, onNavigate }) => {
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
            icon={<FiHelpCircle size={20} />}
            label="Manajemen Kuis"
            isActive={activePage === 'manajemenKuis'}
            onClick={() => onNavigate('manajemenKuis')}
          />
        </nav>
        <div className="p-4 border-t">
          <NavLink
              icon={<FiLogOut size={20} />}
              label="Logout"
              isLogout={true}
              onClick={() => setIsLogoutModalOpen(true)}
          />
        </div>
      </aside>
    </>
  );
};

export default SidebarGuru;