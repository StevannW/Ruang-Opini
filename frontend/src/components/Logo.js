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
      {/* Outer Circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="url(#logoGradient)"
        opacity="0.1"
      />
      
      {/* Government building pillars (simplified) */}
      <g opacity="0.3">
        <rect x="30" y="55" width="8" height="20" fill="url(#logoGradient)" rx="1"/>
        <rect x="46" y="55" width="8" height="20" fill="url(#logoGradient)" rx="1"/>
        <rect x="62" y="55" width="8" height="20" fill="url(#logoGradient)" rx="1"/>
        <rect x="25" y="75" width="50" height="4" fill="url(#logoGradient)" rx="2"/>
      </g>
      
      {/* Scales of Justice - Balance Beam */}
      <line
        x1="30"
        y1="45"
        x2="70"
        y2="45"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      
      {/* Center Support */}
      <line
        x1="50"
        y1="25"
        x2="50"
        y2="45"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      
      {/* Left Scale Pan */}
      <path
        d="M 25 45 L 30 50 L 35 45 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      <ellipse
        cx="30"
        cy="51"
        rx="7"
        ry="3"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
      />
      
      {/* Right Scale Pan */}
      <path
        d="M 65 45 L 70 50 L 75 45 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      <ellipse
        cx="70"
        cy="51"
        rx="7"
        ry="3"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2"
      />
      
      {/* Top ornament - Shield shape */}
      <path
        d="M 50 20 Q 45 20 42 23 L 42 28 Q 42 33 50 36 Q 58 33 58 28 L 58 23 Q 55 20 50 20 Z"
        fill="url(#logoGradient)"
        opacity="0.8"
        filter="url(#glow)"
      />
      
      {/* Center dot accent */}
      <circle
        cx="50"
        cy="28"
        r="2.5"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

export default Logo;
