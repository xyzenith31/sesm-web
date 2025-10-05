import React from 'react';

/**
 * Layout khusus untuk Welcome Page dengan latar belakang gradien.
 * Komponen ini hanya menyediakan wadah visual tanpa mengatur posisi children.
 */
const WelcomeLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-sesm-teal to-sesm-deep font-sans overflow-hidden">
      {children}
    </div>
  );
};

export default WelcomeLayout;