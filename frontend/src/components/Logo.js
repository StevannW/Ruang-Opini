import React from 'react';

function Logo({ className = "w-10 h-10", darkMode = false }) {
  const primaryColor = darkMode ? "#667eea" : "#5b68e8";
  const accentColor = darkMode ? "#f093fb" : "#e84c88";
  
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="url(#logoGradient)"
        opacity="0.1"
      />
      
      {/* Parliament Building */}
      {/* Dome */}
      <ellipse
        cx="50"
        cy="30"
        rx="18"
        ry="12"
        fill="url(#logoGradient)"
        opacity="0.8"
      />
      
      {/* Main Building */}
      <rect
        x="32"
        y="35"
        width="36"
        height="25"
        fill="url(#logoGradient)"
        opacity="0.9"
      />
      
      {/* Columns */}
      <rect x="35" y="40" width="4" height="20" fill="url(#logoGradient)" />
      <rect x="44" y="40" width="4" height="20" fill="url(#logoGradient)" />
      <rect x="52" y="40" width="4" height="20" fill="url(#logoGradient)" />
      <rect x="61" y="40" width="4" height="20" fill="url(#logoGradient)" />
      
      {/* Base */}
      <rect
        x="28"
        y="60"
        width="44"
        height="8"
        fill="url(#logoGradient)"
      />
      
      {/* Steps */}
      <rect
        x="24"
        y="68"
        width="52"
        height="4"
        fill="url(#logoGradient)"
        opacity="0.7"
      />
      <rect
        x="20"
        y="72"
        width="60"
        height="4"
        fill="url(#logoGradient)"
        opacity="0.5"
      />
    </svg>
  );
}

export default Logo;
