import React from 'react';

const ICIcon = ({ size = 20, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ verticalAlign: 'middle', marginBottom: '2px' }}
    >
      <circle cx="12" cy="12" r="10" fill="url(#ic-gradient)" stroke="url(#ic-border)" strokeWidth="1.5" />
      <path 
        d="M9 7H11V17H9V7ZM13 7H15C16.1046 7 17 7.89543 17 9V10.5C17 11.3284 16.3284 12 15.5 12V12C16.3284 12 17 12.6716 17 13.5V15C17 16.1046 16.1046 17 15 17H13V7ZM15 10.5V9H14.5V10.5H15ZM15 15V13.5H14.5V15H15Z" 
        fill="white" 
      />
      <defs>
        <linearGradient id="ic-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A2463" />
          <stop offset="1" stopColor="#00B4D8" />
        </linearGradient>
        <linearGradient id="ic-border" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ICIcon;
