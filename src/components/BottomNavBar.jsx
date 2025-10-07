import React from 'react';
import { FiHome, FiSearch, FiBookmark, FiUser } from 'react-icons/fi';

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 ${isActive ? 'text-white' : 'text-sesm-sky'} hover:text-white transition-colors`}>
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// Menggunakan 'currentPage' sebagai prop
const BottomNavBar = ({ currentPage, onNavigate }) => {
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
            // Memeriksa dengan 'currentPage'
            isActive={currentPage === 'home'}
            onClick={() => handleNavigation('home')}
        />
        <NavItem
            icon={<FiSearch size={24} />}
            label="Explore"
            // Memeriksa dengan 'currentPage'
            isActive={currentPage === 'explore'}
            onClick={() => handleNavigation('explore')}
        />
        <NavItem
            icon={<FiBookmark size={24} />}
            label="Bookmark"
            // Memeriksa dengan 'currentPage'
            isActive={currentPage === 'bookmark'}
            onClick={() => handleNavigation('bookmark')}
        />
        <NavItem
            icon={<FiUser size={24} />}
            label="Profile"
            // Memeriksa dengan 'currentPage'
            isActive={currentPage === 'profile'}
            onClick={() => handleNavigation('profile')}
        />
      </div>
    </div>
  );
};

export default BottomNavBar;