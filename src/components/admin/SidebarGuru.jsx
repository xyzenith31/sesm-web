import React from 'react';
// 1. Tambah ikon FiAward
import { FiBookOpen, FiLogOut, FiTrendingUp, FiHelpCircle, FiAward } from 'react-icons/fi';
import Logo from '../../assets/logo.png';
import { useAuth } from '../../hooks/useAuth';

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

const SidebarGuru = ({ activePage, onNavigate }) => {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
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
        <NavLink
          icon={<FiTrendingUp size={20} />}
          label="Manajemen Nilai"
          isActive={activePage === 'manajemenNilai'}
          onClick={() => onNavigate('manajemenNilai')}
        />
        {/* --- ▼▼▼ TAMBAHKAN NAVLINK BARU INI DI SINI ▼▼▼ --- */}
        <NavLink
          icon={<FiAward size={20} />}
          label="Evaluasi Kuis"
          isActive={activePage === 'evaluasiKuis'}
          onClick={() => onNavigate('evaluasiKuis')}
        />
      </nav>
      <div className="p-4 border-t">
        <NavLink
            icon={<FiLogOut size={20} />}
            label="Logout"
            onClick={handleLogout}
        />
      </div>
    </aside>
  );
};

export default SidebarGuru;