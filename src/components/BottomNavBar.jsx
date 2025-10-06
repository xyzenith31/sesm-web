import React from 'react';
import { FiHome, FiSearch, FiBookmark, FiUser } from 'react-icons/fi';

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 ${isActive ? 'text-white' : 'text-sesm-sky'} hover:text-white transition-colors`}>
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNavBar = ({ activePage, onNavigate }) => {
  // Fungsi ini akan memeriksa apakah onNavigate adalah fungsi sebelum memanggilnya.
  // Jika tidak, tidak akan terjadi apa-apa (dan tidak ada error).
  const handleNavigation = (view) => {
    if (typeof onNavigate === 'function') {
      onNavigate(view);
    }
  };

  return (
    <div className="fixed md:hidden inset-x-0 bottom-4 mx-auto w-[calc(100%-2rem)] max-w-sm h-20 bg-sesm-deep rounded-full shadow-lg z-20">
      <div className="flex justify-around items-center h-full">
        <NavItem
            icon={<FiHome size={24} />}
            label="Home"
            isActive={activePage === 'home'}
            onClick={() => handleNavigation('home')}
        />
        <NavItem
            icon={<FiSearch size={24} />}
            label="Explore"
            isActive={activePage === 'explore'}
            onClick={() => handleNavigation('explore')}
        />
        <NavItem
            icon={<FiBookmark size={24} />}
            label="Bookmark"
            isActive={activePage === 'bookmark'}
            onClick={() => handleNavigation('bookmark')}
        />
        <NavItem
            icon={<FiUser size={24} />}
            label="Profile"
            isActive={activePage === 'profile'}
            onClick={() => handleNavigation('profile')}
        />
      </div>
    </div>
  );
};

export default BottomNavBar;