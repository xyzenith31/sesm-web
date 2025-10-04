import React from 'react';
import SideBar from '../components/SideBar';

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SideBar />

      <main className="md:ml-64">
        {children}
      </main>
    </div>
  );
};

export default UserLayout;