import React from 'react';

const WelcomeLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-sesm-teal to-sesm-deep font-sans overflow-hidden">
      {children}
    </div>
  );
};

export default WelcomeLayout;