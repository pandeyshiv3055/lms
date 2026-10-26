import React from 'react';

interface PresenterIllustrationProps {
  className?: string;
  children: React.ReactNode;
}

export const PresenterBoard: React.FC<PresenterIllustrationProps> = ({ className = '', children }) => {
  return (
    <div
      className={`presenter-stage-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '24px',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        position: 'relative',
      }}
    >
      {/* Instructor / Presenter Avatar Figure on the Left */}
      <div
        style={{
          flex: '0 0 240px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 240 460"
          style={{ width: '100%', height: '100%', maxHeight: '440px' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="uniformGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#173B3A" />
              <stop offset="100%" stopColor="#102928" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E5C7A3" />
              <stop offset="100%" stopColor="#C9A37C" />
            </linearGradient>
          </defs>

          {/* Shadows */}
          <ellipse cx="120" cy="445" rx="70" ry="12" fill="rgba(0,0,0,0.25)" />

          {/* Legs & Security Trousers */}
          <path d="M85 320 L75 435 L105 435 L115 320 Z" fill="#242C2D" />
          <path d="M125 320 L135 435 L165 435 L155 320 Z" fill="#242C2D" />
          {/* Polished Tactical Boots */}
          <rect x="68" y="430" width="40" height="15" rx="4" fill="#111617" />
          <rect x="132" y="430" width="40" height="15" rx="4" fill="#111617" />

          {/* Torso & Professional Officer Uniform */}
          <path d="M60 170 L180 170 L165 320 L75 320 Z" fill="url(#uniformGrad)" stroke="#215150" strokeWidth="2" />
          {/* Tactical Duty Belt & Brass Buckle */}
          <rect x="70" y="305" width="100" height="18" fill="#1B1E1F" rx="2" />
          <rect x="110" y="305" width="20" height="18" fill="#B87955" rx="2" />

          {/* Epaulettes & Gold Bars */}
          <rect x="55" y="165" width="30" height="10" rx="2" fill="#B87955" />
          <rect x="155" y="165" width="30" height="10" rx="2" fill="#B87955" />

          {/* Officer Chest Badge */}
          <path d="M80 195 L95 195 L90 215 L80 215 Z" fill="#D49B65" stroke="#FFFFFF" strokeWidth="0.5" />
          <rect x="135" y="195" width="30" height="10" rx="1" fill="#FFFFFF" />
          <text x="150" y="203" fill="#173B3A" fontSize="7" fontWeight="bold" textAnchor="middle">
            AEGIS
          </text>

          {/* Neck & Tie */}
          <polygon points="110,140 130,140 126,170 114,170" fill="url(#skinGrad)" />
          <polygon points="116,165 124,165 128,240 120,260 112,240" fill="#242C2D" />

          {/* Head & Face */}
          <ellipse cx="120" cy="115" rx="28" ry="32" fill="url(#skinGrad)" />
          {/* Professional Hair */}
          <path d="M92 105 Q120 75 148 105 Q152 80 120 78 Q88 80 92 105 Z" fill="#2E241E" />
          {/* Eyes & Smile */}
          <circle cx="109" cy="112" r="3" fill="#1C2424" />
          <circle cx="131" cy="112" r="3" fill="#1C2424" />
          <path d="M112 130 Q120 138 128 130" fill="none" stroke="#A86E4B" strokeWidth="2" strokeLinecap="round" />

          {/* Left Arm (Relaxed at side) */}
          <path d="M60 170 L40 260 L50 280 L70 200 Z" fill="url(#uniformGrad)" />
          <circle cx="48" cy="285" r="10" fill="url(#skinGrad)" />

          {/* Right Arm EXTENDED POINTING TO THE BOARD */}
          <path d="M180 175 Q215 170 230 185" fill="none" stroke="url(#uniformGrad)" strokeWidth="24" strokeLinecap="round" />
          {/* Hand pointing with index finger */}
          <circle cx="232" cy="186" r="12" fill="url(#skinGrad)" />
          <line x1="230" y1="184" x2="242" y2="182" stroke="url(#skinGrad)" strokeWidth="6" strokeLinecap="round" />
        </svg>

        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            backgroundColor: 'rgba(23, 59, 58, 0.95)',
            border: '1px solid #B87955',
            padding: '4px 12px',
            borderRadius: '999px',
            color: '#F5F2EA',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Senior Instructor Marcus Vance
        </div>
      </div>

      {/* The Interactive Presentation Board on the Right */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '2px solid #E5E0D5',
          boxShadow: '0 8px 24px rgba(24, 30, 31, 0.08)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
};
