import React from 'react';
import SideBar from '../components/SideBar';
import BottomNavBar from '../components/BottomNavBar';

// Layout ini akan menerima halaman sebagai 'children'
// dan fungsi navigasi serta halaman aktif saat ini
const MainLayout = ({ children, activePage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Sidebar untuk Desktop */}
      <SideBar activePage={activePage} onNavigate={onNavigate} />

      {/* Area Konten Utama */}
      <main className="md:ml-64">
        {children}
      </main>

      {/* Navigasi Bawah untuk Mobile */}
      <BottomNavBar activePage={activePage} onNavigate={onNavigate} />
    </div>
  );
};

export default MainLayout;