import React from 'react';
import AnimatedBackground from '../components/Auth/AnimatedBackground';

const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground /> 
      <div className="z-10 w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;