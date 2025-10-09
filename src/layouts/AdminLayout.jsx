import React from 'react';
import SidebarGuru from '../components/admin/SidebarGuru';

const AdminLayout = ({ children, activePage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Meneruskan `activePage` ke Sidebar */}
      <SidebarGuru activePage={activePage} onNavigate={onNavigate} />
      <main className="md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;