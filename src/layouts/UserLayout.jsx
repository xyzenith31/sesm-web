import React from 'react';
import SideBar from '../components/navigation/SideBar';
import BottomNavBar from '../components/navigation/BottomNavBar';

const UserLayout = ({ children, user, onLogout }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SideBar untuk desktop */}
      <div className="hidden md:flex">
        <SideBar user={user} onLogout={onLogout} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 md:pb-0">
          {/* Cukup render children seperti biasa */}
          {children}
        </main>
      </div>

      {/* BottomNavBar untuk mobile */}
      <div className="md:hidden">
          <BottomNavBar user={user} />
      </div>
    </div>
  );
};

export default UserLayout;