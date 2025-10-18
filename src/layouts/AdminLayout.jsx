// contoh-sesm-web/layouts/AdminLayout.jsx
import React from 'react';
import SidebarGuru from '../components/navigation/SidebarGuru';

const AdminLayout = ({ children, activePage, onNavigate }) => {
  return (
    // PERBAIKAN: Mengubah div utama menjadi flexbox dengan tinggi layar penuh
    <div className="min-h-screen bg-gray-100 font-sans flex">
      <SidebarGuru activePage={activePage} onNavigate={onNavigate} />
      {/* PERBAIKAN: Layout utama untuk konten di sebelah kanan sidebar */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* PERBAIKAN: Area konten utama yang akan diisi oleh children */}
        <main className="flex-1 p-8 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;