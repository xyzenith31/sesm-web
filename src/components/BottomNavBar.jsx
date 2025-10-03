import React from 'react';
import { FiHome, FiSearch, FiBookmark, FiUser } from 'react-icons/fi';

const NavItem = ({ icon, label, isActive }) => (
  <a href="#" className={`flex flex-col items-center justify-center space-y-1 ${isActive ? 'text-white' : 'text-sesm-sky'} hover:text-white transition-colors`}>
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </a>
);

const BottomNavBar = () => {
  return (
    <div className="fixed inset-x-0 bottom-4 mx-auto w-[calc(100%-2rem)] max-w-sm h-20 bg-sesm-deep rounded-full shadow-lg z-20">
      <div className="flex justify-around items-center h-full">
        <NavItem icon={<FiHome size={24} />} label="Home" isActive />
        <NavItem icon={<FiSearch size={24} />} label="Explore" />
        <NavItem icon={<FiBookmark size={24} />} label="Bookmark" />
        <NavItem icon={<FiUser size={24} />} label="Profile" />
      </div>
    </div>
  );
};

export default BottomNavBar;