import React from 'react';
import SideBar from '../components/SideBar';
import BottomNavBar from '../components/BottomNavBar';

const MainLayout = ({ children, activePage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SideBar activePage={activePage} onNavigate={onNavigate} />
      <main className="md:ml-64 pb-28 md:pb-0">
        {children}
      </main>

      <BottomNavBar activePage={activePage} onNavigate={onNavigate} />
    </div>
  );
};

export default MainLayout;