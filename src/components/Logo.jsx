import React from 'react';

const Logo = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 160 80"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <path
        id="book"
        d="M50,55 C40,65 20,65 10,55 L10,25 C20,35 40,35 50,25 L50,55 Z M50,55 C60,65 80,65 90,55 L90,25 C80,35 60,35 50,25 L50,55 Z"
        fill="white"
        stroke="#0C4B5E"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle id="head" cx="0" cy="-12" r="8" fill="#FFD97D" stroke="#0C4B5E" strokeWidth="1.5" />
      <path id="body" d="M-12,5 A12,12 0 0,1 12,5 L12,-5 A12,12 0 0,0 -12,-5 Z" fill="#E56D62" stroke="#0C4B5E" strokeWidth="1.5" />
      <g id="kid-center">
        <use xlinkHref="#body" />
        <use xlinkHref="#head" />
      </g>
    </defs>
    
    <circle cx="80" cy="30" r="30" fill="#FACC15" />

    {/* Kid on the left */}
    <g transform="translate(35, 45) scale(0.9) rotate(-10)">
      <path d="M-12,5 A12,12 0 0,1 12,5 L12,-5 A12,12 0 0,0 -12,-5 Z" fill="#E88D67" stroke="#0C4B5E" strokeWidth="1.5" />
      <circle cx="0" cy="-12" r="8" fill="#A16248" stroke="#0C4B5E" strokeWidth="1.5" />
    </g>

    {/* Kid on the right */}
    <g transform="translate(125, 45) scale(0.9) rotate(10)">
       <path d="M-15,10 Q-15,-20 0,-20 Q15,-20 15,10 Z" fill="#6DA5AA" stroke="#0C4B5E" strokeWidth="1.5"/>
       <path d="M-12,5 A12,12 0 0,1 12,5 L12,-5 A12,12 0 0,0 -12,-5 Z" fill="#AADAD5" stroke="#0C4B5E" strokeWidth="1.5" />
       <circle cx="0" cy="-12" r="8" fill="#FFD97D" stroke="#0C4B5E" strokeWidth="1.5" />
    </g>
    
    <g transform="translate(80, 45)">
      <use xlinkHref="#book" transform="translate(-50, -20)" />
      <use xlinkHref="#kid-center" />
    </g>

    <text
      x="80"
      y="75"
      fontFamily="Poppins, sans-serif"
      fontWeight="bold"
      fontSize="24"
      fill="#0C4B5E"
      textAnchor="middle"
    >
      SESM
    </text>
  </svg>
);

export default Logo;