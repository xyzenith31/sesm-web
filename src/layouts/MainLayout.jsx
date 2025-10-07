import React from 'react';
import SideBar from '../components/SideBar';
import BottomNavBar from '../components/BottomNavBar';

const MainLayout = ({ children, currentPage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Meneruskan prop 'currentPage' yang benar */}
      <SideBar currentPage={currentPage} onNavigate={onNavigate} />
      
      <main className="md:ml-64 pb-28 md:pb-0">
        {children}
      </main>

      {/* Meneruskan prop 'currentPage' yang benar */}
      <BottomNavBar currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
};

export default MainLayout;