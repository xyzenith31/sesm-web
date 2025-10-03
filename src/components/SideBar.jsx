import React from 'react';
import { FiHome, FiSearch, FiBookmark, FiUser, FiLogOut } from 'react-icons/fi';
import Logo from '../assets/logo.png';

// Komponen kecil untuk setiap link navigasi
const NavLink = ({ icon, label, isActive }) => (
  <a
    href="#"
    className={`
      flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors duration-200
      ${isActive
        ? 'bg-sesm-deep text-white shadow-lg'
        : 'text-gray-600 hover:bg-sesm-sky/20 hover:text-sesm-deep'
      }
    `}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </a>
);

const SideBar = () => {
  return (
    // 'hidden md:flex' -> Sembunyikan di mobile, tampilkan (display: flex) di desktop
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white shadow-xl fixed">
      <div className="flex items-center justify-center p-6 border-b">
        <img src={Logo} alt="SESM Logo" className="w-32" />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink icon={<FiHome size={20} />} label="Home" isActive />
        <NavLink icon={<FiSearch size={20} />} label="Explore" />
        <NavLink icon={<FiBookmark size={20} />} label="Bookmark" />
        <NavLink icon={<FiUser size={20} />} label="Profile" />
      </nav>
      <div className="p-4 border-t">
        <NavLink icon={<FiLogOut size={20} />} label="Logout" />
      </div>
    </aside>
  );
};

export default SideBar;