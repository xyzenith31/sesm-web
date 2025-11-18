import React from 'react';
import SidebarGuru from '../components/navigation/SidebarGuru';

const AdminLayout = ({ children, activePage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      <SidebarGuru activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="flex-1 p-8 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;