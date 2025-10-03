import React from 'react';
import SideBar from '../components/SideBar';

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Sidebar untuk Desktop */}
      <SideBar />

      {/* Area Konten Utama */}
      {/* Margin kiri `md:ml-64` akan aktif di desktop untuk memberi ruang bagi sidebar */}
      <main className="md:ml-64">
        {/* Halaman (children) akan dirender di sini */}
        {children}
      </main>
    </div>
  );
};

export default UserLayout;