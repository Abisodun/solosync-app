import React from 'react';

export default function Logo({ className = "w-10 h-10" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#93C5FD', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Main Circle - S shape */}
      <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" opacity="0.2" />
      
      {/* Stylized S */}
      <path
        d="M 35 30 Q 25 25, 25 35 Q 25 45, 50 50 Q 75 55, 75 65 Q 75 75, 65 70"
        stroke="url(#logoGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Sync Arrow Circles */}
      <circle cx="70" cy="30" r="8" fill="url(#accentGradient)" />
      <circle cx="30" cy="70" r="8" fill="#86EFAC" />
      
      {/* Connection Lines */}
      <path
        d="M 68 32 L 52 48"
        stroke="url(#accentGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 48 52 L 32 68"
        stroke="#86EFAC"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}